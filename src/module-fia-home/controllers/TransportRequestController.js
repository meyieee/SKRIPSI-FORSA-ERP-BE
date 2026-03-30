/**
 * Transport Request Controller
 * Menggunakan TransportRequestRepository untuk semua operations
 */

const TransportRequestRepository = require('../repositories/TransportRequestRepository');
const BaseRepository = require('../repositories/FIAOnlineReqBaseRepository');

/**
 * POST /api/transport-request
 * Create new Transport Request (Submit Final)
 */
const postTransportRequest = async (req, res) => {
  try {
    // Generate ref_request_no
    const refRequestNo = await TransportRequestRepository.generateRefRequestNo();

    // Check if ref_request_no already exists
    const existing = await TransportRequestRepository.getByRefNo(refRequestNo);
    if (existing) {
      return res.status(409).send({
        message: "Ref request number already exists"
      });
    }

    // Create request dengan is_draft = false
    const responseData = await TransportRequestRepository.create({
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
 * GET /api/transport-request/:id
 * Get Transport Request by ID
 */
const getTransportRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await TransportRequestRepository.getById(id);

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
 * GET /api/transport-request/new
 * Get new form structure (empty form for transport request)
 */
const getTransportRequestNew = async (req, res) => {
  try {
    const emptyForm = await TransportRequestRepository.getNewForm();

    return res.status(200).send({
      message: "Successfully fetched new form structure.",
      data: emptyForm
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * PUT /api/transport-request/:id
 * Update Transport Request
 */
const updateTransportRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Update request
    const responseData = await TransportRequestRepository.update(req.body, id);

    return res.status(200).send({
      message: "Successfully updated item.",
      data: responseData
    });
  } catch (error) {
    if (error.message === 'Transport request not found') {
      return res.status(404).send({
        message: "Cannot find item"
      });
    }
    return res.status(500).send({ message: error.message });
  }
};

/**
 * GET /api/transport-request?branch_site=...&status=...
 * Get list of Transport Requests
 */
const getTransportRequestList = async (req, res) => {
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
    const result = await TransportRequestRepository.getList(filters);

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
 * POST /api/transport-request/draft
 * Save Transport Request as Draft
 */
const saveTransportRequestDraft = async (req, res) => {
  try {
    const responseData = await TransportRequestRepository.saveDraft(req.body);

    return res.status(200).send({
      message: "Successfully saved draft.",
      data: responseData
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * GET /api/transport-request/draft?request_by=...
 * Get Transport Request Draft by user
 */
const getTransportRequestDraft = async (req, res) => {
  try {
    const { request_by } = req.query;

    if (!request_by) {
      return res.status(400).send({
        message: "request_by parameter is required"
      });
    }

    const draft = await TransportRequestRepository.getDraft(request_by);

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
 * PUT /api/transport-request/:id/status
 * Update workorder status for Transport Request
 */
const updateTransportRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { workorder_status } = req.body;

    if (!workorder_status) {
      return res.status(400).send({
        message: "workorder_status is required"
      });
    }

    // Check if record exists and is transport request
    const existing = await TransportRequestRepository.getById(id);
    if (!existing) {
      return res.status(404).send({
        message: "Cannot find item"
      });
    }

    // Update status using base repository
    await BaseRepository.updateStatus(id, workorder_status);

    // Get updated data
    const updated = await TransportRequestRepository.getById(id);

    return res.status(200).send({
      message: "Successfully updated status.",
      data: updated
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

module.exports = {
  postTransportRequest,
  getTransportRequest,
  getTransportRequestNew,
  updateTransportRequest,
  getTransportRequestList,
  saveTransportRequestDraft,
  getTransportRequestDraft,
  updateTransportRequestStatus
};





