/**
 * Inspection Defect Controller
 * Menggunakan InspectionDefectRepository untuk semua operations
 */

const InspectionDefectRepository = require('../repositories/InspectionDefectRepository');
const BaseRepository = require('../repositories/FIAOnlineReqBaseRepository');

/**
 * POST /api/inspection-defect
 * Create new Inspection Defect Request (Submit Final)
 */
const postInspectionDefect = async (req, res) => {
  try {
    // Generate ref_request_no
    const refRequestNo = await InspectionDefectRepository.generateRefRequestNo();

    // Check if ref_request_no already exists
    const existing = await InspectionDefectRepository.getByRefNo(refRequestNo);
    if (existing) {
      return res.status(409).send({
        message: "Ref request number already exists"
      });
    }

    // Create request dengan is_draft = false
    const responseData = await InspectionDefectRepository.create({
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
 * GET /api/inspection-defect/:id
 * Get Inspection Defect Request by ID
 */
const getInspectionDefect = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await InspectionDefectRepository.getById(id);

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
 * GET /api/inspection-defect/new
 * Get new form structure (empty form for inspection defect request)
 */
const getInspectionDefectNew = async (req, res) => {
  try {
    const emptyForm = await InspectionDefectRepository.getNewForm();

    return res.status(200).send({
      message: "Successfully fetched new form structure.",
      data: emptyForm
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * PUT /api/inspection-defect/:id
 * Update Inspection Defect Request
 */
const updateInspectionDefect = async (req, res) => {
  try {
    const { id } = req.params;

    // Update request
    const responseData = await InspectionDefectRepository.update(req.body, id);

    return res.status(200).send({
      message: "Successfully updated item.",
      data: responseData
    });
  } catch (error) {
    if (error.message === 'Inspection defect request not found') {
      return res.status(404).send({
        message: "Cannot find item"
      });
    }
    return res.status(500).send({ message: error.message });
  }
};

/**
 * GET /api/inspection-defect?branch_site=...&status=...
 * Get list of Inspection Defect Requests
 */
const getInspectionDefectList = async (req, res) => {
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
    const result = await InspectionDefectRepository.getList(filters);

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
 * PUT /api/inspection-defect/:id/status
 * Update workorder status for Inspection Defect Request
 */
const updateInspectionDefectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { workorder_status } = req.body;

    if (!workorder_status) {
      return res.status(400).send({
        message: "workorder_status is required"
      });
    }

    // Check if record exists and is inspection defect request
    const existing = await InspectionDefectRepository.getById(id);
    if (!existing) {
      return res.status(404).send({
        message: "Cannot find item"
      });
    }

    // Update status using base repository
    await BaseRepository.updateStatus(id, workorder_status);

    // Get updated data
    const updated = await InspectionDefectRepository.getById(id);

    return res.status(200).send({
      message: "Successfully updated status.",
      data: updated
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

module.exports = {
  postInspectionDefect,
  getInspectionDefect,
  getInspectionDefectNew,
  updateInspectionDefect,
  getInspectionDefectList,
  updateInspectionDefectStatus
};

