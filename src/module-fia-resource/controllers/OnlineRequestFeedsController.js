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

function computeStatusLabel(currentRoutine, totalProcess, isPendingOverride) {
  if (isPendingOverride) return "Pending";
  if (currentRoutine === 1) return "Waiting for Verification";
  if (currentRoutine === 2) return "Waiting for Review";

  const total = Number(totalProcess || 0) || 3;
  const approverTotal = Math.max(0, total - 2);
  const approverIndex = currentRoutine - 2;

  if (approverTotal <= 0 || approverIndex <= 0) {
    return "Approver - Waiting For Approval";
  }
  if (approverTotal === 1) return "Approval - Waiting for Approval";
  if (approverTotal === 2) {
    return approverIndex === 2
      ? "Approver - Waiting For Final Approval"
      : "Approver - Waiting For Approval";
  }
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

  return {
    currentRoutine: 1,
    isFinal: false,
    isPending: false,
    finalLabel: null,
  };
}

function calcExpiredText(requestDateRaw) {
  const dt = parseDateOnlySafe(requestDateRaw);
  if (!dt) return "";

  const now = new Date();
  const normalized = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = today.getTime() - normalized.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "0 Days";
  return `${diffDays} Days`;
}

function getRequestRepositoryByType(requestType) {
  return requestRepositories[String(requestType || "").trim()] || null;
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

function applySearchFilter(whereParts, replacements, columnSql, value, key) {
  if (!value) return;
  whereParts.push(`${columnSql} LIKE :${key}`);
  replacements[key] = `%${String(value).trim()}%`;
}

class OnlineRequestFeedsController {
  // GET /fia-home/command/feeds/online-request
  static async getGlobalOnlineRequestHistory(req, res) {
    try {
      const { id_number: loginId } = await resolveLoginEmployee(req);
      if (!loginId) {
        return res.status(401).json({ message: "User id_number not found" });
      }

      const hasAccess = await ensureGlobalFeedsAccess(loginId);
      if (!hasAccess) {
        return res.status(403).json({ message: "You do not have access to global request feeds" });
      }

      const { site, department, section, element, date } = req.query || {};
      const whereParts = ["r.is_draft = 0"];
      const replacements = {};

      applySearchFilter(
        whereParts,
        replacements,
        "COALESCE(r.branch_site, req_for_emp.emp_company, '')",
        site,
        "site"
      );
      applySearchFilter(
        whereParts,
        replacements,
        "COALESCE(r.department, req_for_emp.dept_code, '')",
        department,
        "department"
      );
      applySearchFilter(
        whereParts,
        replacements,
        "COALESCE(req_for_emp.section_code, '')",
        section,
        "section"
      );
      applySearchFilter(
        whereParts,
        replacements,
        "COALESCE(r.cost_center, req_for_emp.cost_center, '')",
        element,
        "element"
      );

      if (date) {
        const parsed = parseDateOnlySafe(date);
        if (!parsed) {
          return res.status(400).json({ message: "Invalid date format, use yyyy-mm-dd" });
        }
        const yyyy = parsed.getFullYear();
        const mm = String(parsed.getMonth() + 1).padStart(2, "0");
        const dd = String(parsed.getDate()).padStart(2, "0");
        replacements.requestDate = `${yyyy}-${mm}-${dd}`;
        whereParts.push("DATE(r.request_date) = :requestDate");
      }

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
          r.branch_site,
          r.department,
          r.cost_center,

          req_for_emp.section_code AS req_for_section,
          req_for_emp.emp_company AS req_for_site,
          req_by_emp.first_name AS req_by_first_name,
          req_by_emp.middle_name AS req_by_middle_name,
          req_by_emp.last_name AS req_by_last_name,
          req_by_emp.nick_name AS req_by_nick_name,

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
        LEFT JOIN tbl_emp_regs req_for_emp
          ON req_for_emp.id_number = r.request_for
        LEFT JOIN tbl_emp_regs req_by_emp
          ON req_by_emp.id_number = r.request_by
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
        WHERE ${whereParts.join(" AND ")}
        ORDER BY r.id DESC
      `;

      const rows = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        replacements,
      });

      const data = rows.map((r, idx) => {
        const totalProcess = Number(r.no_approval_process || 0) || 3;
        const lastRoutine =
          r.last_routine != null ? Number(r.last_routine) : null;
        const lastStatus = String(r.last_status || "").trim().toUpperCase();
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
          } else if (derived.currentRoutine && derived.currentRoutine > totalProcess) {
            statusLabel = finalStatusLabel || "Approved";
          } else {
            statusLabel = computeStatusLabel(
              derived.currentRoutine || 1,
              totalProcess,
              derived.isPending
            );
          }
        }

        const requestorFullName = [
          r.req_by_first_name,
          r.req_by_middle_name,
          r.req_by_last_name,
        ]
          .filter(Boolean)
          .join(" ");

        return {
          id: r.id,
          no: idx + 1,
          refDocNo: r.ref_request_no,
          description: r.request_description || r.request_purpose || "",
          transType: r.request_name || r.request_type,
          requestor: requestorFullName || r.req_by_nick_name || r.request_by || "",
          priority: mapPriorityToBadge(r.priority),
          requestDate: fmtDateDDMonYY(r.request_date),
          expired: calcExpiredText(r.request_date),
          status: statusLabel,
          site: r.branch_site || r.req_for_site || "",
          department: r.department || "",
          section: r.req_for_section || "",
          element: r.cost_center || "",
        };
      });

      return res.json({ data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Failed to load global online request history",
        error: err.message,
      });
    }
  }

  // GET /fia-home/command/feeds/online-request/:refDocNo/detail
  static async getGlobalOnlineRequestDetail(req, res) {
    try {
      const { id_number: loginId } = await resolveLoginEmployee(req);
      if (!loginId) {
        return res.status(401).json({ message: "User id_number not found" });
      }

      const hasAccess = await ensureGlobalFeedsAccess(loginId);
      if (!hasAccess) {
        return res.status(403).json({ message: "You do not have access to global request feeds" });
      }

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
          "request_description",
          "request_purpose",
          "request_by",
          "priority",
          "request_date",
          "cost_center",
          "branch_site",
          "department",
        ],
        raw: true,
      });

      if (!requestRow) {
        return res.status(404).json({ message: "Request not found" });
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

      const requestorEmp = await models.tbl_emp_regs.findOne({
        where: { id_number: requestRow.request_by },
        attributes: ["first_name", "middle_name", "last_name", "nick_name"],
        raw: true,
      });

      const requestorName = requestorEmp
        ? [requestorEmp.first_name, requestorEmp.middle_name, requestorEmp.last_name]
            .filter(Boolean)
            .join(" ") || requestorEmp.nick_name || requestRow.request_by
        : requestRow.request_by;

      return res.json({
        data: {
          id: requestRow.id,
          refDocNo: requestRow.ref_request_no,
          description: requestRow.request_description || requestRow.request_purpose || "",
          transType: requestRow.request_type,
          requestor: requestorName || "",
          priority: mapPriorityToBadge(requestRow.priority),
          requestDate: fmtDateDDMonYY(requestRow.request_date),
          expired: calcExpiredText(requestRow.request_date),
          site: requestRow.branch_site || "",
          department: requestRow.department || "",
          element: requestRow.cost_center || "",
          detail,
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Failed to load global request detail",
        error: err.message,
      });
    }
  }
}

module.exports = OnlineRequestFeedsController;
