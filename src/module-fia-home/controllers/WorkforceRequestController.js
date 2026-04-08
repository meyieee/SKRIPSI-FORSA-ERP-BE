/**
 * Workforce Request Controller
 * Menggunakan WorkforceRequestRepository untuk semua operations
 */

const WorkforceRequestRepository = require('../repositories/WorkforceRequestRepository');
const BaseRepository = require('../repositories/FIAOnlineReqBaseRepository');

/**
 * POST /api/workforce-request
 * Create new Workforce Request (Submit Final)
 */
const postWorkforceRequest = async (req, res) => {
  try {
    // Generate ref_request_no
    const refRequestNo = await WorkforceRequestRepository.generateRefRequestNo();

    // Check if ref_request_no already exists
    const existing = await WorkforceRequestRepository.getByRefNo(refRequestNo);
    if (existing) {
      return res.status(409).send({
        message: "Ref request number already exists"
      });
    }

    // Create request dengan is_draft = false
    const responseData = await WorkforceRequestRepository.create({
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
 * GET /api/workforce-request/:id
 * Get Workforce Request by ID
 */
const getWorkforceRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await WorkforceRequestRepository.getById(id);

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
 * GET /api/workforce-request/new
 * Get new form structure (empty form for workforce request)
 */
const getWorkforceRequestNew = async (req, res) => {
  try {
    const emptyForm = await WorkforceRequestRepository.getNewForm();

    return res.status(200).send({
      message: "Successfully fetched new form structure.",
      data: emptyForm
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * PUT /api/workforce-request/:id
 * Update Workforce Request
 */
const updateWorkforceRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Update request
    const responseData = await WorkforceRequestRepository.update(req.body, id);

    return res.status(200).send({
      message: "Successfully updated item.",
      data: responseData
    });
  } catch (error) {
    if (error.message === 'Workforce request not found') {
      return res.status(404).send({
        message: "Cannot find item"
      });
    }
    return res.status(500).send({ message: error.message });
  }
};

/**
 * GET /api/workforce-request?branch_site=...&status=...
 * Get list of Workforce Requests
 */
const getWorkforceRequestList = async (req, res) => {
  try {
    const { branch_site, status, limit, offset } = req.query;

    // Build filters
    const filters = {
      branch_site: branch_site || null,
      workorder_status: status || null,
      limit: limit || 50,
      offset: offset || 0
    };

    // Get list
    const result = await WorkforceRequestRepository.getList(filters);

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
 * PUT /api/workforce-request/:id/status
 * Update workorder status for Workforce Request
 */
const updateWorkforceRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { workorder_status } = req.body;

    if (!workorder_status) {
      return res.status(400).send({
        message: "workorder_status is required"
      });
    }

    // Check if record exists and is workforce request
    const existing = await WorkforceRequestRepository.getById(id);
    if (!existing) {
      return res.status(404).send({
        message: "Cannot find item"
      });
    }

    // Update status using base repository
    await BaseRepository.updateStatus(id, workorder_status);

    // Get updated data
    const updated = await WorkforceRequestRepository.getById(id);

    return res.status(200).send({
      message: "Successfully updated status.",
      data: updated
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

module.exports = {
  postWorkforceRequest,
  getWorkforceRequest,
  getWorkforceRequestNew,
  updateWorkforceRequest,
  getWorkforceRequestList,
  updateWorkforceRequestStatus
};

