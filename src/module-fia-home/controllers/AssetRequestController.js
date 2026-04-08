/**
 * Asset Request Controller
 * Menggunakan AssetRequestRepository untuk semua operations
 */

const AssetRequestRepository = require('../repositories/AssetRequestRepository');
const BaseRepository = require('../repositories/FIAOnlineReqBaseRepository');

/**
 * POST /api/asset-request
 * Create new Asset Request (Submit Final)
 */
const postAssetRequest = async (req, res) => {
  try {
    // Generate ref_request_no
    const refRequestNo = await AssetRequestRepository.generateRefRequestNo();

    // Check if ref_request_no already exists
    const existing = await AssetRequestRepository.getByRefNo(refRequestNo);
    if (existing) {
      return res.status(409).send({
        message: "Ref request number already exists"
      });
    }

    // Create request dengan is_draft = false
    const responseData = await AssetRequestRepository.create({
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
 * GET /api/asset-request/:id
 * Get Asset Request by ID
 */
const getAssetRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await AssetRequestRepository.getById(id);

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
 * GET /api/asset-request/new
 * Get new form structure (empty form for asset request)
 */
const getAssetRequestNew = async (req, res) => {
  try {
    const emptyForm = await AssetRequestRepository.getNewForm();

    return res.status(200).send({
      message: "Successfully fetched new form structure.",
      data: emptyForm
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * PUT /api/asset-request/:id
 * Update Asset Request
 */
const updateAssetRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Update request
    const responseData = await AssetRequestRepository.update(req.body, id);

    return res.status(200).send({
      message: "Successfully updated item.",
      data: responseData
    });
  } catch (error) {
    if (error.message === 'Asset request not found') {
      return res.status(404).send({
        message: "Cannot find item"
      });
    }
    return res.status(500).send({ message: error.message });
  }
};

/**
 * GET /api/asset-request?branch_site=...&status=...
 * Get list of Asset Requests
 */
const getAssetRequestList = async (req, res) => {
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
    const result = await AssetRequestRepository.getList(filters);

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
 * PUT /api/asset-request/:id/status
 * Update workorder status for Asset Request
 */
const updateAssetRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { workorder_status } = req.body;

    if (!workorder_status) {
      return res.status(400).send({
        message: "workorder_status is required"
      });
    }

    // Check if record exists and is asset request
    const existing = await AssetRequestRepository.getById(id);
    if (!existing) {
      return res.status(404).send({
        message: "Cannot find item"
      });
    }

    // Update status using base repository
    await BaseRepository.updateStatus(id, workorder_status);

    // Get updated data
    const updated = await AssetRequestRepository.getById(id);

    return res.status(200).send({
      message: "Successfully updated status.",
      data: updated
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

module.exports = {
  postAssetRequest,
  getAssetRequest,
  getAssetRequestNew,
  updateAssetRequest,
  getAssetRequestList,
  updateAssetRequestStatus
};





