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
    const { branch_site, status, limit, offset } = req.query;

    // Build filters
    const filters = {
      branch_site: branch_site || null,
      workorder_status: status || null,
      limit: limit || 50,
      offset: offset || 0
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

module.exports = {
  postTrainingRequest,
  getTrainingRequest,
  getTrainingRequestNew,
  updateTrainingRequest,
  getTrainingRequestList
};
