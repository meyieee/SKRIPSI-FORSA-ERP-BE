/**
 * Training Request Controller
 * Menggunakan TrainingRequestRepository untuk semua operations
 */

const TrainingRequestRepository = require('../repositories/TrainingRequestRepository');

/**
 * POST /api/training-request
 * Create new Training Request (Submit Final)
 */
const postTrainingRequest = async (req, res) => {
  try {
    // Generate ref_request_no
    const refRequestNo = await TrainingRequestRepository.generateRefRequestNo();

    // Check if ref_request_no already exists
    const existing = await TrainingRequestRepository.getByRefNo(refRequestNo);
    if (existing) {
      return res.status(409).send({
        message: "Ref request number already exists"
      });
    }

    // Create request dengan is_draft = false
    const responseData = await TrainingRequestRepository.create({
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
 * GET /api/training-request/:id
 * Get Training Request by ID
 */
const getTrainingRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await TrainingRequestRepository.getById(id);

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
 * GET /api/training-request/new
 * Get new form structure (empty form for training request)
 */
const getTrainingRequestNew = async (req, res) => {
  try {
    const emptyForm = await TrainingRequestRepository.getNewForm();

    return res.status(200).send({
      message: "Successfully fetched new form structure.",
      data: emptyForm
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * PUT /api/training-request/:id
 * Update Training Request
 */
const updateTrainingRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Update request
    const responseData = await TrainingRequestRepository.update(req.body, id);

    return res.status(200).send({
      message: "Successfully updated item.",
      data: responseData
    });
  } catch (error) {
    if (error.message === 'Training request not found') {
      return res.status(404).send({
        message: "Cannot find item"
      });
    }
    return res.status(500).send({ message: error.message });
  }
};

/**
 * GET /api/training-request?branch_site=...&status=...
 * Get list of Training Requests
 */
const getTrainingRequestList = async (req, res) => {
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
    const result = await TrainingRequestRepository.getList(filters);

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
 * POST /api/training-request/draft
 * Save Training Request as Draft
 */
const saveTrainingRequestDraft = async (req, res) => {
  try {
    const responseData = await TrainingRequestRepository.saveDraft(req.body);

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
 * GET /api/training-request/draft
 * Get Training Request Draft (latest draft by user)
 */
const getTrainingRequestDraft = async (req, res) => {
  try {
    const { request_by } = req.query;

    if (!request_by) {
      return res.status(400).send({
        message: "request_by parameter is required"
      });
    }

    const draft = await TrainingRequestRepository.getDraft(request_by);

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
  postTrainingRequest,
  getTrainingRequest,
  getTrainingRequestNew,
  updateTrainingRequest,
  getTrainingRequestList,
  saveTrainingRequestDraft,
  getTrainingRequestDraft
};
