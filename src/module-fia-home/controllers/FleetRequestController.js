/**
 * Fleet Request Controller
 * Menggunakan FleetRequestRepository untuk semua operations
 */

const FleetRequestRepository = require('../repositories/FleetRequestRepository');

/**
 * POST /api/fleet-request
 * Create new Fleet Request (Submit Final)
 */
const postFleetRequest = async (req, res) => {
  try {
    // Generate ref_request_no
    const refRequestNo = await FleetRequestRepository.generateRefRequestNo();

    // Check if ref_request_no already exists
    const existing = await FleetRequestRepository.getByRefNo(refRequestNo);
    if (existing) {
      return res.status(409).send({
        message: "Ref request number already exists"
      });
    }

    // Create request dengan is_draft = false
    const responseData = await FleetRequestRepository.create({
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
 * GET /api/fleet-request/:id
 * Get Fleet Request by ID
 */
const getFleetRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await FleetRequestRepository.getById(id);

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
 * GET /api/fleet-request/new
 * Get new form structure (empty form for fleet request)
 */
const getFleetRequestNew = async (req, res) => {
  try {
    const emptyForm = await FleetRequestRepository.getNewForm();

    return res.status(200).send({
      message: "Successfully fetched new form structure.",
      data: emptyForm
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * PUT /api/fleet-request/:id
 * Update Fleet Request
 */
const updateFleetRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Update request
    const responseData = await FleetRequestRepository.update(req.body, id);

    return res.status(200).send({
      message: "Successfully updated item.",
      data: responseData
    });
  } catch (error) {
    if (error.message === 'Fleet request not found') {
      return res.status(404).send({
        message: "Cannot find item"
      });
    }
    return res.status(500).send({ message: error.message });
  }
};

/**
 * GET /api/fleet-request?branch_site=...&status=...
 * Get list of Fleet Requests
 */
const getFleetRequestList = async (req, res) => {
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
    const result = await FleetRequestRepository.getList(filters);

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
 * POST /api/fleet-request/draft
 * Save Fleet Request as Draft
 */
const saveFleetRequestDraft = async (req, res) => {
  try {
    const responseData = await FleetRequestRepository.saveDraft(req.body);

    const isNew = !req.body.header?.refRequestNo;
    const statusCode = isNew ? 201 : 200;
    const message = isNew ? "Successfully saved draft." : "Successfully updated draft.";

    return res.status(statusCode).send({
      message: message,
      data: responseData
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * GET /api/fleet-request/draft
 * Get Fleet Request Draft (latest draft by user)
 */
const getFleetRequestDraft = async (req, res) => {
  try {
    const { request_by } = req.query;

    if (!request_by) {
      return res.status(400).send({
        message: "request_by parameter is required"
      });
    }

    const draft = await FleetRequestRepository.getDraft(request_by);

    if (!draft) {
      return res.status(404).send({
        message: "No draft found"
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

module.exports = {
  postFleetRequest,
  getFleetRequest,
  getFleetRequestNew,
  updateFleetRequest,
  getFleetRequestList,
  saveFleetRequestDraft,
  getFleetRequestDraft
};
