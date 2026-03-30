// src/module-fia-resource/controllers/RequestsController.js

const { Op, QueryTypes } = require("sequelize");
const sequelize = require("../../database");
const {
  getUserByNameRepository,
} = require("../../module-cf-master/repositories/UserRepository");
const JobRequestRepository = require("../../module-fia-home/repositories/JobRequestRepository");
const FleetRequestRepository = require("../../module-fia-home/repositories/FleetRequestRepository");
const TrainingRequestRepository = require("../../module-fia-home/repositories/TrainingRequestRepository");
const InspectionDefectRepository = require("../../module-fia-home/repositories/InspectionDefectRepository");
const TravelRequestRepository = require("../../module-fia-home/repositories/TravelRequestRepository");
const WorkforceRequestRepository = require("../../module-fia-home/repositories/WorkforceRequestRepository");
const AssetRequestRepository = require("../../module-fia-home/repositories/AssetRequestRepository");
const CashRequestRepository = require("../../module-fia-home/repositories/CashRequestRepository");
const AccommodationRequestRepository = require("../../module-fia-home/repositories/AccommodationRequestRepository");
const TransportRequestRepository = require("../../module-fia-home/repositories/TransportRequestRepository");
const VisitorRequestRepository = require("../../module-fia-home/repositories/VisitorRequestRepository");
const PurchaseRequisitionRepository = require("../../module-fia-home/repositories/PurchaseRequisitionRepository");

const models = sequelize.models;
const requestRepositories = {
  "job-request": JobRequestRepository,
  "fleet-request": FleetRequestRepository,
  "training-request": TrainingRequestRepository,
  "inspection-defect": InspectionDefectRepository,
  "travel-request": TravelRequestRepository,
  "workforce-request": WorkforceRequestRepository,
  "asset-request": AssetRequestRepository,
  "cash-request": CashRequestRepository,
  "accommodation-request": AccommodationRequestRepository,
  "transport-request": TransportRequestRepository,
  "visitor-request": VisitorRequestRepository,
  "purchase-requisition": PurchaseRequisitionRepository,
};

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

function mapPriorityToBadge(priorityRaw) {
  const p = String(priorityRaw ?? "").trim();
  // di DB kamu default "3", jadi anggap 1/2/3
  if (p === "1" || p.toUpperCase() === "P#1") return "P#1";
  if (p === "2" || p.toUpperCase() === "P#2") return "P#2";
  if (p === "3" || p.toUpperCase() === "P#3") return "P#3";
  return p ? `P#${p}` : "P#3";
}

function normalizeApproverRole(
  approverTypeRaw,
  approverDescriptionRaw,
  approverRoutineRaw
) {
  const approverType = String(approverTypeRaw || "").trim();
  const approverDescription = String(approverDescriptionRaw || "").trim();
  const source = `${approverType} ${approverDescription}`.toLowerCase();
  const approverRoutine =
    approverRoutineRaw != null ? Number(approverRoutineRaw) : null;

  if (!source) return "";

  if (
    source.includes("verifier") ||
    source.includes("verification") ||
    source.includes("planner") ||
    source.includes("clerk")
  ) {
    return "Planner";
  }

  if (
    source.includes("reviewer") ||
    source.includes("review") ||
    source.includes("supervisor") ||
    source.includes("leader")
  ) {
    return "Supervisor";
  }

  if (source.includes("director") || source.includes("bod")) {
    return "Director";
  }

  if (
    source.includes("manager") ||
    source.includes("department head") ||
    source.includes("approver")
  ) {
    if (Number.isFinite(approverRoutine) && approverRoutine >= 3) {
      return `Manager ${approverRoutine - 2}`;
    }
    return "Manager";
  }

  return approverDescription || approverType;
}

function computeFinalStatusLabel(
  lastStatusRaw,
  approverTypeRaw,
  approverDescriptionRaw,
  approverRoutineRaw
) {
  const lastStatus = String(lastStatusRaw || "").trim().toUpperCase();
  const role = normalizeApproverRole(
    approverTypeRaw,
    approverDescriptionRaw,
    approverRoutineRaw
  );

  if (lastStatus === "REJECTED") {
    return role ? `Rejected By ${role}` : "Rejected";
  }

  if (lastStatus === "APPROVED") {
    return role ? `Approved By ${role}` : "Approved";
  }

  return "";
}

function getRoutineLabel(routineRaw) {
  const routine = routineRaw != null ? Number(routineRaw) : null;
  if (routine === 1) return "Planner";
  if (routine === 2) return "Supervisor";
  if (Number.isFinite(routine) && routine >= 3) return `Manager ${routine - 2}`;
  return "";
}

function getRequestRepositoryByType(requestType) {
  return requestRepositories[String(requestType || "").trim()] || null;
}

// routine 1 verifier, 2 reviewer, 3.. approver
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

function deriveCurrentFromLast(lastStatusRaw, lastRoutineRaw) {
  const lastStatus = lastStatusRaw ? String(lastStatusRaw).toUpperCase() : null;
  const lastRoutine = lastRoutineRaw != null ? Number(lastRoutineRaw) : null;

  if (!lastStatus)
    return {
      currentRoutine: 1,
      isFinal: false,
      isPending: false,
      finalLabel: null,
    };

  if (lastStatus === "REJECTED")
    return {
      currentRoutine: null,
      isFinal: true,
      isPending: false,
      finalLabel: "Rejected",
    };

  if (lastStatus === "PENDING") {
    return {
      currentRoutine: Number(lastRoutine || 1),
      isFinal: false,
      isPending: true,
      finalLabel: null,
    };
  }

  if (lastStatus === "APPROVED") {
    return {
      currentRoutine: Number(lastRoutine || 1) + 1,
      isFinal: false,
      isPending: false,
      finalLabel: null,
    };
  }

  // SUBMITTED atau lainnya
  return {
    currentRoutine: 1,
    isFinal: false,
    isPending: false,
    finalLabel: null,
  };
}

class RequestsController {
  // GET /fia-resource/requests
  static async getMyRequests(req, res) {
    try {
      const { id_number: loginId, first_name } = await resolveLoginEmployee(
        req
      );
      if (!loginId)
        return res.status(401).json({ message: "User id_number not found" });

      const models = sequelize.models;

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
          r.priority,
          r.approval_status,

          an.request_name,
          an.no_approval_process,

          lp.approver_status AS last_status,
          lp.approver_type AS last_approver_type,
          lp.comments AS last_comments,
          lp.created_at AS last_created_at,
          atp.routine AS last_routine,
          atp.approver_description AS last_approver_description

        FROM adm_fia_online_req r
        LEFT JOIN adm_fia_online_approval_no an
          ON an.request_type = r.request_type

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
          AND (r.request_by = :loginId OR r.request_for = :loginId)
        ORDER BY r.id DESC
      `;

      const rows = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        replacements: { loginId },
      });

      const data = rows.map((r, idx) => {
        const totalProcess = Number(r.no_approval_process || 0) || 3;
        const lastRoutine =
          r.last_routine != null ? Number(r.last_routine) : null;
        const lastStatus = String(r.last_status || "").trim().toUpperCase();
        const lastComments = r.last_comments || "";
        const finalStatusLabel = computeFinalStatusLabel(
          r.last_status,
          r.last_approver_type,
          r.last_approver_description,
          r.last_routine
        );
        const normalizedApprovalStatus = String(r.approval_status || "").trim();

        let statusLabel = "";
        if (lastStatus === "REJECTED") {
          statusLabel = finalStatusLabel || "Rejected";
        } else if (lastStatus === "APPROVED" && lastRoutine != null && lastRoutine >= totalProcess) {
          statusLabel = finalStatusLabel || "Approved";
        } else if (
          normalizedApprovalStatus &&
          !["APPROVED", "REJECTED"].includes(normalizedApprovalStatus.toUpperCase())
        ) {
          statusLabel = normalizedApprovalStatus;
        } else {
          const derived = deriveCurrentFromLast(r.last_status, r.last_routine);

          if (derived.isFinal) {
            statusLabel = finalStatusLabel || derived.finalLabel || "Rejected";
          } else if (
            derived.currentRoutine &&
            derived.currentRoutine > totalProcess
          ) {
            // sudah melewati semua layer => final approved
            statusLabel = finalStatusLabel || "Approved";
          } else {
            statusLabel = computeStatusLabel(
              derived.currentRoutine || 1,
              totalProcess,
              derived.isPending
            );
          }
        }

        return {
          id: r.id, // id DB (biar stabil untuk key)
          ref_doc_no: r.ref_request_no,
          description: r.request_description || r.request_purpose || "",
          trans_type: r.request_name || r.request_type,
          priority: mapPriorityToBadge(r.priority),
          request_date: fmtDateDDMonYY(r.request_date),
          status: statusLabel,
          approval_comment:
            (lastStatus === "REJECTED" && lastComments) ||
            (lastStatus === "APPROVED" &&
              lastRoutine != null &&
              lastRoutine >= totalProcess &&
              lastComments)
              ? lastComments
              : "",
        };
      });

      return res.json({ userFirstName: first_name, data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Failed to load requests",
        error: err.message,
      });
    }
  }

  // GET /fia-resource/requests/:refDocNo/history
  static async getRequestHistory(req, res) {
    try {
      const { id_number: loginId } = await resolveLoginEmployee(req);
      if (!loginId)
        return res.status(401).json({ message: "User id_number not found" });

      const refDocNo = String(req.params?.refDocNo || "").trim();
      if (!refDocNo) {
        return res.status(400).json({ message: "refDocNo is required" });
      }

      const requestRow = await models.adm_fia_online_req.findOne({
        where: {
          ref_request_no: refDocNo,
          is_draft: 0,
          [Op.or]: [{ request_by: loginId }, { request_for: loginId }],
        },
        attributes: ["ref_request_no"],
        raw: true,
      });

      if (!requestRow) {
        return res.status(404).json({ message: "Request not found" });
      }

      const sql = `
        SELECT
          p.id,
          p.request_no,
          p.approver_status,
          p.comments,
          p.created_at,
          p.approved_date,
          p.approver_id,
          p.approver_type,
          atp.routine,
          atp.approver_description
        FROM adm_fia_online_req_approver_process p
        LEFT JOIN adm_fia_online_req_approver_type atp
          ON atp.approver_type = p.approver_type
        WHERE p.request_no = :refDocNo
          AND p.approver_type <> 'Requester'
        ORDER BY COALESCE(atp.routine, 999), p.id ASC
      `;

      const rows = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        replacements: { refDocNo },
      });

      const approverIds = [...new Set(rows.map((row) => row.approver_id).filter(Boolean))];
      let empNameMap = new Map();

      if (approverIds.length) {
        const empRows = await models.tbl_emp_regs.findAll({
          where: { id_number: { [Op.in]: approverIds } },
          attributes: ["id_number", "first_name", "middle_name", "last_name", "nick_name"],
          raw: true,
        });

        empNameMap = new Map(
          empRows.map((emp) => {
            const full = [emp.first_name, emp.middle_name, emp.last_name]
              .filter(Boolean)
              .join(" ");
            return [emp.id_number, full || emp.nick_name || emp.id_number];
          })
        );
      }

      const data = rows.map((row) => ({
        id: row.id,
        routine_label:
          getRoutineLabel(row.routine) ||
          normalizeApproverRole(
            row.approver_type,
            row.approver_description,
            row.routine
          ) ||
          row.approver_type,
        status: String(row.approver_status || "").trim(),
        comment: row.comments || "",
        approver_name: empNameMap.get(row.approver_id) || row.approver_id || "",
        action_date: fmtDateDDMonYY(row.approved_date || row.created_at),
      }));

      return res.json({ data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Failed to load request history",
        error: err.message,
      });
    }
  }

  // GET /fia-resource/requests/:refDocNo/detail
  static async getRequestDetail(req, res) {
    try {
      const { id_number: loginId } = await resolveLoginEmployee(req);
      if (!loginId)
        return res.status(401).json({ message: "User id_number not found" });

      const refDocNo = String(req.params?.refDocNo || "").trim();
      if (!refDocNo) {
        return res.status(400).json({ message: "refDocNo is required" });
      }

      const requestRow = await models.adm_fia_online_req.findOne({
        where: {
          ref_request_no: refDocNo,
          is_draft: 0,
        },
        attributes: [
          "id",
          "ref_request_no",
          "request_type",
          "request_by",
          "request_for",
        ],
        raw: true,
      });

      if (!requestRow) {
        return res.status(404).json({ message: "Request not found" });
      }

      let hasAccess =
        requestRow.request_by === loginId || requestRow.request_for === loginId;

      if (!hasAccess) {
        const hasHistory = await models.adm_fia_online_req_approver_process.findOne({
          where: {
            request_no: refDocNo,
            approver_id: loginId,
          },
          attributes: ["id"],
          raw: true,
        });

        hasAccess = Boolean(hasHistory);
      }

      if (!hasAccess && requestRow.request_for) {
        const targetEmp = await models.tbl_emp_regs.findOne({
          where: { id_number: requestRow.request_for },
          attributes: ["emp_company", "section_code"],
          raw: true,
        });

        if (targetEmp) {
          const assignedMaster =
            await models.adm_fia_online_req_approver_master.findOne({
              where: {
                request_type: requestRow.request_type,
                com_code: targetEmp.emp_company,
                section_code: targetEmp.section_code,
                approver_id: loginId,
                routine: { [Op.like]: "Y%" },
              },
              attributes: ["id"],
              raw: true,
            });

          hasAccess = Boolean(assignedMaster);
        }
      }

      if (!hasAccess) {
        return res.status(403).json({ message: "You do not have access to this request" });
      }

      const repository = getRequestRepositoryByType(requestRow.request_type);
      if (!repository?.getByRefNo) {
        return res.status(400).json({
          message: `Unsupported request type: ${requestRow.request_type}`,
        });
      }

      const detail = await repository.getByRefNo(refDocNo);
      if (!detail) {
        return res.status(404).json({ message: "Request detail not found" });
      }

      return res.json({
        data: {
          ref_doc_no: requestRow.ref_request_no,
          request_type: requestRow.request_type,
          detail,
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Failed to load request detail",
        error: err.message,
      });
    }
  }
}

module.exports = RequestsController;
