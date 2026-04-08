/**
 * Purchase Requisition Repository
 */

const BaseRepository = require('./FIAOnlineReqBaseRepository');
const {
  transformPurchaseRequisitionToBackend,
  transformPurchaseRequisitionToFrontend
} = require('./FIAOnlineReqTransformers');

const REQUEST_TYPE = 'purchase-requisition';

/**
 * Transform frontend data to backend format
 * @param {object} frontendData - Data dari frontend
 * @returns {object} Data dalam format backend
 */
function transformToBackend(frontendData) {
  return transformPurchaseRequisitionToBackend({
    ...frontendData,
    request_type: REQUEST_TYPE
  });
}

/**
 * Transform backend data to frontend format (async untuk load item details)
 * @param {object} backendData - Data dari database
 * @returns {Promise<object>} Data dalam format frontend
 */
async function transformToFrontend(backendData) {
  if (!backendData) return null;

  const baseTransformed = transformPurchaseRequisitionToFrontend(backendData);

  // Load item details dari tabel adm_fia_online_req_itempurchasereq
  const ItemPurchaseReqModel = require('../models/adm_fia_online_req_itempurchasereq');
  const itemDetails = await ItemPurchaseReqModel.findAll({
    where: {
      ref_request_no: backendData.ref_request_no
    },
    order: [['id', 'ASC']],
    raw: true
  });

  // Transform item details ke format frontend
  const transformedItems = itemDetails.map((item, index) => ({
    id: item.id.toString(),
    no: index + 1,
    ref_request_no: item.ref_request_no || '',
    stockcode: item.stockcode || '',
    stock_description: item.stock_description || '',
    item_type: item.item_type || '',
    quantity: item.quantity ? item.quantity.toString() : '',
    unit_price: item.unit_price ? item.unit_price.toString() : '',
    totalPrice: item.quantity && item.unit_price 
      ? (parseFloat(item.quantity) * parseFloat(item.unit_price)).toFixed(2)
      : '0.00'
  }));

  // Calculate estimated total cost
  const estimatedTotalCost = transformedItems.reduce((sum, item) => {
    return sum + parseFloat(item.totalPrice || '0');
  }, 0).toFixed(2);

  return {
    ...baseTransformed,
    itemDetails: transformedItems,
    estimatedTotalCost: estimatedTotalCost
  };
}

/**
 * Generate reference request number untuk purchase requisition
 * @returns {Promise<string>} Generated ref_request_no
 */
async function generateRefRequestNo() {
  return BaseRepository.generateRefRequestNo(REQUEST_TYPE);
}

/**
 * Get Purchase Requisition by ID
 * @param {number|string} id - Request ID
 * @returns {Promise<object|null>} Request data dalam format frontend atau null
 */
async function getById(id) {
  const result = await BaseRepository.getById(id);
  if (!result) return null;
  
  // Validate it's a purchase requisition
  if (result.request_type !== REQUEST_TYPE) {
    return null;
  }
  
  return await transformToFrontend(result);
}

/**
 * Get Purchase Requisition by ref_request_no
 * @param {string} refRequestNo - Reference request number
 * @returns {Promise<object|null>} Request data dalam format frontend atau null
 */
async function getByRefNo(refRequestNo) {
  const result = await BaseRepository.getByRefNo(refRequestNo);
  if (!result) return null;
  
  // Validate it's a purchase requisition
  if (result.request_type !== REQUEST_TYPE) {
    return null;
  }
  
  return await transformToFrontend(result);
}

/**
 * Create new Purchase Requisition
 * @param {object} frontendData - Request data dalam format frontend
 * @returns {Promise<object>} Created request data dalam format frontend
 */
async function create(frontendData) {
  // Transform to backend format
  const backendData = transformToBackend(frontendData);
  
  // Create main record in database
  await BaseRepository.create(backendData);
  
  // Create item details
  if (frontendData.itemDetails && frontendData.itemDetails.length > 0) {
    const ItemPurchaseReqModel = require('../models/adm_fia_online_req_itempurchasereq');
    const itemDetailsToCreate = frontendData.itemDetails
      .filter(item => item.stock_description && item.stock_description.trim() !== '')
      .map(item => ({
        ref_request_no: backendData.ref_request_no,
        stockcode: item.stockcode || '',
        stock_description: item.stock_description || '',
        item_type: item.item_type || '',
        quantity: parseInt(item.quantity) || 0,
        unit_price: parseFloat(item.unit_price) || 0
      }));

    if (itemDetailsToCreate.length > 0) {
      await ItemPurchaseReqModel.bulkCreate(itemDetailsToCreate);
    }
  }
  
  // Retrieve created record dengan item details
  const created = await BaseRepository.getByRefNo(backendData.ref_request_no);
  
  // Transform to frontend format
  return await transformToFrontend(created);
}

/**
 * Update Purchase Requisition
 * @param {object} frontendData - Request data dalam format frontend
 * @param {number|string} id - Request ID
 * @returns {Promise<object>} Updated request data dalam format frontend
 */
async function update(frontendData, id) {
  // Check if record exists and is purchase requisition
  const existing = await BaseRepository.getById(id);
  if (!existing || existing.request_type !== REQUEST_TYPE) {
    throw new Error('Purchase requisition not found');
  }
  
  // Transform to backend format
  const backendData = transformToBackend(frontendData);
  
  // Don't allow changing ref_request_no
  delete backendData.ref_request_no;
  
  // Preserve is_draft status unless explicitly changed
  if (frontendData.is_draft === undefined) {
    delete backendData.is_draft;
  }
  
  // Update main record in database
  await BaseRepository.update(backendData, id);
  
  // Update item details: delete all existing, then insert new ones
  const ItemPurchaseReqModel = require('../models/adm_fia_online_req_itempurchasereq');
  await ItemPurchaseReqModel.destroy({
    where: {
      ref_request_no: existing.ref_request_no
    }
  });

  if (frontendData.itemDetails && frontendData.itemDetails.length > 0) {
    const itemDetailsToCreate = frontendData.itemDetails
      .filter(item => item.stock_description && item.stock_description.trim() !== '')
      .map(item => ({
        ref_request_no: existing.ref_request_no,
        stockcode: item.stockcode || '',
        stock_description: item.stock_description || '',
        item_type: item.item_type || '',
        quantity: parseInt(item.quantity) || 0,
        unit_price: parseFloat(item.unit_price) || 0
      }));

    if (itemDetailsToCreate.length > 0) {
      await ItemPurchaseReqModel.bulkCreate(itemDetailsToCreate);
    }
  }
  
  // Retrieve updated record
  const updated = await BaseRepository.getById(id);
  
  // Transform to frontend format
  return await transformToFrontend(updated);
}

/**
 * Get list of Purchase Requisitions
 * @param {object} filters - Filter options
 * @returns {Promise<object>} List of requests and pagination info
 */
async function getList(filters = {}) {
  const result = await BaseRepository.getList({
    ...filters,
    request_type: REQUEST_TYPE
  });
  
  // Transform each item to frontend format (with item details)
  const transformedData = await Promise.all(
    result.data.map(item => transformToFrontend(item))
  );
  
  // Exclude draft rows from list
  const filteredData = transformedData.filter(item => !item.is_draft || item.is_draft === 0);
  const total = filteredData.length;
  
  return {
    data: filteredData,
    total,
    limit: result.limit,
    offset: result.offset
  };
}

/**
 * Get new form structure (empty form dengan generated IDs)
 * @returns {Promise<object>} Empty form structure dalam format frontend
 */
async function getNewForm() {
  // Generate refRequestNo
  const refRequestNo = await generateRefRequestNo();
  
  // Generate next requestId menggunakan helper dari BaseRepository
  const nextRequestId = await BaseRepository.generateNextRequestId(REQUEST_TYPE);
  
  // Return empty form structure
  return {
    header: {
      requisitionId: nextRequestId,
      requestType: REQUEST_TYPE,
      refRequestNo: refRequestNo,
      fullPaymentMethod: ''
    },
    requestInfo: {
      requisitionDate: new Date().toISOString().slice(0, 10),
      requestBy: '',
      requestByJobTitle: '',
      requestFor: '',
      requestForJobTitle: '',
      requestPurpose: '',
      priority: '3',
      branchSite: '',
      department: '',
      costCenter: '',
      requestDescription: '',
      justification: '',
      commentRemarkNote: '',
      additionalComments: '',
      relevantDocs: '',
      relevantDocsSecond: '',
      location: '',
      amount: '',
      estimatedTime: '',
      firstService: ''
    },
    requisitionInfo: {
      supplier: '',
      supplierAddress: '',
      supplierContact: '',
      comments: ''
    },
    itemDetails: [
      {
        id: '1',
        no: 1,
        stockcode: '',
        stock_description: '',
        item_type: '',
        quantity: '',
        unit_price: '',
        totalPrice: ''
      }
    ],
    estimatedTotalCost: '0.00',
    remark: '',
    internalNote: '',
    attachment: '',
    status: 'Pending',
    createdBy: '',
    createdDate: '',
    lastModifiedBy: '',
    lastModifiedDate: '',
    approvedBy: '',
    approvedDate: '',
    rejectedBy: '',
    rejectedDate: '',
    reasonForRejection: '',
    workflowTracking: {
      checkBy: '',
      checkDate: '',
      checkComments: '',
      reviewBy: '',
      reviewDate: '',
      reviewComments: '',
      approveOneBy: '',
      approveOneDate: '',
      approveOneComments: '',
      approveSecondBy: '',
      approveSecondDate: '',
      approveSecondComments: '',
      approveThirdBy: '',
      approveThirdDate: '',
      approveThirdComments: '',
      createdAt: '',
      updatedAt: ''
    }
  };
}

module.exports = {
  // Transform functions
  transformToBackend,
  transformToFrontend,
  
  // CRUD operations
  generateRefRequestNo,
  getById,
  getByRefNo,
  create,
  update,
  getList,
  getNewForm,
  
  // Constants
  REQUEST_TYPE
};

