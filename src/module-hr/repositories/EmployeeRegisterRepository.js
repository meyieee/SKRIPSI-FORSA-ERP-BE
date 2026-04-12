const EmployeeRegister = require("../models/tbl_emp_regs");
const Section = require("../../module-cf-master/models/adm_cf_11_depts_section");
const { Op } = require('sequelize')
const { getModelEmployeeRegister, getModelEmployeeClass, getModelEmployeeType, getModelDepartment, getModelAccount, getModelCostCenter, getModelCom, getModelEmploymentType, getModelPostTitle, getModelLockWork } = require('../../function/getIncludeModels')
const { getAttributeEmployeeFullName } = require('../../function/getIncludeAtributes');

const normalizeDateValue = (value, fallback = null) => {
  if (value === undefined || value === null) return fallback
  const trimmed = String(value).trim()
  if (!trimmed) return fallback
  const parsed = new Date(trimmed)
  if (Number.isNaN(parsed.getTime())) return fallback
  return trimmed
}

const normalizeStringValue = (value, fallback = '-') => {
  if (value === undefined || value === null) return fallback
  const trimmed = String(value).trim()
  if (!trimmed) return fallback
  return trimmed
}

const buildEmployeeRegisterPayload = (params, reqFile, employeePhoto = null) => {
  const today = new Date().toISOString().slice(0, 10)
  const defaultDate = normalizeDateValue(params.reg_date, today)
  const requiredText = (value) => normalizeStringValue(value, '-')
  const optionalText = (value) => normalizeStringValue(value, '-')

  return {
    id_number: normalizeStringValue(params.id_number, ''),
    first_name: optionalText(params.first_name),
    middle_name: optionalText(params.middle_name),
    last_name: optionalText(params.last_name),
    nick_name: optionalText(params.nick_name),
    gender: optionalText(params.gender),
    date_of_birth: normalizeDateValue(params.date_of_birth, defaultDate),
    point_of_birth: optionalText(params.point_of_birth),
    marital_status: optionalText(params.marital_status),
    religion: optionalText(params.religion),
    nationality: optionalText(params.nationality),
    ethnic: optionalText(params.ethnic),
    status: normalizeStringValue(params.status, 'Active'),
    status_date: normalizeDateValue(params.status_date, defaultDate),
    reg_by: normalizeStringValue(params.reg_by, params.id_number || '-'),
    reg_date: defaultDate,
    address: optionalText(params.address),
    city: optionalText(params.city),
    sub_district: optionalText(params.sub_district),
    district: optionalText(params.district),
    region: optionalText(params.region),
    province: optionalText(params.province),
    country: optionalText(params.country),
    post_code: optionalText(params.post_code),
    blood_type: optionalText(params.blood_type),
    height: optionalText(params.height),
    weight: optionalText(params.weight),
    medication: optionalText(params.medication),
    allergies: optionalText(params.allergies),
    chronic_medical_history: optionalText(params.chronic_medical_history),
    identity_ktp: optionalText(params.identity_ktp),
    home_phone: optionalText(params.home_phone),
    personal_email: optionalText(params.personal_email),
    photo: reqFile
      ? `images/${reqFile.filename}`
      : employeePhoto,

    applicant_id: optionalText(params.applicant_id),
    position_no: optionalText(params.position_no),
    approval_no: optionalText(params.approval_no),
    id_number_ref: optionalText(params.id_number_ref),
    hire_date: normalizeDateValue(params.hire_date, defaultDate),
    service_date: normalizeDateValue(params.service_date, defaultDate),
    probation_date: normalizeDateValue(params.probation_date, defaultDate),
    point_of_hire: optionalText(params.point_of_hire),
    point_of_leave: optionalText(params.point_of_leave),
    point_of_travel: optionalText(params.point_of_travel),
    contract_no: optionalText(params.contract_no),
    contract_date: normalizeDateValue(params.contract_date, defaultDate),
    contract_expire: normalizeDateValue(params.contract_expire, defaultDate),
    job_title: optionalText(params.job_title),
    position_title: optionalText(params.position_title),
    work_function: optionalText(params.work_function),
    job_level: optionalText(params.job_level),
    individual_grade: optionalText(params.individual_grade),
    individual_level: optionalText(params.individual_level),
    employee_type: optionalText(params.employee_type),
    employee_class: optionalText(params.employee_class),
    employment_type: optionalText(params.employment_type),
    supervisor: optionalText(params.supervisor),
    branch_code: requiredText(params.branch_code),
    emp_company: requiredText(params.emp_company),
    dept_code: requiredText(params.dept_code),
    section_code: normalizeStringValue(params.section_code, ''),
    cost_center: requiredText(params.cost_center),
    account_code: optionalText(params.account_code),
    union_code: optionalText(params.union_code),
    onsite_location: optionalText(params.onsite_location),
    onsite_address: optionalText(params.onsite_address),
    work_location: optionalText(params.work_location),
    office_code: optionalText(params.office_code),
    onsite_marital: optionalText(params.onsite_marital),
    marital_benefit: optionalText(params.marital_benefit),
    work_phone: optionalText(params.work_phone),
    mobile: optionalText(params.mobile),
    wa: optionalText(params.wa),
    email_company: optionalText(params.email_company),
    website: optionalText(params.website),
    termination_date: normalizeDateValue(params.termination_date, defaultDate),
    termination_by: optionalText(params.termination_by),
    termination_reason: optionalText(params.termination_reason),

    paygroup: optionalText(params.paygroup),
    bank_account: optionalText(params.bank_account),
    leave_type: optionalText(params.leave_type),
    work_insurance: optionalText(params.work_insurance),
    medical_insurance: optionalText(params.medical_insurance),
    tax_code: optionalText(params.tax_code),
    work_day: optionalText(params.work_day),
    crew: optionalText(params.crew),
    last_promotion: normalizeDateValue(params.last_promotion, defaultDate),
    remarks: normalizeStringValue(params.remarks, ''),

    kin_fullname: optionalText(params.kin_fullname),
    kin_relationship: optionalText(params.kin_relationship),
    kin_fulladdress: optionalText(params.kin_fulladdress ?? params.kin_address),
    kin_phone: optionalText(params.kin_phone),
    kin_fullname2: optionalText(params.kin_fullname2),
    kin_relationship2: optionalText(params.kin_relationship2),
    kin_fulladdress2: optionalText(params.kin_fulladdress2 ?? params.kin_address2),
    kin_phone2: optionalText(params.kin_phone2),
  }
}

const getSectionInclude = () => ({
  model: Section,
  as: 'section_detail',
  attributes: ['section_code', 'section_description'],
  required: false,
})

module.exports = {
 getAllEmployeeGroupedByDeptRepository : async () => {
    const employees = await EmployeeRegister.findAll({
      order: [['id', 'DESC']],
      raw: true,
      include:[
        getModelEmployeeRegister('reg_by_detail'),
        getModelEmployeeClass('emplyoee_class_detail'),
        getModelEmployeeType('employee_type_detail'),
        getModelDepartment('department_detail'),
        getSectionInclude(),
        getModelAccount('account_detail'),
        getModelCostCenter('cost_center_detail'),
        getModelCom('com_detail'),
        getModelCom('branch_detail'),
        getModelEmploymentType('employment_type_detail'),
        getModelPostTitle('job_title_detail'),
        getModelLockWork('locwork_detail')
      ],
      attributes: {
        include:[
          [getAttributeEmployeeFullName('reg_by_detail'), 'reg_by_name'],
        ]
      }
    });
  
    return employees.reduce((acc, emp) => {
      if (!acc[emp.dept_code]) acc[emp.dept_code] = [];
      acc[emp.dept_code].push(emp);
      return acc;
    }, {});
  },

  getAllEmployeeByBranchGroupedByDeptRepository : async (branch_code) => {
    const employees = await EmployeeRegister.findAll({
      order: [['id', 'DESC']],
      raw: true,
      where:{branch_code},
      include:[
        getModelEmployeeRegister('reg_by_detail'),
        getModelEmployeeClass('emplyoee_class_detail'),
        getModelEmployeeType('employee_type_detail'),
        getModelDepartment('department_detail'),
        getSectionInclude(),
        getModelAccount('account_detail'),
        getModelCostCenter('cost_center_detail'),
        getModelCom('com_detail'),
        getModelCom('branch_detail'),
        getModelEmploymentType('employment_type_detail'),
        getModelPostTitle('job_title_detail'),
        getModelLockWork('locwork_detail')
      ],
      attributes: {
        include:[
          [getAttributeEmployeeFullName('reg_by_detail'), 'reg_by_name'],
        ]
      }
    });
  
    return employees.reduce((acc, emp) => {
      if (!acc[emp.dept_code]) acc[emp.dept_code] = [];
      acc[emp.dept_code].push(emp);
      return acc;
    }, {});
  },

  getEmployeeRegisterByIdNumberRepository: async (id_number) =>{
   return await EmployeeRegister.findOne({
      raw: true,
      where: {id_number},
      attributes:['id', 'id_number']
    })
  },

  getEmployeeRegisterByIdNumberExcludeCurrentIdRepository: async (id_number, id)=>{
    return await EmployeeRegister.findOne({
        where: { id_number, [Op.not]: {id}},
        attributes:['id', 'id_number']
    })
  },

  getExistingEmployeeByIdRepository: async (id) =>{
    return await EmployeeRegister.findOne({
        where: {id},
        attributes:['id', 'id_number', 'photo','branch_code']
    })
  },

  getEmployeeRegisterByIdRepository: async (id) =>{
    return await EmployeeRegister.findOne({
      where: {id},
      raw: true,
      include:[
        getModelEmployeeRegister('reg_by_detail'),
        getModelEmployeeClass('emplyoee_class_detail'),
        getModelEmployeeType('employee_type_detail'),
        getModelDepartment('department_detail'),
        getSectionInclude(),
        getModelAccount('account_detail'),
        getModelCostCenter('cost_center_detail'),
        getModelCom('com_detail'),
        getModelCom('branch_detail'),
        getModelEmploymentType('employment_type_detail'),
        getModelPostTitle('job_title_detail'),
        getModelLockWork('locwork_detail')
      ],
      attributes: {
        include:[
          [getAttributeEmployeeFullName('reg_by_detail'), 'reg_by_name'],
        ]
      }
    })
  },

  getAllEmployeeRepository: async (branch_code) => {

    const whereClause = branch_code ? {
      status: 'Active',
      branch_code 
    } : {
         status: 'Active',
    };

    return await EmployeeRegister.findAll({
        order: [
          ['id', 'DESC'],
        ],
        raw: true,
        where: whereClause,
        include:[
          getModelCom('branch_detail', ['com_code', 'com_name']),
          getModelDepartment('department_detail', ['dept_des', 'dept_code']),
          getSectionInclude(),
        ]
        // attributes:['id', 'id_number', 'photo', 'first_name', 'middle_name', 'last_name', 'status', 'branch_code', 'branch_code', '']
      })
  },

  postEmployeeRegisterRepository: async (params, reqFile) => {
    await EmployeeRegister.create(buildEmployeeRegisterPayload(params, reqFile))
  },

  updateEmployeeRegisterRepository: async (params, reqFile, id, employeePhoto) => {
    await EmployeeRegister.update(
        buildEmployeeRegisterPayload(
          {
            ...params,
            image: params.image,
          },
          reqFile,
          params.image === 'deleted' ? null : employeePhoto
        ),
        { where: { id }})
  },

  updateStatusEmployeeRegisterRepository: async (id, status, remarks) => {
    await EmployeeRegister.update({status, remarks},{where: {id}});
  },

  postEmployeeByFirstRegisterUserRepository: async (payload, transaction) => {
    const { first_name, last_name, id_number, branch_code } = payload;
    await EmployeeRegister.create({first_name, last_name, id_number, reg_by:id_number, branch_code, status: 'Active', status_date: new Date()},{ transaction });
  },
}
