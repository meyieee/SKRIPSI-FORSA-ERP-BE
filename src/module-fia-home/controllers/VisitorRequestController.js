/**
 * Visitor Request Controller
 * Menggunakan VisitorRequestRepository untuk semua operations
 */

const VisitorRequestRepository = require('../repositories/VisitorRequestRepository');
const BaseRepository = require('../repositories/FIAOnlineReqBaseRepository');

/**
 * POST /api/visitor-request
 * Create new Visitor Request (Submit Final)
 */
const postVisitorRequest = async (req, res) => {
  try {
    // Generate ref_request_no
    const refRequestNo = await VisitorRequestRepository.generateRefRequestNo();

    // Check if ref_request_no already exists
    const existing = await VisitorRequestRepository.getByRefNo(refRequestNo);
    if (existing) {
      return res.status(409).send({
        message: "Ref request number already exists"
      });
    }

    // Create request dengan is_draft = false
    const responseData = await VisitorRequestRepository.create({
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
 * GET /api/visitor-request/:id
 * Get Visitor Request by ID
 */
const getVisitorRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await VisitorRequestRepository.getById(id);

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
 * GET /api/visitor-request/new
 * Get new form structure (empty form for visitor request)
 */
const getVisitorRequestNew = async (req, res) => {
  try {
    const emptyForm = await VisitorRequestRepository.getNewForm();

    return res.status(200).send({
      message: "Successfully fetched new form structure.",
      data: emptyForm
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * PUT /api/visitor-request/:id
 * Update Visitor Request
 */
const updateVisitorRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Update request
    const responseData = await VisitorRequestRepository.update(req.body, id);

    return res.status(200).send({
      message: "Successfully updated item.",
      data: responseData
    });
  } catch (error) {
    if (error.message === 'Visitor request not found') {
      return res.status(404).send({
        message: "Cannot find item"
      });
    }
    return res.status(500).send({ message: error.message });
  }
};

/**
 * GET /api/visitor-request?branch_site=...&status=...
 * Get list of Visitor Requests
 */
const getVisitorRequestList = async (req, res) => {
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
    const result = await VisitorRequestRepository.getList(filters);

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
 * POST /api/visitor-request/draft
 * Save Visitor Request as Draft
 */
const saveVisitorRequestDraft = async (req, res) => {
  try {
    const responseData = await VisitorRequestRepository.saveDraft(req.body);

    return res.status(200).send({
      message: "Successfully saved draft.",
      data: responseData
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * GET /api/visitor-request/draft?request_by=...
 * Get Visitor Request Draft by user
 */
const getVisitorRequestDraft = async (req, res) => {
  try {
    const { request_by } = req.query;

    if (!request_by) {
      return res.status(400).send({
        message: "request_by parameter is required"
      });
    }

    const draft = await VisitorRequestRepository.getDraft(request_by);

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
 * PUT /api/visitor-request/:id/status
 * Update workorder status for Visitor Request
 */
const updateVisitorRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { workorder_status } = req.body;

    if (!workorder_status) {
      return res.status(400).send({
        message: "workorder_status is required"
      });
    }

    // Check if record exists and is visitor request
    const existing = await VisitorRequestRepository.getById(id);
    if (!existing) {
      return res.status(404).send({
        message: "Cannot find item"
      });
    }

    // Update status using base repository
    await BaseRepository.updateStatus(id, workorder_status);

    // Get updated data
    const updated = await VisitorRequestRepository.getById(id);

    return res.status(200).send({
      message: "Successfully updated status.",
      data: updated
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

module.exports = {
  postVisitorRequest,
  getVisitorRequest,
  getVisitorRequestNew,
  updateVisitorRequest,
  getVisitorRequestList,
  saveVisitorRequestDraft,
  getVisitorRequestDraft,
  updateVisitorRequestStatus
};

























