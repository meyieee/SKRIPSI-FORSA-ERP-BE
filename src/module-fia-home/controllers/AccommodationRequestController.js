/**
 * Accommodation Request Controller
 * Menggunakan AccommodationRequestRepository untuk semua operations
 */

const AccommodationRequestRepository = require('../repositories/AccommodationRequestRepository');
const BaseRepository = require('../repositories/FIAOnlineReqBaseRepository');

/**
 * POST /api/accommodation-request
 * Create new Accommodation Request (Submit Final)
 */
const postAccommodationRequest = async (req, res) => {
  try {
    // Generate ref_request_no
    const refRequestNo = await AccommodationRequestRepository.generateRefRequestNo();

    // Che
    const existing = await AccommodationRequestRepository.getByRefNo(refRequestNo);
    if (existing) {
      return res.status(409).send({
        message: "Ref request number already exists"
      });
    }

    // Create request dengan is_draft = false
    const responseData = await AccommodationRequestRepository.create({
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
 * GET /api/accommodation-request/:id
 * Get Accommodation Request by ID
 */
const getAccommodationRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await AccommodationRequestRepository.getById(id);

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
 * GET /api/accommodation-request/new
 * Get new form structure (empty form for accommodation request)
 */
const getAccommodationRequestNew = async (req, res) => {
  try {
    const emptyForm = await AccommodationRequestRepository.getNewForm();

    return res.status(200).send({
      message: "Successfully fetched new form structure.",
      data: emptyForm
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * PUT /api/accommodation-request/:id
 * Update Accommodation Request
 */
const updateAccommodationRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Update request
    const responseData = await AccommodationRequestRepository.update(req.body, id);

    return res.status(200).send({
      message: "Successfully updated item.",
      data: responseData
    });
  } catch (error) {
    if (error.message === 'Accommodation request not found') {
      return res.status(404).send({
        message: "Cannot find item"
      });
    }
    return res.status(500).send({ message: error.message });
  }
};

/**
 * GET /api/accommodation-request?branch_site=...&status=...
 * Get list of Accommodation Requests
 */
const getAccommodationRequestList = async (req, res) => {
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
    const result = await AccommodationRequestRepository.getList(filters);

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
 * POST /api/accommodation-request/draft
 * Save Accommodation Request as Draft
 */
const saveAccommodationRequestDraft = async (req, res) => {
  try {
    const responseData = await AccommodationRequestRepository.saveDraft(req.body);

    return res.status(200).send({
      message: "Successfully saved draft.",
      data: responseData
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * GET /api/accommodation-request/draft?request_by=...
 * Get Accommodation Request Draft by user
 */
const getAccommodationRequestDraft = async (req, res) => {
  try {
    const { request_by } = req.query;

    if (!request_by) {
      return res.status(400).send({
        message: "request_by parameter is required"
      });
    }

    const draft = await AccommodationRequestRepository.getDraft(request_by);

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
 * PUT /api/accommodation-request/:id/status
 * Update workorder status for Accommodation Request
 */
const updateAccommodationRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { workorder_status } = req.body;

    if (!workorder_status) {
      return res.status(400).send({
        message: "workorder_status is required"
      });
    }

    // Check if record exists and is accommodation request
    const existing = await AccommodationRequestRepository.getById(id);
    if (!existing) {
      return res.status(404).send({
        message: "Cannot find item"
      });
    }

    // Update status using base repository
    await BaseRepository.updateStatus(id, workorder_status);

    // Get updated data
    const updated = await AccommodationRequestRepository.getById(id);

    return res.status(200).send({
      message: "Successfully updated status.",
      data: updated
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

module.exports = {
  postAccommodationRequest,
  getAccommodationRequest,
  getAccommodationRequestNew,
  updateAccommodationRequest,
  getAccommodationRequestList,
  saveAccommodationRequestDraft,
  getAccommodationRequestDraft,
  updateAccommodationRequestStatus
};



