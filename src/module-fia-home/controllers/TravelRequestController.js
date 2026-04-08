/**
 * Travel Request Controller
 * Menggunakan TravelRequestRepository untuk semua operations
 */

const TravelRequestRepository = require('../repositories/TravelRequestRepository');
const BaseRepository = require('../repositories/FIAOnlineReqBaseRepository');

/**
 * POST /api/travel-request
 * Create new Travel Request (Submit Final)
 */
const postTravelRequest = async (req, res) => {
  try {
    // Generate ref_request_no
    const refRequestNo = await TravelRequestRepository.generateRefRequestNo();

    // Check if ref_request_no already exists
    const existing = await TravelRequestRepository.getByRefNo(refRequestNo);
    if (existing) {
      return res.status(409).send({
        message: "Ref request number already exists"
      });
    }

    // Create request dengan is_draft = false
    const responseData = await TravelRequestRepository.create({
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
 * GET /api/travel-request/:id
 * Get Travel Request by ID
 */
const getTravelRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await TravelRequestRepository.getById(id);

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
 * GET /api/travel-request/new
 * Get new form structure (empty form for travel request)
 */
const getTravelRequestNew = async (req, res) => {
  try {
    const emptyForm = await TravelRequestRepository.getNewForm();

    return res.status(200).send({
      message: "Successfully fetched new form structure.",
      data: emptyForm
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * PUT /api/travel-request/:id
 * Update Travel Request
 */
const updateTravelRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Update request
    const responseData = await TravelRequestRepository.update(req.body, id);

    return res.status(200).send({
      message: "Successfully updated item.",
      data: responseData
    });
  } catch (error) {
    if (error.message === 'Travel request not found') {
      return res.status(404).send({
        message: "Cannot find item"
      });
    }
    return res.status(500).send({ message: error.message });
  }
};

/**
 * GET /api/travel-request?branch_site=...&status=...
 * Get list of Travel Requests
 */
const getTravelRequestList = async (req, res) => {
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
    const result = await TravelRequestRepository.getList(filters);

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
 * PUT /api/travel-request/:id/status
 * Update workorder status for Travel Request
 */
const updateTravelRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { workorder_status } = req.body;

    if (!workorder_status) {
      return res.status(400).send({
        message: "workorder_status is required"
      });
    }

    // Check if record exists and is travel request
    const existing = await TravelRequestRepository.getById(id);
    if (!existing) {
      return res.status(404).send({
        message: "Cannot find item"
      });
    }

    // Update status using base repository
    await BaseRepository.updateStatus(id, workorder_status);

    // Get updated data
    const updated = await TravelRequestRepository.getById(id);

    return res.status(200).send({
      message: "Successfully updated status.",
      data: updated
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

module.exports = {
  postTravelRequest,
  getTravelRequest,
  getTravelRequestNew,
  updateTravelRequest,
  getTravelRequestList,
  updateTravelRequestStatus
};

