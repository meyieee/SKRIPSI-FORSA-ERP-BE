/**
 * Job Request Controller
 * Menggunakan JobRequestRepository untuk semua operations
 */

const JobRequestRepository = require('../repositories/JobRequestRepository');
const BaseRepository = require('../repositories/FIAOnlineReqBaseRepository');

/**
 * POST /api/job-request
 * Create new Job Request
 */
const postJobRequest = async (req, res) => {
  try {
    // Generate ref_request_no
    const refRequestNo = await JobRequestRepository.generateRefRequestNo();

    // Check if ref_request_no already exists
    const existing = await JobRequestRepository.getByRefNo(refRequestNo);
    if (existing) {
      return res.status(409).send({
        message: "Ref request number already exists"
      });
    }

    // Create request
    const responseData = await JobRequestRepository.create({
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
 * GET /api/job-request/:id
 * Get Job Request by ID
 */
const getJobRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await JobRequestRepository.getById(id);

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
 * GET /api/job-request/new
 * Get new form structure (empty form for job request)
 */
const getJobRequestNew = async (req, res) => {
  try {
    const emptyForm = await JobRequestRepository.getNewForm();

    return res.status(200).send({
      message: "Successfully fetched new form structure.",
      data: emptyForm
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * PUT /api/job-request/:id
 * Update Job Request
 */
const updateJobRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Update request
    const responseData = await JobRequestRepository.update(req.body, id);

    return res.status(200).send({
      message: "Successfully updated item.",
      data: responseData
    });
  } catch (error) {
    if (error.message === 'Job request not found') {
      return res.status(404).send({
        message: "Cannot find item"
      });
    }
    return res.status(500).send({ message: error.message });
  }
};

/**
 * GET /api/job-request?branch_site=...&workorder_status=...
 * Get list of Job Requests
 */
const getJobRequestList = async (req, res) => {
  try {
    const { branch_site, workorder_status, limit, offset } = req.query;

    // Build filters
    const filters = {
      branch_site: branch_site || null,
      workorder_status: workorder_status || null,
      limit: limit || 50,
      offset: offset || 0
    };

    // Get list
    const result = await JobRequestRepository.getList(filters);

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
 * PUT /api/job-request/:id/status
 * Update workorder status for Job Request
 */
const updateJobRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { workorder_status } = req.body;

    if (!workorder_status) {
      return res.status(400).send({
        message: "workorder_status is required"
      });
    }

    // Check if record exists and is job request
    const existing = await JobRequestRepository.getById(id);
    if (!existing) {
      return res.status(404).send({
        message: "Cannot find item"
      });
    }

    // Update status using base repository
    await BaseRepository.updateStatus(id, workorder_status);

    // Get updated data
    const updated = await JobRequestRepository.getById(id);

    return res.status(200).send({
      message: "Successfully updated status.",
      data: updated
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

module.exports = {
  postJobRequest,
  getJobRequest,
  getJobRequestNew,
  updateJobRequest,
  getJobRequestList,
  updateJobRequestStatus
};
