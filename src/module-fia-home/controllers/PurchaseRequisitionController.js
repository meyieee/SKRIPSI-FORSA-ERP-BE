/**
 * Purchase Requisition Controller
 * Menggunakan PurchaseRequisitionRepository untuk semua operations
 */

const PurchaseRequisitionRepository = require('../repositories/PurchaseRequisitionRepository');
const BaseRepository = require('../repositories/FIAOnlineReqBaseRepository');

/**
 * POST /api/purchase-requisition
 * Create new Purchase Requisition (Submit Final)
 */
const postPurchaseRequisition = async (req, res) => {
  try {
    // Generate ref_request_no
    const refRequestNo = await PurchaseRequisitionRepository.generateRefRequestNo();

    // Check if ref_request_no already exists
    const existing = await PurchaseRequisitionRepository.getByRefNo(refRequestNo);
    if (existing) {
      return res.status(409).send({
        message: "Ref request number already exists"
      });
    }

    // Create request dengan is_draft = false
    const responseData = await PurchaseRequisitionRepository.create({
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
 * GET /api/purchase-requisition/:id
 * Get Purchase Requisition by ID
 */
const getPurchaseRequisition = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await PurchaseRequisitionRepository.getById(id);

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
 * GET /api/purchase-requisition/new
 * Get new form structure (empty form for purchase requisition)
 */
const getPurchaseRequisitionNew = async (req, res) => {
  try {
    const emptyForm = await PurchaseRequisitionRepository.getNewForm();

    return res.status(200).send({
      message: "Successfully fetched new form structure.",
      data: emptyForm
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * PUT /api/purchase-requisition/:id
 * Update Purchase Requisition
 */
const updatePurchaseRequisition = async (req, res) => {
  try {
    const { id } = req.params;

    // Update request
    const responseData = await PurchaseRequisitionRepository.update(req.body, id);

    return res.status(200).send({
      message: "Successfully updated item.",
      data: responseData
    });
  } catch (error) {
    if (error.message === 'Purchase requisition not found') {
      return res.status(404).send({
        message: "Cannot find item"
      });
    }
    return res.status(500).send({ message: error.message });
  }
};

/**
 * GET /api/purchase-requisition?branch_site=...&status=...
 * Get list of Purchase Requisitions
 */
const getPurchaseRequisitionList = async (req, res) => {
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
    const result = await PurchaseRequisitionRepository.getList(filters);

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
 * POST /api/purchase-requisition/draft
 * Save Purchase Requisition as Draft
 */
const savePurchaseRequisitionDraft = async (req, res) => {
  try {
    const responseData = await PurchaseRequisitionRepository.saveDraft(req.body);

    return res.status(200).send({
      message: "Successfully saved draft.",
      data: responseData
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * GET /api/purchase-requisition/draft?request_by=...
 * Get Purchase Requisition Draft by user
 */
const getPurchaseRequisitionDraft = async (req, res) => {
  try {
    const { request_by } = req.query;

    if (!request_by) {
      return res.status(400).send({
        message: "request_by parameter is required"
      });
    }

    const draft = await PurchaseRequisitionRepository.getDraft(request_by);

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
 * PUT /api/purchase-requisition/:id/status
 * Update workorder status for Purchase Requisition
 */
const updatePurchaseRequisitionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { workorder_status } = req.body;

    if (!workorder_status) {
      return res.status(400).send({
        message: "workorder_status is required"
      });
    }

    // Check if record exists and is purchase requisition
    const existing = await PurchaseRequisitionRepository.getById(id);
    if (!existing) {
      return res.status(404).send({
        message: "Cannot find item"
      });
    }

    // Update status using base repository
    await BaseRepository.updateStatus(id, workorder_status);

    // Get updated data
    const updated = await PurchaseRequisitionRepository.getById(id);

    return res.status(200).send({
      message: "Successfully updated status.",
      data: updated
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

module.exports = {
  postPurchaseRequisition,
  getPurchaseRequisition,
  getPurchaseRequisitionNew,
  updatePurchaseRequisition,
  getPurchaseRequisitionList,
  savePurchaseRequisitionDraft,
  getPurchaseRequisitionDraft,
  updatePurchaseRequisitionStatus
};



















