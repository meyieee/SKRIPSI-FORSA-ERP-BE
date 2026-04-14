// src/module-fia-resource/controllers/ApprovalController.js

const { Op, QueryTypes } = require("sequelize");
const { socketEmitGlobal } = require("../../function/socketEmit");
const {
  getUserByNameRepository,
} = require("../../module-cf-master/repositories/UserRepository");
const db = require("../../database");
const models = db.models;
// helper: ambil employee id_number dari user login (tanpa ubah file auth.js/validSession)
async function resolveLoginEmployee(req) {
  // kalau suatu saat req.user sudah punya id_number, langsung pakai
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

// ambil sequelize instance (pilih salah satu cara yang kamu pakai di project)
function getSequelize() {
  return db; // sequelize instance yang kamu export: module.exports = connection;
}

function mapActionType(actionType) {
  const x = String(actionType || "").toUpperCase();
  if (x === "APPROVE") return "APPROVED";
  if (x === "PENDING") return "PENDING";
  if (x === "REJECT") return "REJECTED";
  return null;
}

function mapProcessStatusToHeaderStatus(status) {
  const normalized = String(status || "").toUpperCase();
  if (normalized === "APPROVED") return "Approved";
  if (normalized === "REJECTED") return "Rejected";
  if (normalized === "PENDING") return "Pending";
  return "";
}

function fmtDateDDMonYY(d) {
  const dt = parseDateOnlySafe(d);
  if (Number.isNaN(dt.getTime())) return "";
  const dd = dt.toLocaleString("en-GB", { day: "2-digit" });
  const mmm = dt.toLocaleString("en-GB", { month: "short" });
  const yy = dt.toLocaleString("en-GB", { year: "2-digit" });
  return `${dd}-${mmm}-${yy}`;
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

function computeStatusLabel(currentRoutine, totalProcess, isPendingOverride) {
  if (isPendingOverride) return "Pending";

  // 1 = Planner, 2 = Supervisor
  if (currentRoutine === 1) return "Waiting for Verification";
  if (currentRoutine === 2) return "Waiting for Review";

  const total = Number(totalProcess || 0) || 3; // total step (planner + supervisor + approver(s))
  const approverTotal = Math.max(0, total - 2); // jumlah approver
  const approverIndex = currentRoutine - 2; // 1..approverTotal

  // kalau datanya aneh / di luar range, fallback aman
  if (approverTotal <= 0 || approverIndex <= 0) {
    return "Approver - Waiting For Approval";
  }

  // 1 approval
  if (approverTotal === 1) return "Approval - Waiting for Approval";

  // 2 approvals
  if (approverTotal === 2) {
    return approverIndex === 2
      ? "Approver - Waiting For Final Approval"
      : "Approver - Waiting For Approval";
  }

  // 3+ approvals
  if (approverIndex >= approverTotal)
    return "Approver - Waiting For Final Approval";
  return `Approver - Waiting For Approval #${approverIndex}`;
}


// derive current routine dari last process (aturan A: pakai approver_type.routine)
function deriveCurrentFromLast(lastStatusRaw, lastRoutineRaw) {
  const lastStatus = lastStatusRaw ? String(lastStatusRaw).toUpperCase() : null;
  const lastRoutine = lastRoutineRaw != null ? Number(lastRoutineRaw) : null;

  if (!lastStatus)
    return { currentRoutine: 1, isFinal: false, isPending: false };

  if (lastStatus === "REJECTED")
    return { currentRoutine: null, isFinal: true, isPending: false };

  if (lastStatus === "PENDING") {
    return {
      currentRoutine: Number(lastRoutine || 1),
      isFinal: false,
      isPending: true,
    };
  }

  if (lastStatus === "APPROVED") {
    return {
      currentRoutine: Number(lastRoutine || 1) + 1,
      isFinal: false,
      isPending: false,
    };
  }

  // SUBMITTED atau lainnya
  return { currentRoutine: 1, isFinal: false, isPending: false };
}

class ApprovalController {
  // GET /fia-resource/approvals
  static async getCurrentApprovals(req, res) {
    try {
      const { id_number: loginId, first_name } = await resolveLoginEmployee(
        req
      );
      if (!loginId)
        return res.status(401).json({ message: "User id_number not found" });

      const sequelize = getSequelize();
      const models = sequelize.models;
      let loginFirstName = first_name || "";

      const loginEmp = await models.tbl_emp_regs.findOne({
        where: { id_number: loginId },
        attributes: ["first_name"],
        raw: true,
      });
      if (loginEmp?.first_name) loginFirstName = loginEmp.first_name;

      // 1) assignment user (aktif Y1/Y2/...)
      const masters = await models.adm_fia_online_req_approver_master.findAll({
        where: {
          approver_id: loginId,
          routine: { [Op.like]: "Y%" },
        },
        attributes: [
          "request_type",
          "com_code",
          "section_code",
          "approver_type",
        ],
        raw: true,
      });

      if (masters.length === 0) {
        return res.json({ userFirstName: loginFirstName, data: [] });
      }

      // 2) map approver_type => routine number (1..5)
      const types = await models.adm_fia_online_req_approver_type.findAll({
        attributes: ["approver_type", "routine"],
        raw: true,
      });
      const typeRoutine = new Map(
        types.map((t) => [t.approver_type, Number(t.routine)])
      );

      const combos = masters
        .map((m) => ({
          request_type: m.request_type,
          com_code: m.com_code,
          section_code: m.section_code,
          approver_type: m.approver_type,
          target_routine: typeRoutine.get(m.approver_type),
        }))
        .filter((x) => Number.isFinite(x.target_routine));

      if (combos.length === 0) {
        return res.json({ userFirstName: loginFirstName, data: [] });
      }

      // 3) ambil request header + last process (exclude Requester)
      // routing berdasarkan request_for -> tbl_emp_regs.emp_company + section_code
      const whereParts = [];
      const replacements = {};

      combos.forEach((c, i) => {
        whereParts.push(`(
          r.request_type = :rt${i}
          AND emp.emp_company = :cc${i}
          AND emp.section_code = :sc${i}
        )`);
        replacements[`rt${i}`] = c.request_type;
        replacements[`cc${i}`] = c.com_code;
        replacements[`sc${i}`] = c.section_code;
      });

      const sql = `
        SELECT
          r.id,
          r.ref_request_no,
          r.request_type,
          r.request_date,
          r.request_by,
          r.request_for,
          r.request_description,
          r.request_purpose,

          emp.emp_company AS emp_company,
          emp.section_code AS emp_section_code,

          an.request_name,
          an.no_approval_process,

          lp.approver_status AS last_status,
          lp.comments AS last_comments,
          lp.created_at AS last_created_at,
          atp.routine AS last_routine

        FROM adm_fia_online_req r
        LEFT JOIN adm_fia_online_approval_no an
          ON an.request_type = r.request_type

        LEFT JOIN tbl_emp_regs emp
          ON emp.id_number = r.request_for

        LEFT JOIN (
          SELECT p1.*
          FROM adm_fia_online_req_approver_process p1
          JOIN (
            SELECT request_no, MAX(id) AS max_id
            FROM adm_fia_online_req_approver_process
            WHERE approver_type <> 'Requester'
            GROUP BY request_no
          ) t ON t.max_id = p1.id
        ) lp ON lp.request_no = r.ref_request_no

        LEFT JOIN adm_fia_online_req_approver_type atp
          ON atp.approver_type = lp.approver_type

        WHERE r.is_draft = 0
          AND emp.id_number IS NOT NULL
          AND (${whereParts.join(" OR ")})
      `;

      const rows = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        replacements,
      });

      // 4) raised_by name (request_by jika sudah id_number)
      const requestByIds = [
        ...new Set(rows.map((r) => r.request_by).filter(Boolean)),
      ];
      let empNameMap = new Map();

      if (requestByIds.length) {
        const empRows = await models.tbl_emp_regs.findAll({
          where: { id_number: { [Op.in]: requestByIds } },
          attributes: [
            "id_number",
            "first_name",
            "middle_name",
            "last_name",
            "nick_name",
          ],
          raw: true,
        });

        empNameMap = new Map(
          empRows.map((e) => {
            const full = [e.first_name, e.middle_name, e.last_name]
              .filter(Boolean)
              .join(" ");
            return [e.id_number, full || e.nick_name || e.id_number];
          })
        );
      }

      // 5) filter: tampil hanya request yang sedang berada di routine user + match com/section
      const data = [];

      for (const r of rows) {
        const derived = deriveCurrentFromLast(r.last_status, r.last_routine);
        if (derived.isFinal) continue;

        const totalProcess = Number(r.no_approval_process || 0) || 3;

        // kalau sudah lewat total layer => final approved (tidak tampil)
        if (derived.currentRoutine && derived.currentRoutine > totalProcess)
          continue;

        const isMine = combos.some(
          (c) =>
            c.request_type === r.request_type &&
            c.com_code === r.emp_company &&
            c.section_code === r.emp_section_code &&
            c.target_routine === derived.currentRoutine
        );

        if (!isMine) continue;

        const statusLabel = computeStatusLabel(
          derived.currentRoutine,
          totalProcess,
          derived.isPending
        );

        data.push({
          id: r.id,
          document_no: r.ref_request_no,
          request_type: r.request_name || r.request_type,
          created: fmtDateDDMonYY(r.request_date),
          raised_by: empNameMap.get(r.request_by) || r.request_by || "",
          project_desc: r.request_description || r.request_purpose || "",
          status: statusLabel,
          notes: r.last_comments || "",
          pending_since: derived.isPending
            ? fmtDateDDMonYY(r.last_created_at)
            : undefined,
        });
      }

      return res.json({ userFirstName: loginFirstName, data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Failed to load approvals",
        error: err.message,
      });
    }
  }

  // GET /fia-resource/approvals/history
  static async getApprovalHistory(req, res) {
    try {
      const { id_number: loginId, first_name } = await resolveLoginEmployee(
        req
      );
      if (!loginId)
        return res.status(401).json({ message: "User id_number not found" });

      const sequelize = getSequelize();
      const models = sequelize.models;
      let loginFirstName = first_name || "";

      const loginEmp = await models.tbl_emp_regs.findOne({
        where: { id_number: loginId },
        attributes: ["first_name"],
        raw: true,
      });
      if (loginEmp?.first_name) loginFirstName = loginEmp.first_name;

      const sql = `
        SELECT
          p.id,
          p.request_no,
          p.approver_status,
          p.approved_date,
          p.comments,

          r.request_type,
          r.request_date,
          r.request_by,
          r.request_description,
          r.request_purpose,
          an.request_name

        FROM adm_fia_online_req_approver_process p
        JOIN adm_fia_online_req r
          ON r.ref_request_no = p.request_no
        LEFT JOIN adm_fia_online_approval_no an
          ON an.request_type = r.request_type
        WHERE p.approver_id = :loginId
          AND UPPER(p.approver_status) IN ('APPROVED','REJECTED')
        ORDER BY p.id DESC
      `;

      const rows = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        replacements: { loginId },
      });

      const requestByIds = [
        ...new Set(rows.map((x) => x.request_by).filter(Boolean)),
      ];
      let empNameMap = new Map();

      if (requestByIds.length) {
        const empRows = await models.tbl_emp_regs.findAll({
          where: { id_number: { [Op.in]: requestByIds } },
          attributes: [
            "id_number",
            "first_name",
            "middle_name",
            "last_name",
            "nick_name",
          ],
          raw: true,
        });

        empNameMap = new Map(
          empRows.map((e) => {
            const full = [e.first_name, e.middle_name, e.last_name]
              .filter(Boolean)
              .join(" ");
            return [e.id_number, full || e.nick_name || e.id_number];
          })
        );
      }

      const data = rows.map((r) => ({
        id: r.id,
        document_no: r.request_no,
        request_type: r.request_name || r.request_type,
        created: fmtDateDDMonYY(r.request_date),
        raised_by: empNameMap.get(r.request_by) || r.request_by || "",
        project_desc: r.request_description || r.request_purpose || "",
        status:
          String(r.approver_status).toUpperCase() === "APPROVED"
            ? "Approved"
            : "Rejected",
        notes: r.comments || "",
        processed_date: fmtDateDDMonYY(r.approved_date),
      }));

      return res.json({ userFirstName: loginFirstName, data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Failed to load approval history",
        error: err.message,
      });
    }
  }

  // POST /fia-resource/approvals/actions
  static async updateApprovalStatus(req, res) {
    try {
      const { id_number: loginId } = await resolveLoginEmployee(req);
      if (!loginId)
        return res.status(401).json({ message: "User id_number not found" });

      const { docNos, actionType, notes } = req.body || {};
      if (!Array.isArray(docNos) || docNos.length === 0) {
        return res.status(400).json({ message: "docNos is required" });
      }

      const mapped = mapActionType(actionType);
      if (!mapped)
        return res.status(400).json({ message: "Invalid actionType" });

      const sequelize = getSequelize();
      const models = sequelize.models;

      // assignment user (aktif Y*)
      const masters = await models.adm_fia_online_req_approver_master.findAll({
        where: { approver_id: loginId, routine: { [Op.like]: "Y%" } },
        attributes: [
          "request_type",
          "com_code",
          "section_code",
          "approver_type",
        ],
        raw: true,
      });

      // routine map approver_type
      const types = await models.adm_fia_online_req_approver_type.findAll({
        attributes: ["approver_type", "routine"],
        raw: true,
      });
      const typeRoutine = new Map(
        types.map((t) => [t.approver_type, Number(t.routine)])
      );

      // load request header docNos
      const reqRows = await models.adm_fia_online_req.findAll({
        where: { ref_request_no: { [Op.in]: docNos } },
        attributes: ["ref_request_no", "request_type", "request_for"],
        raw: true,
      });

      // load employee request_for untuk routing com/section
      const empIds = [
        ...new Set(reqRows.map((r) => r.request_for).filter(Boolean)),
      ];
      const empRows = await models.tbl_emp_regs.findAll({
        where: { id_number: { [Op.in]: empIds } },
        attributes: ["id_number", "emp_company", "section_code"],
        raw: true,
      });
      const empMap = new Map(empRows.map((e) => [e.id_number, e]));

      const requestTypes = [
        ...new Set(reqRows.map((row) => row.request_type).filter(Boolean)),
      ];
      const allRouteMasters = await models.adm_fia_online_req_approver_master.findAll({
        where: {
          routine: { [Op.like]: "Y%" },
          request_type: { [Op.in]: requestTypes.length ? requestTypes : [""] },
        },
        attributes: ["request_type", "com_code", "section_code", "approver_type"],
        raw: true,
      });

      const results = [];

      for (const r of reqRows) {
        const emp = empMap.get(r.request_for);
        if (!emp) {
          results.push({
            docNo: r.ref_request_no,
            ok: false,
            message: "request_for employee not found",
          });
          continue;
        }

        // cari assignment yg cocok (routing by request_for)
        const match = masters.find(
          (m) =>
            m.request_type === r.request_type &&
            m.com_code === emp.emp_company &&
            m.section_code === emp.section_code
        );

        if (!match) {
          results.push({
            docNo: r.ref_request_no,
            ok: false,
            message: "No approver assignment for this request",
          });
          continue;
        }

        const myRoutine = typeRoutine.get(match.approver_type);
        if (!myRoutine) {
          results.push({
            docNo: r.ref_request_no,
            ok: false,
            message: "Approver type routine not found",
          });
          continue;
        }

        const routeMasters = allRouteMasters.filter(
          (m) =>
            m.request_type === r.request_type &&
            m.com_code === emp.emp_company &&
            m.section_code === emp.section_code
        );

        const lastConfiguredRoutine = routeMasters.reduce((max, item) => {
          const routineNo = Number(typeRoutine.get(item.approver_type) || 0);
          return routineNo > max ? routineNo : max;
        }, 0);

        if (!lastConfiguredRoutine) {
          results.push({
            docNo: r.ref_request_no,
            ok: false,
            message: "Last approver routine configuration not found",
          });
          continue;
        }

        // last process exclude Requester
        const last = await models.adm_fia_online_req_approver_process.findOne({
          where: {
            request_no: r.ref_request_no,
            approver_type: { [Op.ne]: "Requester" },
          },
          order: [["id", "DESC"]],
          raw: true,
        });

        const lastStatus = last?.approver_status
          ? String(last.approver_status).toUpperCase()
          : null;

        // lastRoutine diambil dari routine approver_type last row
        const lastRoutine = last?.approver_type
          ? typeRoutine.get(last.approver_type) ?? null
          : null;

        const derived = deriveCurrentFromLast(lastStatus, lastRoutine);
        if (derived.isFinal) {
          results.push({
            docNo: r.ref_request_no,
            ok: false,
            message: "Request already final",
          });
          continue;
        }

        if (derived.currentRoutine !== myRoutine) {
          results.push({
            docNo: r.ref_request_no,
            ok: false,
            message: "Request is not in your layer anymore",
          });
          continue;
        }

        const comment = notes?.[r.ref_request_no]
          ? String(notes[r.ref_request_no])
          : "";

        await models.adm_fia_online_req_approver_process.create({
          request_no: r.ref_request_no,
          com_code: emp.emp_company,
          section_code: emp.section_code,
          approver_type: match.approver_type,
          approver_status: mapped,
          approver_id: loginId,
          approved_date: new Date(),
          comments: comment || "",
        });

        const isLastRoutine = Number(myRoutine) >= Number(lastConfiguredRoutine);
        const shouldSyncHeaderStatus =
          isLastRoutine && (mapped === "APPROVED" || mapped === "REJECTED");

        if (shouldSyncHeaderStatus) {
          await models.adm_fia_online_req.update(
            {
              approval_status: mapProcessStatusToHeaderStatus(mapped),
            },
            {
              where: { ref_request_no: r.ref_request_no },
            }
          );
        }

        results.push({ docNo: r.ref_request_no, ok: true });
      }

      const succeededDocNos = results.filter((x) => x.ok).map((x) => x.docNo);
      if (succeededDocNos.length > 0) {
        socketEmitGlobal("approvals-updated", {
          actor_id: String(loginId || ""),
          action: mapped,
          doc_nos: succeededDocNos,
        });
      }

      return res.json({ results });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Failed to update approval status",
        error: err.message,
      });
    }
  }
}

module.exports = ApprovalController;
