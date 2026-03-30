// src/module-fia-resource/controllers/TasksController.js
const { Op } = require("sequelize");
const Task = require("../models/fia_res_online_feeds_tasks");
const {
  getUserByNameRepository,
} = require("../../module-cf-master/repositories/UserRepository");
const EmpReg = require("../../module-hr/models/tbl_emp_regs");
const { socketEmitGlobal } = require("../../function/socketEmit");

// helper: format Date -> "dd-mm-yy"
function formatDMY(date) {
  if (!date) return "";
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}-${mm}-${yy}`;
}

// helper: build display name dari tbl_emp_regs
function getEmpDisplayName(empRow, fallbackName) {
  if (!empRow) return fallbackName || "";
  const first = empRow.first_name || "";
  const last = empRow.last_name || "";
  const nick = empRow.nick_name || "";
  const full = `${first} ${last}`.trim();
  return full || nick || fallbackName || "";
}

/**
 * Ambil row employee login.
 * Ini dibuat "tahan banting" karena req.user._id sering bukan tbl_emp_regs.id.
 */
async function getLoginEmp(reqUser, sequelizeInstance) {
  const Emp = sequelizeInstance?.models?.tbl_emp_regs || EmpReg;

  // 1) kalau session/JWT sudah punya id_number, pakai langsung
  const directIdNumber =
    reqUser?.id_number ||
    reqUser?.idNumber ||
    reqUser?.emp_id_number ||
    reqUser?.empIdNumber;

  if (directIdNumber) {
    return await Emp.findOne({
      where: { id_number: String(directIdNumber).trim() },
      attributes: [
        "id",
        "id_number",
        "first_name",
        "middle_name",
        "last_name",
        "nick_name",
        "photo",
        "email_company",
        "job_level",
        "individual_level",
      ],
    });
  }

  // 2) fallback: coba resolve via username (ambil id_number dari user repo)
  const name = reqUser?.name;
  if (name) {
    const currentUser = await getUserByNameRepository(name);
    const idNumber =
      currentUser?.id_number || currentUser?.["employees.id_number"] || null;
    if (idNumber) {
      return await Emp.findOne({
        where: { id_number: String(idNumber).trim() },
        attributes: [
          "id",
          "id_number",
          "first_name",
          "middle_name",
          "last_name",
          "nick_name",
          "photo",
          "email_company",
          "job_level",
          "individual_level",
        ],
      });
    }
  }

  // 3) fallback: coba match beberapa field umum
  const key = reqUser?._id;
  const email = reqUser?.email || reqUser?.email_company;

  return await Emp.findOne({
    where: {
      [Op.or]: [
        { id: key }, // kalau _id memang = tbl_emp_regs.id
        { id_number: String(key ?? "").trim() }, // kalau _id ternyata = id_number
        ...(email ? [{ email_company: String(email).trim() }] : []),
      ],
    },
    attributes: [
      "id",
      "id_number",
      "first_name",
      "middle_name",
      "last_name",
      "nick_name",
      "photo",
      "email_company",
      "job_level",
      "individual_level",
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

/**
 * Ambil id_number 15-digit-ish sebagai kunci utama untuk tasks.
 */
async function getLoginIdNumber(reqUser, sequelizeInstance) {
  const direct =
    reqUser?.id_number ||
    reqUser?.idNumber ||
    reqUser?.emp_id_number ||
    reqUser?.empIdNumber;

  if (direct) return String(direct).trim();

  const emp = await getLoginEmp(reqUser, sequelizeInstance);
  return emp?.id_number
    ? String(emp.id_number).trim()
    : String(reqUser?._id ?? "").trim();
}

// mapping row DB -> shape yang dipakai FE
function mapRowToFrontend(row, opts = {}) {
  const assignedByEmp = row.assignedBy;
  const assignedToEmp = row.assignedTo;

  const assignedByName = getEmpDisplayName(assignedByEmp, row.assigned_by_name);
  const assignedToName = getEmpDisplayName(assignedToEmp, row.assigned_to_name);

  const avatarSide = opts.avatarSide;
  let photoPath = row.image_key || "avatar1";

  if (avatarSide === "assignedTo") {
    photoPath = assignedToEmp?.photo || row.image_key || "avatar1";
  } else if (avatarSide === "assignedBy") {
    photoPath = assignedByEmp?.photo || row.image_key || "avatar1";
  } else {
    photoPath =
      assignedByEmp?.photo || assignedToEmp?.photo || row.image_key || "avatar1";
  }

  return {
    id: row.id,
    image_key: photoPath,

    assigned_by: assignedByName,
    assigned_to: assignedToName,
    assigned_to_id: row.assigned_to_id,
    assigned_by_id: row.assigned_by_id,

    taks_subject: row.subject,
    tasks_date: formatDMY(row.tasks_datetime),
    due_date: formatDMY(row.due_datetime),
    priority: row.priority,
    complete:
      row.status === "Completed" && row.complete_datetime
        ? formatDMY(row.complete_datetime)
        : "",
    status: row.status,
    task_no: row.task_no,
    short_description: row.short_description || "",

    assigned_by_photo: assignedByEmp?.photo || null,
    assigned_to_photo: assignedToEmp?.photo || null,
    ...opts,
  };
}

// generate simple task number
function generateTaskNo() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const ts = String(now.getTime()).slice(-5);
  return `TSK${yy}${mm}${dd}${ts}`;
}

// helper: build where + date filter
function applyFilters(where, query) {
  const { status, priority, dateType, from, to } = query || {};

  if (status === "Outstanding") where.status = "Outstanding";
  else if (status === "Completed") where.status = "Completed";

  if (priority) where.priority = priority;

  let dateField = null;
  if (dateType === "tasks_date") dateField = "tasks_datetime";
  else if (dateType === "due_date") dateField = "due_datetime";
  else if (dateType === "complete") dateField = "complete_datetime";

  if (dateField && from && to) {
    const start = new Date(from);
    start.setHours(0, 0, 0, 0);
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    where[dateField] = { [Op.between]: [start, end] };
  }

  return where;
}

module.exports = {
  getTaskCapabilities: async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });

      const loginEmp = await getLoginEmp(req.user, Task.sequelize);
      const loginLevel = getEmployeeHierarchyLevel(loginEmp);

      return res.status(200).json({
        message: "OK",
        data: {
          canAssign: loginLevel !== null && loginLevel > 0,
          hierarchyLevel: loginLevel,
          idNumber: String(loginEmp?.id_number || req.user?.id_number || "").trim(),
        },
      });
    } catch (err) {
      console.error("getTaskCapabilities error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  // ==============================
  // 1) MY TASKS (assigned_to_id = user login)
  // GET /api/fia-resource/tasks/my?status=&priority=&dateType=&from=&to=
  // ==============================
  getMyTasks: async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });

      console.log("[getMyTasks] req.user =", req.user);

      const userIdNumber = await getLoginIdNumber(req.user, Task.sequelize);

      console.log("[getMyTasks] computed userIdNumber =", userIdNumber);

      const where = applyFilters(
        {
          assigned_to_id: userIdNumber,
          deleted_at: null,
        },
        req.query
      );

      const Emp = Task.sequelize?.models?.tbl_emp_regs;

      const rows = await Task.findAll({
        where,
        order: [["tasks_datetime", "ASC"]],
        ...(Emp
          ? {
              include: [
                {
                  model: Emp,
                  as: "assignedBy",
                  attributes: [
                    "id_number",
                    "first_name",
                    "last_name",
                    "nick_name",
                    "photo",
                  ],
                  required: false,
                },
                {
                  model: Emp,
                  as: "assignedTo",
                  attributes: [
                    "id_number",
                    "first_name",
                    "last_name",
                    "nick_name",
                    "photo",
                  ],
                  required: false,
                },
              ],
            }
          : {}),
      });

      return res.status(200).json({
        message: "Success get tasks",
        data: rows.map((r) => mapRowToFrontend(r, { avatarSide: "assignedBy" })),
      });
    } catch (err) {
      console.error("getMyTasks error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  // ==============================
  // 2) ASSIGNED TASKS (assigned_by_id = user login)
  // GET /api/fia-resource/tasks/assigned?status=&priority=&dateType=&from=&to=
  // ==============================
  getAssignedTasks: async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });

      const userIdNumber = await getLoginIdNumber(req.user, Task.sequelize);

      const where = applyFilters(
        {
          assigned_by_id: userIdNumber,
          deleted_at: null,
        },
        req.query
      );

      const Emp = Task.sequelize?.models?.tbl_emp_regs;

      const rows = await Task.findAll({
        where,
        order: [["tasks_datetime", "ASC"]],
        ...(Emp
          ? {
              include: [
                {
                  model: Emp,
                  as: "assignedBy",
                  attributes: [
                    "id_number",
                    "first_name",
                    "last_name",
                    "nick_name",
                    "photo",
                  ],
                  required: false,
                },
                {
                  model: Emp,
                  as: "assignedTo",
                  attributes: [
                    "id_number",
                    "first_name",
                    "last_name",
                    "nick_name",
                    "photo",
                  ],
                  required: false,
                },
              ],
            }
          : {}),
      });

      return res.status(200).json({
        message: "Success get assigned tasks",
        data: rows.map((r) => mapRowToFrontend(r, { avatarSide: "assignedTo" })),
      });
    } catch (err) {
      console.error("getAssignedTasks error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  // ==============================
  // 3) UPDATE STATUS (assigner only)
  // PATCH /api/fia-resource/tasks/:taskId/status
  // body: { status: "Outstanding" | "Completed" }
  // ==============================
  updateTaskStatus: async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });

      const loginIdNumber = await getLoginIdNumber(req.user, Task.sequelize);
      const { taskId } = req.params;
      const nextStatus = String(req.body?.status || "").trim();

      if (!taskId)
        return res.status(400).json({ message: "taskId is required" });
      if (nextStatus !== "Outstanding" && nextStatus !== "Completed") {
        return res.status(400).json({ message: "Invalid status" });
      }

      const row = await Task.findOne({
        where: { id: Number(taskId), deleted_at: null },
      });

      if (!row) return res.status(404).json({ message: "Task not found" });

      // hanya assigner boleh ubah
      if (String(row.assigned_by_id) !== String(loginIdNumber)) {
        return res
          .status(403)
          .json({ message: "Only task owner can update status" });
      }

      const patch = { status: nextStatus };
      if (nextStatus === "Completed") patch.complete_datetime = new Date();
      else patch.complete_datetime = null;

      await row.update(patch);

      const Emp = Task.sequelize?.models?.tbl_emp_regs;
      const saved = Emp
        ? await Task.findByPk(row.id, {
            include: [
              {
                model: Emp,
                as: "assignedBy",
                attributes: [
                  "id_number",
                  "first_name",
                  "last_name",
                  "nick_name",
                  "photo",
                ],
              },
              {
                model: Emp,
                as: "assignedTo",
                attributes: [
                  "id_number",
                  "first_name",
                  "last_name",
                  "nick_name",
                  "photo",
                ],
              },
            ],
          })
        : row;

      const frontendRow = mapRowToFrontend(saved);
      socketEmitGlobal("tasks-updated", {
        action: "status-updated",
        task_id: row.id,
        actor_id: String(loginIdNumber || ""),
        assigned_by_id: String(row.assigned_by_id || ""),
        assigned_to_id: String(row.assigned_to_id || ""),
        status: nextStatus,
        data: frontendRow,
      });

      return res.status(200).json({
        message: "Task status updated",
        data: frontendRow,
      });
    } catch (err) {
      console.error("updateTaskStatus error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  // ==============================
  // 4) CREATE TASK
  // POST /api/fia-resource/tasks
  // ==============================
  createTask: async (req, res) => {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ message: "Unauthorized" });

      // senderId = id_number
      const senderIdNumber = await getLoginIdNumber(req.user, Task.sequelize);

      const senderEmp = await getLoginEmp(req.user, Task.sequelize);
      const senderDisplayName = getEmpDisplayName(senderEmp, user.name || "");
      const senderLevel = getEmployeeHierarchyLevel(senderEmp);

      const {
        assignedToId,
        assignedToName,
        imageKey,
        subject,
        shortDescription,
        tasksDateTime,
        dueDateTime,
        priority,
        postDate,
        taskOwner,
      } = req.body;

      if (!assignedToId || !assignedToName) {
        return res
          .status(400)
          .json({ message: "assignedToId & assignedToName are required" });
      }
      if (!subject || !tasksDateTime || !priority) {
        return res
          .status(400)
          .json({ message: "subject, tasksDateTime, priority are required" });
      }

      if (senderLevel === null) {
        return res
          .status(400)
          .json({ message: "Unable to determine your employee level" });
      }

      const Emp = Task.sequelize?.models?.tbl_emp_regs || EmpReg;
      const assignedToEmp = await Emp.findOne({
        where: {
          id_number: String(assignedToId).trim(),
          status: "Active",
        },
        attributes: [
          "id_number",
          "first_name",
          "middle_name",
          "last_name",
          "nick_name",
          "photo",
          "email_company",
          "job_level",
          "individual_level",
          "status",
        ],
      });

      if (!assignedToEmp) {
        return res.status(404).json({ message: "Assigned employee not found" });
      }

      const assignedToLevel = getEmployeeHierarchyLevel(assignedToEmp);
      if (assignedToLevel === null) {
        return res
          .status(400)
          .json({ message: "Assigned employee level is not configured" });
      }

      if (assignedToLevel >= senderLevel) {
        return res.status(403).json({
          message:
            "Assigned To must have a lower position level than the current user",
        });
      }

      const taskNo = generateTaskNo();

      const postDateValue = postDate ? new Date(postDate) : new Date();
      const taskOwnerValue = taskOwner ? String(taskOwner) : senderDisplayName;

      const row = await Task.create({
        task_no: taskNo,

        assigned_by_id: String(senderIdNumber).trim(),
        assigned_by_name: senderDisplayName,

        assigned_to_id: String(assignedToId).trim(),
        assigned_to_name: String(assignedToName).trim(),

        image_key: imageKey || null,

        subject,
        short_description: shortDescription || null,

        tasks_datetime: new Date(tasksDateTime),
        due_datetime: dueDateTime ? new Date(dueDateTime) : null,

        priority,

        status: "Outstanding",
        complete_datetime: null,

        post_date: postDateValue,
        task_owner: taskOwnerValue,
      });

      const saved = Emp
        ? await Task.findByPk(row.id, {
            include: [
              {
                model: Emp,
                as: "assignedBy",
                attributes: [
                  "id_number",
                  "first_name",
                  "last_name",
                  "nick_name",
                  "photo",
                ],
              },
              {
                model: Emp,
                as: "assignedTo",
                attributes: [
                  "id_number",
                  "first_name",
                  "last_name",
                  "nick_name",
                  "photo",
                ],
              },
            ],
          })
        : row;

      const frontendRow = mapRowToFrontend(saved);

      socketEmitGlobal("tasks-updated", {
        action: "created",
        task_id: row.id,
        actor_id: String(senderIdNumber || ""),
        assigned_by_id: String(row.assigned_by_id || ""),
        assigned_to_id: String(row.assigned_to_id || ""),
        status: row.status,
        data: frontendRow,
      });

      return res.status(201).json({
        message: "Task created",
        data: frontendRow,
      });
    } catch (err) {
      console.error("createTask error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  // ==============================
  // 5) SEARCH ASSIGNEES
  // GET /api/fia-resource/tasks/assignees?q=...
  // ==============================
  searchAssignees: async (req, res) => {
    try {
      const q = String(req.query.q || "").trim();
      if (!q) return res.status(200).json({ message: "OK", data: [] });

      const Emp = Task.sequelize?.models?.tbl_emp_regs || EmpReg;
      const lowerThanLogin =
        String(req.query.lowerThanLogin || "").trim().toLowerCase() === "true" ||
        String(req.query.lowerThanLogin || "").trim() === "1";

      let loginLevel = null;
      let loginIdNumber = "";
      if (lowerThanLogin) {
        const loginEmp = await getLoginEmp(req.user, Task.sequelize);
        loginLevel = getEmployeeHierarchyLevel(loginEmp);
        loginIdNumber = String(loginEmp?.id_number || "").trim();

        if (loginLevel === null) {
          return res
            .status(400)
            .json({ message: "Unable to determine your employee level" });
        }
      }

      const rows = await Emp.findAll({
        attributes: [
          "id_number",
          "first_name",
          "middle_name",
          "last_name",
          "nick_name",
          "email_company",
          "photo",
          "status",
          "job_level",
          "individual_level",
        ],
        where: {
          status: "Active",
          [Op.or]: [
            { id_number: { [Op.like]: `%${q}%` } },
            { first_name: { [Op.like]: `%${q}%` } },
            { middle_name: { [Op.like]: `%${q}%` } },
            { last_name: { [Op.like]: `%${q}%` } },
            { nick_name: { [Op.like]: `%${q}%` } },
            { email_company: { [Op.like]: `%${q}%` } },
          ],
        },
        limit: lowerThanLogin ? 50 : 10,
        order: [["first_name", "ASC"]],
      });

      const data = rows
        .filter((r) => {
          if (!lowerThanLogin) return true;
          const candidateLevel = getEmployeeHierarchyLevel(r);
          const candidateIdNumber = String(r.id_number || "").trim();
          if (candidateLevel === null) return false;
          if (candidateIdNumber && candidateIdNumber === loginIdNumber) return false;
          return candidateLevel < loginLevel;
        })
        .map((r) => {
          const fullName = [r.first_name, r.middle_name, r.last_name]
            .filter(Boolean)
            .join(" ");
          return {
            id_number: String(r.id_number).trim(), // pastikan string
            full_name: (fullName || r.nick_name || r.id_number || "")
              .toString()
              .trim(),
            email: (r.email_company || "").toString(),
            photo: (r.photo || "").toString(),
          };
        });

      return res.status(200).json({ message: "OK", data });
    } catch (err) {
      console.error("searchAssignees error:", err);
      return res.status(500).json({ message: err.message });
    }
  },
};
