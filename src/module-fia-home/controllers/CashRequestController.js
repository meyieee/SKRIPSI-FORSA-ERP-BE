/**
 * Cash Request Controller
 * Menggunakan CashRequestRepository untuk semua operations
 */

const CashRequestRepository = require('../repositories/CashRequestRepository');
const BaseRepository = require('../repositories/FIAOnlineReqBaseRepository');

/**
 * POST /api/cash-request
 * Create new Cash Request (Submit Final)
 */
const postCashRequest = async (req, res) => {
  try {
    // Generate ref_request_no
    const refRequestNo = await CashRequestRepository.generateRefRequestNo();

    // Check if ref_request_no already exists
    const existing = await CashRequestRepository.getByRefNo(refRequestNo);
    if (existing) {
      return res.status(409).send({
        message: "Ref request number already exists"
      });
    }

    // Create request dengan is_draft = false
    const responseData = await CashRequestRepository.create({
      ...req.body,
      header: {
        ...req.body.header,
        refRequestNo: refRequestNo
      },
      is_draft: false
    });

    return res.status(201).send({
      message: "Successfully created item.",
      data: responseData
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * GET /api/cash-request/:id
 * Get Cash Request by ID
 */
const getCashRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await CashRequestRepository.getById(id);

    if (!result) {
      return res.status(404).send({
        message: "Item cannot be found."
      });
    }

    return res.status(200).send({
      message: "Successfully fetched item.",
      data: result
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * GET /api/cash-request/new
 * Get new form structure (empty form for cash request)
 */
const getCashRequestNew = async (req, res) => {
  try {
    const emptyForm = await CashRequestRepository.getNewForm();

    return res.status(200).send({
      message: "Successfully fetched new form structure.",
      data: emptyForm
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * PUT /api/cash-request/:id
 * Update Cash Request
 */
const updateCashRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Update request
    const responseData = await CashRequestRepository.update(req.body, id);

    return res.status(200).send({
      message: "Successfully updated item.",
      data: responseData
    });
  } catch (error) {
    if (error.message === 'Cash request not found') {
      return res.status(404).send({
        message: "Cannot find item"
      });
    }
    return res.status(500).send({ message: error.message });
  }
};

/**
 * GET /api/cash-request?branch_site=...&status=...
 * Get list of Cash Requests
 */
const getCashRequestList = async (req, res) => {
  try {
    const { branch_site, status, limit, offset, include_draft } = req.query;

    // Build filters
    const filters = {
      branch_site: branch_site || null,
      workorder_status: status || null,
      limit: limit || 50,
      offset: offset || 0,
      include_draft: include_draft || 'false'
    };

    // Get list
    const result = await CashRequestRepository.getList(filters);

    return res.status(200).send({
      message: "Successfully fetched data.",
      data: result.data,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset
      }
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * POST /api/cash-request/draft
 * Save Cash Request as Draft
 */
const saveCashRequestDraft = async (req, res) => {
  try {
    const responseData = await CashRequestRepository.saveDraft(req.body);

    return res.status(200).send({
      message: "Successfully saved draft.",
      data: responseData
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * GET /api/cash-request/draft?request_by=...
 * Get Cash Request Draft by user
 */
const getCashRequestDraft = async (req, res) => {
  try {
    const { request_by } = req.query;

    if (!request_by) {
      return res.status(400).send({
        message: "request_by parameter is required"
      });
    }

    const draft = await CashRequestRepository.getDraft(request_by);

    if (!draft) {
      return res.status(404).send({
        message: "Draft not found"
      });
    }

    return res.status(200).send({
      message: "Successfully fetched draft.",
      data: draft
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * PUT /api/cash-request/:id/status
 * Update workorder status for Cash Request
 */
const updateCashRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { workorder_status } = req.body;

    if (!workorder_status) {
      return res.status(400).send({
        message: "workorder_status is required"
      });
    }

    // Check if record exists and is cash request
    const existing = await CashRequestRepository.getById(id);
    if (!existing) {
      return res.status(404).send({
        message: "Cannot find item"
      });
    }

    // Update status using base repository
    await BaseRepository.updateStatus(id, workorder_status);

    // Get updated data
    const updated = await CashRequestRepository.getById(id);

    return res.status(200).send({
      message: "Successfully updated status.",
      data: updated
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

module.exports = {
  postCashRequest,
  getCashRequest,
  getCashRequestNew,
  updateCashRequest,
  getCashRequestList,
  saveCashRequestDraft,
  getCashRequestDraft,
  updateCashRequestStatus
};





