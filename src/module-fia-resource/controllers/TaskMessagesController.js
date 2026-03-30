// src/module-fia-resource/controllers/TaskMessagesController.js
const { Op } = require("sequelize");
const path = require("path");
const TaskMessage = require("../models/fia_res_online_feeds_tasks_messages");
const Task = require("../models/fia_res_online_feeds_tasks"); // ✅ sesuaikan bila beda nama/path
const EmpReg = require("../../module-hr/models/tbl_emp_regs");
const { socketEmitGlobal } = require("../../function/socketEmit");
const {
  getUserByNameRepository,
} = require("../../module-cf-master/repositories/UserRepository");

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
        "id",
        "id_number",
        "first_name",
        "middle_name",
        "last_name",
        "nick_name",
        "photo",
        "email_company",
      ],
    });
  }

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
        ],
      });
    }
  }

  const key = reqUser?._id;
  const email = reqUser?.email || reqUser?.email_company;

  return await Emp.findOne({
    where: {
      [Op.or]: [
        { id: key },
        { id_number: String(key ?? "").trim() },
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
    ],
  });
}

// ambil id_number 15 digit dari user login (req.user._id biasanya int)
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

// ambil display name yang lebih bagus (optional)
async function getLoginDisplayName(reqUser, sequelizeInstance) {
  const emp = await getLoginEmp(reqUser, sequelizeInstance);

  if (!emp) return reqUser?.name || "";

  const fullName = [emp.first_name, emp.middle_name, emp.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return fullName || emp.nick_name || reqUser?.name || "";
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

// ✅ bikin url relative dari folder public secara aman
function toPublicRelative(file) {
  // contoh destination: "public/images/messages/" atau "public/documents/messages/"
  const dest = String(file.destination || "")
    .replace(/^public[\\/]/, "")
    .replace(/\\/g, "/");

  const dir = dest.endsWith("/") ? dest : dest + "/";
  return dir + file.filename; // contoh: "images/messages/xxx.jpg"
}

// ✅ hanya assigner/assignee boleh akses chat
async function ensureTaskMember(req, res, taskId) {
  const loginIdNumber = await getLoginIdNumber(req.user, TaskMessage.sequelize);
  const loginFallbackId = String(req.user?._id ?? ""); // fallback kalau ada data lama

  const task = await Task.findOne({
    where: { id: Number(taskId), deleted_at: null },
  });

  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return null;
  }

  const isMember =
    String(task.assigned_by_id) === String(loginIdNumber) ||
    String(task.assigned_to_id) === String(loginIdNumber) ||
    (loginFallbackId &&
      (String(task.assigned_by_id) === loginFallbackId ||
        String(task.assigned_to_id) === loginFallbackId));

  if (!isMember) {
    res.status(403).json({ message: "Forbidden" });
    return null;
  }

  return { task, loginIdNumber, loginFallbackId };
}

module.exports = {
  /**
   * GET /api/fia-resource/tasks/:taskId/messages
   */
  getMessagesByTask: async (req, res) => {
    try {
      const { taskId } = req.params;
      if (!taskId)
        return res.status(400).json({ message: "taskId is required" });
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });

      const ctx = await ensureTaskMember(req, res, taskId);
      if (!ctx) return;

      const { loginIdNumber, loginFallbackId } = ctx;

      const rows = await TaskMessage.findAll({
        where: {
          task_id: Number(taskId),
          deleted_at: null,
        },
        order: [["created_at", "ASC"]],
      });

      const data = rows.map((row) => {
        const senderId = String(row.sender_id);

        const isMe =
          senderId === String(loginIdNumber) || // 15 digit
          (loginFallbackId && senderId === loginFallbackId); // fallback lama

        return {
          id: row.id,
          task_id: row.task_id,
          sender: isMe ? "me" : "them",
          message_text: row.text || "",
          created_at: row.created_at,
          attachments: safeParseAttachments(row.attachments_json),
        };
      });

      return res.status(200).json({
        message: "Success get messages",
        data,
      });
    } catch (err) {
      console.error("getMessagesByTask error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  /**
   * POST /api/fia-resource/tasks/:taskId/messages
   */
  createMessage: async (req, res) => {
    try {
      const user = req.user;
      const { taskId } = req.params;
      if (!taskId)
        return res.status(400).json({ message: "taskId is required" });
      if (!user) return res.status(401).json({ message: "Unauthorized" });

      // ✅ pastikan hanya member task boleh kirim
      const ctx = await ensureTaskMember(req, res, taskId);
      if (!ctx) return;

      const text = String(
        req.body?.text ?? req.body?.message_text ?? ""
      ).trim();
      const files = Array.isArray(req.files) ? req.files : [];

      if (!text && files.length === 0) {
        return res
          .status(400)
          .json({ message: "Message text or attachments is required" });
      }

      const senderIdNumber = await getLoginIdNumber(
        user,
        TaskMessage.sequelize
      );
      const senderDisplayName = await getLoginDisplayName(
        user,
        TaskMessage.sequelize
      );

      const atts = files.map((f) => {
        const isImg = String(f.mimetype || "").startsWith("image/");
        const rel = toPublicRelative(f); // ✅ otomatis cocok untuk images/messages atau documents/messages

        return {
          type: isImg ? "image" : "file",
          name: f.originalname,
          size: f.size,
          url: rel,
        };
      });

      const row = await TaskMessage.create({
        task_id: Number(taskId),
        sender_id: String(senderIdNumber), // ✅ simpan 15 digit
        sender_name: senderDisplayName || user.name || "",
        text,
        attachments_json: atts.length ? JSON.stringify(atts) : null,
        deleted_at: null,
      });

      socketEmitGlobal("tasks-message", {
        id: row.id,
        task_id: row.task_id,
        sender_id: String(senderIdNumber),
        sender: "them",
        message_text: row.text || "",
        created_at: row.created_at,
        attachments: atts,
        assigned_by_id: ctx.task?.assigned_by_id,
        assigned_to_id: ctx.task?.assigned_to_id,
      });


      return res.status(201).json({
        message: "Message created",
        data: {
          id: row.id,
          task_id: row.task_id,
          sender: "me",
          message_text: row.text || "",
          created_at: row.created_at,
          attachments: atts,
        },
      });
    } catch (err) {
      console.error("createMessage error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  /**
   * DELETE /api/fia-resource/tasks/:taskId/messages/:messageId
   * hanya boleh hapus pesan milik user sendiri (dan user harus member task)
   */
  deleteMessage: async (req, res) => {
    try {
      const { taskId, messageId } = req.params;
      const user = req.user;

      if (!user) return res.status(401).json({ message: "Unauthorized" });
      if (!taskId || !messageId) {
        return res
          .status(400)
          .json({ message: "taskId & messageId are required" });
      }

      // ✅ pastikan user member task
      const ctx = await ensureTaskMember(req, res, taskId);
      if (!ctx) return;

      const loginIdNumber = ctx.loginIdNumber;
      const loginFallbackId = ctx.loginFallbackId;

      const row = await TaskMessage.findOne({
        where: {
          id: Number(messageId),
          task_id: Number(taskId),
          deleted_at: null,
        },
      });

      if (!row) return res.status(404).json({ message: "Message not found" });

      // ✅ boleh delete jika sender_id == id_number (atau fallback sender lama)
      const senderId = String(row.sender_id);
      const canDelete =
        senderId === String(loginIdNumber) ||
        (loginFallbackId && senderId === loginFallbackId);

      if (!canDelete) {
        return res
          .status(403)
          .json({ message: "You can only delete your own messages" });
      }

      await row.update({ deleted_at: new Date() });
      return res.status(200).json({ message: "Message deleted" });
    } catch (err) {
      console.error("deleteMessage error:", err);
      return res.status(500).json({ message: err.message });
    }
  },
};
