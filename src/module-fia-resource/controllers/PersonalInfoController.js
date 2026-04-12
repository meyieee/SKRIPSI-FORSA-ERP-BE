// src/module-hr/controllers/PersonalInfoController.js
const { Op } = require("sequelize");
const EmpReg = require("../../module-hr/models/tbl_emp_regs");

const toStr = (v) => (v === null || v === undefined ? "" : String(v));

const normalizeSpaces = (s) => toStr(s).replace(/\s+/g, " ").trim();

const buildFullName = (row) =>
  normalizeSpaces(
    [row.first_name, row.middle_name, row.last_name].filter(Boolean).join(" ")
  ) ||
  normalizeSpaces(row.nick_name) ||
  toStr(row.id_number);

const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  // contoh: 12 Mar 1992
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(dt);
};

async function getLoginEmp(reqUser, sequelizeInstance) {
  const Emp = sequelizeInstance?.models?.tbl_emp_regs || EmpReg;

  const directIdNumber =
    reqUser?.id_number ||
    reqUser?.idNumber ||
    reqUser?.emp_id_number ||
    reqUser?.empIdNumber;

  if (directIdNumber) {
    return await Emp.findOne({
      where: { id_number: String(directIdNumber).trim() },
      attributes: [
        "id_number",
        "job_level",
        "individual_level",
        "first_name",
        "middle_name",
        "last_name",
        "nick_name",
      ],
    });
  }

  const key = reqUser?._id;
  return await Emp.findOne({
    where: {
      [Op.or]: [
        { id: key },
        { id_number: String(key ?? "").trim() },
      ],
    },
    attributes: [
      "id_number",
      "job_level",
      "individual_level",
      "first_name",
      "middle_name",
      "last_name",
      "nick_name",
    ],
  });
}

function getEmployeeHierarchyLevel(empRow) {
  if (!empRow) return null;

  const candidates = [empRow.individual_level, empRow.job_level];
  for (const raw of candidates) {
    const level = Number(raw);
    if (Number.isFinite(level)) return level;
  }
  return null;
}

function canAccessEmployee(loginLevel, targetLevel) {
  if (loginLevel === null) return false;
  if (targetLevel === null) return loginLevel > 0;
  return targetLevel < loginLevel;
}

// sesuai rule kamu:
// - field varchar(15) yang dianggap FK dan masih kosong -> "To be linked"
const toLinked = (v) => {
  const s = toStr(v).trim();
  return s ? s : "To be linked";
};

// field FE tapi tidak ada di tabel -> "To be build"
const toBuild = () => "To be build";

// ambil value label dari include detail (kalau ada)
// fallback: kalau kolom kodenya kosong => To be linked, kalau ada kode tapi detail belum ada => tetap tampil kode
const pickDetailLabel = (row, detailKey, labelKey, rawFallback) => {
  const detail = row?.[detailKey];
  const label = detail ? toStr(detail[labelKey]).trim() : "";
  if (label) return label;
  return rawFallback;
};

module.exports = {
  getSearchCapability: async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });

      const loginEmp = await getLoginEmp(req.user, EmpReg.sequelize);
      const loginLevel = getEmployeeHierarchyLevel(loginEmp);

      return res.status(200).json({
        message: "OK",
        data: {
          canSearchEmployee: loginLevel !== null && loginLevel > 0,
          hierarchyLevel: loginLevel,
          idNumber: toStr(loginEmp?.id_number),
        },
      });
    } catch (err) {
      console.error("getSearchCapability error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  /**
   * GET /api/hr/personal-info/search?q=...
   * Autocomplete dropdown seperti Create E-Task (Assigned To)
   */
  searchEmployees: async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });

      const q = normalizeSpaces(req.query.q);
      if (!q) return res.status(200).json({ message: "OK", data: [] });

      const loginEmp = await getLoginEmp(req.user, EmpReg.sequelize);
      const loginLevel = getEmployeeHierarchyLevel(loginEmp);
      const loginIdNumber = toStr(loginEmp?.id_number).trim();

      if (loginLevel === null) {
        return res
          .status(400)
          .json({ message: "Unable to determine your employee level" });
      }

      const rows = await EmpReg.findAll({
        where: {
          [Op.or]: [
            { id_number: { [Op.like]: `%${q}%` } },
            { first_name: { [Op.like]: `%${q}%` } },
            { middle_name: { [Op.like]: `%${q}%` } },
            { last_name: { [Op.like]: `%${q}%` } },
            { nick_name: { [Op.like]: `%${q}%` } },
            { email_company: { [Op.like]: `%${q}%` } },
            { personal_email: { [Op.like]: `%${q}%` } },
          ],
        },
        attributes: [
          "id_number",
          "first_name",
          "middle_name",
          "last_name",
          "nick_name",
          "email_company",
          "photo",
          "job_level",
          "individual_level",
        ],
        limit: 50,
        order: [["id_number", "ASC"]],
      });

      const data = rows
        .filter((r) => {
          const candidateLevel = getEmployeeHierarchyLevel(r);
          const candidateIdNumber = toStr(r.id_number).trim();
          if (candidateIdNumber === loginIdNumber) return false;
          return canAccessEmployee(loginLevel, candidateLevel);
        })
        .map((r) => ({
          id_number: toStr(r.id_number),
          full_name: buildFullName(r),
          email: toStr(r.email_company) || toStr(r.personal_email) || "",
          photo: toStr(r.photo) || "",
        }));

      return res.status(200).json({ message: "OK", data });
    } catch (err) {
      console.error("searchEmployees error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  /**
   * GET /api/hr/personal-info/:idNumber
   * Return object untuk tab Personal Data / Job Info / Job Service / Dependent / Kin
   */
  getPersonalInfo: async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });

      const { idNumber } = req.params;
      if (!idNumber)
        return res.status(400).json({ message: "idNumber is required" });

      const loginEmp = await getLoginEmp(req.user, EmpReg.sequelize);
      const loginLevel = getEmployeeHierarchyLevel(loginEmp);
      const loginIdNumber = toStr(loginEmp?.id_number).trim();

      // include relasi sesuai associate() yang kamu punya
      const row = await EmpReg.findOne({
        where: { id_number: String(idNumber) },
        include: [
          {
            association: "reg_by_detail",
            required: false,
            attributes: [
              "id_number",
              "first_name",
              "middle_name",
              "last_name",
              "nick_name",
            ],
          },

          { association: "employee_type_detail", required: false },
          { association: "emplyoee_class_detail", required: false },
          { association: "employment_type_detail", required: false },

          { association: "branch_detail", required: false },
          { association: "com_detail", required: false },
          { association: "department_detail", required: false },
          { association: "cost_center_detail", required: false },
          { association: "account_detail", required: false },
          { association: "job_title_detail", required: false },
          { association: "locwork_detail", required: false },
        ],
      });

      if (!row) return res.status(404).json({ message: "Employee not found" });

      const targetIdNumber = toStr(row.id_number).trim();
      if (targetIdNumber !== loginIdNumber) {
        const targetLevel = getEmployeeHierarchyLevel(row);
        if (!canAccessEmployee(loginLevel, targetLevel)) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }

      // ===== HEADER (bagian atas) =====
      // supervisor di tabel kamu adalah varchar(15) tapi relasinya ke supervisor belum ada (di associate kamu, supervisor tidak di-join)
      const header = {
        idNumber: toStr(row.id_number),
        fullName: buildFullName(row),
        email:
          toStr(row.email_company) || toStr(row.personal_email) || toBuild(),
        photo: toStr(row.photo) || "",

        supervisor: toLinked(row.supervisor), // belum ada join ke master -> To be linked jika kosong
        department: pickDetailLabel(
          row,
          "department_detail",
          "dept_name",
          toLinked(row.dept_code)
        ),
        employeeType: pickDetailLabel(
          row,
          "employee_type_detail",
          "emp_desc",
          toLinked(row.employee_type)
        ),
      };

      // ===== PERSONAL DATA TAB =====
      const personalData = {
        idNumber: toStr(row.id_number),
        firstName: toStr(row.first_name),
        middleName: toStr(row.middle_name),
        lastName: toStr(row.last_name),

        nickName: toStr(row.nick_name),
        gender: toStr(row.gender),
        dateOfBirth: fmtDate(row.date_of_birth),
        placeOfBirth: toStr(row.point_of_birth),

        maritalStatus: toStr(row.marital_status),
        religion: toStr(row.religion),
        nationality: toStr(row.nationality),
        ethnic: toStr(row.ethnic),
        ktp: toStr(row.identity_ktp),

        address: toStr(row.address),
        city: toStr(row.city),
        subDistrict: toStr(row.sub_district),
        district: toStr(row.district),
        province: toStr(row.province),
        country: toStr(row.country),
        postcode: toStr(row.post_code),
        homePhone: toStr(row.home_phone),
        personalEmail: toStr(row.personal_email),

        bloodType: toStr(row.blood_type),
        height: toStr(row.height),
        weight: toStr(row.weight),
        medication: toStr(row.medication),
        allergies: toStr(row.allergies),
        chronicHistory: toStr(row.chronic_medical_history),

        status: toStr(row.status),
        statusDate: fmtDate(row.status_date),

        // reg_by adalah FK ke tbl_emp_regs (sudah ada relasi reg_by_detail)
        registerBy: row.reg_by_detail
          ? buildFullName(row.reg_by_detail)
          : toLinked(row.reg_by),
        registerDate: fmtDate(row.reg_date),
      };

      // ===== JOB INFO TAB =====
      const jobInfo = {
        jobTitle: pickDetailLabel(
          row,
          "job_title_detail",
          "desc",
          toLinked(row.job_title)
        ), // labelKey tergantung struktur table master, kalau beda nanti kamu tinggal ganti
        positionTitle: toStr(row.position_title),
        workFunction: toStr(row.work_function),
        jobLevel: toStr(row.job_level),
        individualGrade: toStr(row.individual_grade),
        individualLevel: toStr(row.individual_level),

        employeeType: pickDetailLabel(
          row,
          "employee_type_detail",
          "emp_desc",
          toLinked(row.employee_type)
        ),
        employeeClass: pickDetailLabel(
          row,
          "emplyoee_class_detail",
          "class_desc",
          toLinked(row.employee_class)
        ),
        employmentType: pickDetailLabel(
          row,
          "employment_type_detail",
          "desc",
          toLinked(row.employment_type)
        ),

        supervisor: toLinked(row.supervisor),
        onsiteMarital: toStr(row.onsite_marital),
        benefitMarital: toStr(row.marital_benefit),

        hireDate: fmtDate(row.hire_date),
        serviceDate: fmtDate(row.service_date),
        probationDate: fmtDate(row.probation_date),
        pointOfHire: toStr(row.point_of_hire),
        pointOfLeave: toStr(row.point_of_leave),
        pointOfTravel: toStr(row.point_of_travel),

        onsiteLocation: toLinked(row.onsite_location),
        onsiteAddress: toStr(row.onsite_address),

        workLocation: pickDetailLabel(
          row,
          "locwork_detail",
          "locwork_desc",
          toLinked(row.work_location)
        ),
        officeNo: toLinked(row.office_code),

        // di UI kamu tampil "Company / Employee Company / Department ..."
        company: toBuild(), // tidak ada kolom nama company langsung di tbl_emp_regs (yang ada kode + join ke com_detail)
        employeeCompany: pickDetailLabel(
          row,
          "com_detail",
          "com_name",
          toLinked(row.emp_company)
        ),
        department: pickDetailLabel(
          row,
          "department_detail",
          "dept_name",
          toLinked(row.dept_code)
        ),
        costCenter: pickDetailLabel(
          row,
          "cost_center_detail",
          "c_desc",
          toLinked(row.cost_center)
        ),
        accountCode: pickDetailLabel(
          row,
          "account_detail",
          "account_name",
          toLinked(row.account_code)
        ),
        unionCode: toLinked(row.union_code),

        workPhone: toStr(row.work_phone),
        mobile: toStr(row.mobile),
        wa: toStr(row.wa),
        emailCompany: toStr(row.email_company),
      };

      // ===== JOB SERVICE TAB =====
      const jobService = {
        paygroup: toStr(row.paygroup),
        bankAccount: toStr(row.bank_account),
        leaveType: toStr(row.leave_type),
        unionNo: toBuild(), // UI ada union no, di table cuma union_code

        workInsurance: toStr(row.work_insurance),
        medicalInsurance: toStr(row.medical_insurance),
        taxCode: toStr(row.tax_code),

        workDay: toStr(row.work_day),
        crew: toStr(row.crew),
        lastPromotion: fmtDate(row.last_promotion),

        contractNo: toStr(row.contract_no),
        contractDate: fmtDate(row.contract_date),
        contractExpire: fmtDate(row.contract_expire),
      };

      // ===== KIN TAB =====
      // Catatan: di model kamu belum ada kin_* field (dari struktur tabel kamu ada), tapi model kamu memang tidak mendefine.
      // Maka sesuai logic: FE butuh Kin, tapi kolom tidak ada di model => "To be build"
      const kin = [
        {
          no: 1,
          fullName: toBuild(),
          relationship: toBuild(),
          address: toBuild(),
          phone: toBuild(),
          wa: toBuild(),
          email: toBuild(),
        },
      ];

      // ===== DEPENDENT TAB (belum ada tabel) =====
      const dependents = [
        {
          idDep: "To be linked",
          fullName: "To be linked",
          gender: "To be linked",
          relationship: "To be linked",
          onsite: "To be linked",
          expatDep: "To be linked",
          maritalStatus: "To be linked",

          position: "To be linked",
          placeOfBirth: "To be linked",
          dateOfBirth: "To be linked",
          age: "To be linked",
          religion: "To be linked",
          remarks: "To be linked",

          address: "To be linked",
          city: "To be linked",
          state: "To be linked",
          zip: "To be linked",

          phone1: "To be linked",
          phone2: "To be linked",
          email: "To be linked",
          handicapped: "To be linked",
          student: "To be linked",
          employeeId: "To be linked",
        },
      ];

      return res.status(200).json({
        message: "OK",
        data: { header, personalData, jobInfo, jobService, dependents, kin },
      });
    } catch (err) {
      console.error("getPersonalInfo error:", err);
      return res.status(500).json({ message: err.message });
    }
  },
};
