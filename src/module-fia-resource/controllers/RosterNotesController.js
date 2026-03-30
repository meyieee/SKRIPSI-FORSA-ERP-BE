// src/module-fia-resource/controllers/RosterNotesController.js
const { Op } = require("sequelize");
const RosterNote = require("../models/fia_res_online_feeds_roster");

module.exports = {
  // GET /api/fia-resource/roster?year=2025&month=9
  getMonthlyRoster: async (req, res) => {
    try {
      const user = req.user; // dari validationAPI
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const empId = user.id_number || user.emp_id || String(user._id);

      let { year, month } = req.query;
      const now = new Date();

      year = Number(year) || now.getFullYear();
      month = Number(month) || now.getMonth() + 1; // 1–12

      // first day & first day of next month
      const start = new Date(year, month - 1, 1);
      const nextMonth = new Date(year, month, 1);

      const rows = await RosterNote.findAll({
        where: {
          emp_id: empId,
          note_date: {
            [Op.gte]: start.toISOString().slice(0, 10),
            [Op.lt]: nextMonth.toISOString().slice(0, 10),
          },
          deleted_at: null,
        },
        order: [
          ["note_date", "ASC"],
          ["id", "ASC"],
        ],
      });

      const data = rows.map((r) => ({
        id: r.id,
        date: r.note_date, // "YYYY-MM-DD"
        text: r.note_text,
      }));

      return res.status(200).json({
        message: "Success get roster notes",
        data,
      });
    } catch (err) {
      console.error("getMonthlyRoster error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  // POST /api/fia-resource/roster
  // body: { date: "2025-09-07", text: "Vacation" }
  createNote: async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const empId = user.id_number || user.emp_id || String(user._id);
      const { date, text } = req.body;

      if (!date || !text?.trim()) {
        return res.status(400).json({ message: "date & text are required" });
      }

      const row = await RosterNote.create({
        emp_id: empId,
        note_date: date,
        note_text: text.trim(),
      });

      return res.status(201).json({
        message: "Note created",
        data: {
          id: row.id,
          date: row.note_date,
          text: row.note_text,
        },
      });
    } catch (err) {
      console.error("createNote error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  // PUT /api/fia-resource/roster/:id
  // body: { text: "New text" }
  updateNote: async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const empId = user.id_number || user.emp_id || String(user._id);
      const { id } = req.params;
      const { text } = req.body;

      if (!text?.trim()) {
        return res.status(400).json({ message: "text is required" });
      }

      const row = await RosterNote.findOne({
        where: { id, emp_id: empId, deleted_at: null },
      });

      if (!row) {
        return res.status(404).json({ message: "Note not found" });
      }

      await row.update({ note_text: text.trim() });

      return res.status(200).json({
        message: "Note updated",
        data: {
          id: row.id,
          date: row.note_date,
          text: row.note_text,
        },
      });
    } catch (err) {
      console.error("updateNote error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  // DELETE /api/fia-resource/roster/:id
  deleteNote: async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const empId = user.id_number || user.emp_id || String(user._id);
      const { id } = req.params;

      const row = await RosterNote.findOne({
        where: { id, emp_id: empId, deleted_at: null },
      });

      if (!row) {
        return res.status(404).json({ message: "Note not found" });
      }

      await row.update({ deleted_at: new Date() }); // SOFT DELETE

      return res.status(200).json({ message: "Note deleted" });
    } catch (err) {
      console.error("deleteNote error:", err);
      return res.status(500).json({ message: err.message });
    }
  },
};
