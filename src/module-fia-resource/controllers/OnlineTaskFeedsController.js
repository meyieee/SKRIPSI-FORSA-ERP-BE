const { Op, QueryTypes } = require("sequelize");
const sequelize = require("../../database");
const {
  getUserByNameRepository,
} = require("../../module-cf-master/repositories/UserRepository");

const models = sequelize.models;

async function resolveLoginEmployee(req) {
  if (req.user?.id_number) {
    return {
      id_number: req.user.id_number,
      first_name: req.user.first_name || null,
    };
  }

  const name = req.user?.name;
  if (!name) return { id_number: null, first_name: null };

  const currentUser = await getUserByNameRepository(name);
  const id_number =
    currentUser?.id_number || currentUser?.["employees.id_number"] || null;
  const first_name =
    currentUser?.["employees.first_name"] ||
    currentUser?.first_name ||
    currentUser?.name ||
    null;

  return { id_number, first_name };
}

async function ensureGlobalFeedsAccess(loginId) {
  const assignment = await models.adm_fia_online_req_approver_master.findOne({
    where: {
      approver_id: loginId,
      routine: { [Op.like]: "Y%" },
    },
    attributes: ["id"],
    raw: true,
  });

  return Boolean(assignment);
}

function parseDateOnlySafe(value) {
  if (value == null || value === "") return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  const raw = String(value).trim();
  let match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }

  match = raw.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (match) {
    return new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      Number(match[4]),
      Number(match[5]),
      Number(match[6] || 0)
    );
  }

  const dt = new Date(raw);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function fmtDateDDMonYY(d) {
  const dt = parseDateOnlySafe(d);
  if (!dt) return "";
  const dd = dt.toLocaleString("en-GB", { day: "2-digit" });
  const mmm = dt.toLocaleString("en-GB", { month: "short" });
  const yy = dt.toLocaleString("en-GB", { year: "2-digit" });
  return `${dd}-${mmm}-${yy}`;
}

function fmtDateIso(d) {
  const dt = parseDateOnlySafe(d);
  if (!dt) return "";
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function mapPriorityToBadge(priorityRaw) {
  const p = String(priorityRaw ?? "").trim();
  if (p === "1" || p.toUpperCase() === "P#1") return "P#1";
  if (p === "2" || p.toUpperCase() === "P#2") return "P#2";
  if (p === "3" || p.toUpperCase() === "P#3") return "P#3";
  return p ? `P#${p}` : "P#3";
}

function calcExpiredText(baseDateRaw) {
  const dt = parseDateOnlySafe(baseDateRaw);
  if (!dt) return "";

  const now = new Date();
  const normalized = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = today.getTime() - normalized.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "0 Days";
  return `${diffDays} Days`;
}

function normalizeTaskStatus(statusRaw) {
  const s = String(statusRaw || "").trim();
  if (!s) return "Outstanding";
  if (s.toLowerCase() === "outstanding") return "Outstanding";
  if (s.toLowerCase() === "completed") return "Completed";
  return s;
}

function getEmployeeDisplayName(firstName, middleName, lastName, nickName, fallback) {
  const full = [firstName, middleName, lastName].filter(Boolean).join(" ").trim();
  return full || nickName || fallback || "";
}

function safeParseAttachments(txt) {
  if (!txt) return [];
  try {
    const parsed = JSON.parse(txt);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function applySearchFilter(whereParts, replacements, columnSql, value, key) {
  if (!value) return;
  whereParts.push(`${columnSql} LIKE :${key}`);
  replacements[key] = `%${String(value).trim()}%`;
}

class OnlineTaskFeedsController {
  // GET /fia-home/command/feeds/online-tasks
  static async getGlobalOnlineTasks(req, res) {
    try {
      const { id_number: loginId } = await resolveLoginEmployee(req);
      if (!loginId) {
        return res.status(401).json({ message: "User id_number not found" });
      }

      const hasAccess = await ensureGlobalFeedsAccess(loginId);
      if (!hasAccess) {
        return res.status(403).json({ message: "You do not have access to global tasks feeds" });
      }

      const { site, department, section, element, date } = req.query || {};
      const whereParts = ["t.deleted_at IS NULL"];
      const replacements = {};

      applySearchFilter(
        whereParts,
        replacements,
        "COALESCE(assignee.emp_company, owner.emp_company, '')",
        site,
        "site"
      );
      applySearchFilter(
        whereParts,
        replacements,
        "COALESCE(assignee.dept_code, owner.dept_code, '')",
        department,
        "department"
      );
      applySearchFilter(
        whereParts,
        replacements,
        "COALESCE(assignee.section_code, owner.section_code, '')",
        section,
        "section"
      );
      applySearchFilter(
        whereParts,
        replacements,
        "COALESCE(assignee.cost_center, owner.cost_center, '')",
        element,
        "element"
      );

      if (date) {
        const parsed = parseDateOnlySafe(date);
        if (!parsed) {
          return res.status(400).json({ message: "Invalid date format, use yyyy-mm-dd" });
        }
        replacements.tasksDate = fmtDateIso(parsed);
        whereParts.push("DATE(t.tasks_datetime) = :tasksDate");
      }

      const sql = `
        SELECT
          t.id,
          t.task_no,
          t.subject,
          t.short_description,
          t.assigned_by_id,
          t.assigned_by_name,
          t.assigned_to_id,
          t.assigned_to_name,
          t.tasks_datetime,
          t.due_datetime,
          t.priority,
          t.status,
          t.complete_datetime,
          t.created_at,
          t.updated_at,
          assignee.emp_company AS assignee_site,
          assignee.dept_code AS assignee_department,
          assignee.section_code AS assignee_section,
          assignee.cost_center AS assignee_element,
          owner.emp_company AS owner_site,
          owner.dept_code AS owner_department,
          owner.section_code AS owner_section,
          owner.cost_center AS owner_element,
          assignee.first_name AS assignee_first_name,
          assignee.middle_name AS assignee_middle_name,
          assignee.last_name AS assignee_last_name,
          assignee.nick_name AS assignee_nick_name,
          owner.first_name AS owner_first_name,
          owner.middle_name AS owner_middle_name,
          owner.last_name AS owner_last_name,
          owner.nick_name AS owner_nick_name
        FROM fia_res_online_feeds_tasks t
        LEFT JOIN tbl_emp_regs assignee
          ON assignee.id_number = t.assigned_to_id
        LEFT JOIN tbl_emp_regs owner
          ON owner.id_number = t.assigned_by_id
        WHERE ${whereParts.join(" AND ")}
        ORDER BY t.id DESC
      `;

      const rows = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        replacements,
      });

      const data = rows.map((row, idx) => ({
        id: row.id,
        no: idx + 1,
        tasksNo: row.task_no,
        tasksTitle: row.subject || "",
        assignedBy:
          getEmployeeDisplayName(
            row.owner_first_name,
            row.owner_middle_name,
            row.owner_last_name,
            row.owner_nick_name,
            row.assigned_by_name
          ) || "",
        assignedTo:
          getEmployeeDisplayName(
            row.assignee_first_name,
            row.assignee_middle_name,
            row.assignee_last_name,
            row.assignee_nick_name,
            row.assigned_to_name
          ) || "",
        priority: mapPriorityToBadge(row.priority),
        tasksDate: fmtDateDDMonYY(row.tasks_datetime),
        tasksDateIso: fmtDateIso(row.tasks_datetime),
        expired: calcExpiredText(row.due_datetime || row.tasks_datetime),
        status: normalizeTaskStatus(row.status),
        site: row.assignee_site || row.owner_site || "",
        department: row.assignee_department || row.owner_department || "",
        section: row.assignee_section || row.owner_section || "",
        element: row.assignee_element || row.owner_element || "",
      }));

      return res.json({ data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Failed to load global online tasks",
        error: err.message,
      });
    }
  }

  // GET /fia-home/command/feeds/online-tasks/:taskId/detail
  static async getGlobalOnlineTaskDetail(req, res) {
    try {
      const { id_number: loginId } = await resolveLoginEmployee(req);
      if (!loginId) {
        return res.status(401).json({ message: "User id_number not found" });
      }

      const hasAccess = await ensureGlobalFeedsAccess(loginId);
      if (!hasAccess) {
        return res.status(403).json({ message: "You do not have access to global tasks feeds" });
      }

      const taskId = Number(req.params?.taskId);
      if (!taskId || Number.isNaN(taskId)) {
        return res.status(400).json({ message: "taskId must be a valid number" });
      }

      const task = await models.fia_res_online_feeds_tasks.findOne({
        where: {
          id: taskId,
          deleted_at: null,
        },
        raw: true,
      });

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const [assigneeEmp, ownerEmp, messages] = await Promise.all([
        models.tbl_emp_regs.findOne({
          where: { id_number: task.assigned_to_id },
          attributes: ["first_name", "middle_name", "last_name", "nick_name"],
          raw: true,
        }),
        models.tbl_emp_regs.findOne({
          where: { id_number: task.assigned_by_id },
          attributes: ["first_name", "middle_name", "last_name", "nick_name"],
          raw: true,
        }),
        models.fia_res_online_feeds_tasks_messages.findAll({
          where: {
            task_id: task.id,
            deleted_at: null,
          },
          order: [["created_at", "ASC"]],
          raw: true,
        }),
      ]);

      const detailMessages = messages.map((msg) => ({
        id: msg.id,
        senderId: msg.sender_id,
        senderName: msg.sender_name || "",
        messageText: msg.text || "",
        createdAt: msg.created_at,
        attachments: safeParseAttachments(msg.attachments_json),
      }));

      return res.json({
        data: {
          id: task.id,
          tasksNo: task.task_no,
          tasksTitle: task.subject || "",
          assignedBy:
            getEmployeeDisplayName(
              ownerEmp?.first_name,
              ownerEmp?.middle_name,
              ownerEmp?.last_name,
              ownerEmp?.nick_name,
              task.assigned_by_name
            ) || "",
          assignedTo:
            getEmployeeDisplayName(
              assigneeEmp?.first_name,
              assigneeEmp?.middle_name,
              assigneeEmp?.last_name,
              assigneeEmp?.nick_name,
              task.assigned_to_name
            ) || "",
          priority: mapPriorityToBadge(task.priority),
          tasksDate: fmtDateDDMonYY(task.tasks_datetime),
          tasksDateIso: fmtDateIso(task.tasks_datetime),
          expired: calcExpiredText(task.due_datetime || task.tasks_datetime),
          status: normalizeTaskStatus(task.status),
          shortDescription: task.short_description || "",
          messages: detailMessages,
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Failed to load global task detail",
        error: err.message,
      });
    }
  }
}

module.exports = OnlineTaskFeedsController;
