/**
 * Asset Request Repository
 */

const BaseRepository = require('./FIAOnlineReqBaseRepository');
const {
  transformAssetRequestToBackend,
  transformAssetRequestToFrontend
} = require('./FIAOnlineReqTransformers');

const REQUEST_TYPE = 'asset-request';

/**
 * Transform frontend data to backend format
 * @param {object} frontendData - Data dari frontend
 * @returns {object} Data dalam format backend
 */
function transformToBackend(frontendData) {
  return transformAssetRequestToBackend({
    ...frontendData,
    request_type: REQUEST_TYPE
  });
}

/**
 * Transform backend data to frontend format
 * @param {object} backendData - Data dari database
 * @returns {object} Data dalam format frontend
 */
function transformToFrontend(backendData) {
  return transformAssetRequestToFrontend(backendData);
}

/**
 * Generate reference request number untuk asset request
 * @returns {Promise<string>} Generated ref_request_no
 */
async function generateRefRequestNo() {
  return BaseRepository.generateRefRequestNo(REQUEST_TYPE);
}

/**
 * Get Asset Request by ID
 * @param {number|string} id - Request ID
 * @returns {Promise<object|null>} Request data dalam format frontend atau null
 */
async function getById(id) {
  const result = await BaseRepository.getById(id);
  if (!result) return null;
  
  // Validate it's an asset request
  if (result.request_type !== REQUEST_TYPE) {
    return null;
  }
  
  return transformToFrontend(result);
}

/**
 * Get Asset Request by ref_request_no
 * @param {string} refRequestNo - Reference request number
 * @returns {Promise<object|null>} Request data dalam format frontend atau null
 */
async function getByRefNo(refRequestNo) {
  const result = await BaseRepository.getByRefNo(refRequestNo);
  if (!result) return null;
  
  // Validate it's an asset request
  if (result.request_type !== REQUEST_TYPE) {
    return null;
  }
  
  return transformToFrontend(result);
}

/**
 * Create new Asset Request
 * @param {object} frontendData - Request data dalam format frontend
 * @returns {Promise<object>} Created request data dalam format frontend
 */
async function create(frontendData) {
  // Transform to backend format
  const backendData = transformToBackend(frontendData);
  
  // Create in database
  await BaseRepository.create(backendData);
  
  // Retrieve created record
  const created = await BaseRepository.getByRefNo(backendData.ref_request_no);
  
  // Transform to frontend format
  return transformToFrontend(created);
}

/**
 * Update Asset Request
 * @param {object} frontendData - Request data dalam format frontend
 * @param {number|string} id - Request ID
 * @returns {Promise<object>} Updated request data dalam format frontend
 */
async function update(frontendData, id) {
  // Check if record exists and is asset request
  const existing = await BaseRepository.getById(id);
  if (!existing || existing.request_type !== REQUEST_TYPE) {
    throw new Error('Asset request not found');
  }
  
  // Transform to backend format
  const backendData = transformToBackend(frontendData);
  
  // Don't allow changing ref_request_no
  delete backendData.ref_request_no;
  
  // Preserve is_draft status unless explicitly changed
  if (frontendData.is_draft === undefined) {
    delete backendData.is_draft;
  }
  
  // Update in database
  await BaseRepository.update(backendData, id);
  
  // Retrieve updated record
  const updated = await BaseRepository.getById(id);
  
  // Transform to frontend format
  return transformToFrontend(updated);
}

/**
 * Get list of Asset Requests
 * @param {object} filters - Filter options
 * @returns {Promise<object>} List of requests and pagination info
 */
async function getList(filters = {}) {
  const result = await BaseRepository.getList({
    ...filters,
    request_type: REQUEST_TYPE
  });
  
  // Transform each item to frontend format
  const transformedData = result.data.map(item => transformToFrontend(item));
  
  // Filter out drafts unless include_draft=true
  let filteredData = transformedData;
  if (filters.include_draft !== 'true') {
    filteredData = transformedData.filter(item => !item.is_draft || item.is_draft === 0);
  }
  
  // Recalculate total if drafts were filtered
  const total = filters.include_draft === 'true' ? result.total : filteredData.length;
  
  return {
    data: filteredData,
    total,
    limit: result.limit,
    offset: result.offset
  };
}

/**
 * Save Asset Request as Draft
 * @param {object} frontendData - Request data dalam format frontend
 * @returns {Promise<object>} Saved draft data dalam format frontend
 */
async function saveDraft(frontendData) {
  // Generate refRequestNo jika belum ada
  let refRequestNo = frontendData.header?.refRequestNo;
  if (!refRequestNo) {
    refRequestNo = await generateRefRequestNo();
  }
  
  // Check if draft already exists
  const existing = await BaseRepository.getByRefNo(refRequestNo);
  
  // Transform to backend format
  const backendData = transformToBackend({
    ...frontendData,
    header: {
      ...frontendData.header,
      refRequestNo: refRequestNo
    },
    is_draft: true
  });
  
  // Ensure ref_request_no is set
  backendData.ref_request_no = refRequestNo;
  backendData.is_draft = true;
  
  if (existing) {
    // Update existing draft
    await BaseRepository.update(backendData, existing.id);
    const updated = await BaseRepository.getById(existing.id);
    return transformToFrontend(updated);
  } else {
    // Create new draft
    await BaseRepository.create(backendData);
    const created = await BaseRepository.getByRefNo(refRequestNo);
    return transformToFrontend(created);
  }
}

/**
 * Get Asset Request Draft
 * @param {string} requestBy - Request by user
 * @returns {Promise<object|null>} Draft data dalam format frontend atau null
 */
async function getDraft(requestBy) {
  const draft = await BaseRepository.getDraft(requestBy, REQUEST_TYPE);
  if (!draft) return null;
  
  return transformToFrontend(draft);
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
      requestId: nextRequestId,
      requestType: REQUEST_TYPE,
      refRequestNo: refRequestNo,
    },
    requestInfo: {
      requestDate: new Date().toISOString().slice(0, 10),
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
      justificationReason: '',
      justificationBenefit: '',
      commentRemarkNote: '',
      additionalComments: '',
      relevantDocs: '',
      relevantDocsSecond: '',
      location: ''
    },
    assetDetails: {
      assetType: '',
      assetModel: '',
      assetSpecification: '',
      quantity: 1,
      comments: ''
    },
    approvals: {
      immediateSupervisor: '',
      departmentHead: '',
      relatedManager: ''
    },
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
  saveDraft,
  getDraft,
  getNewForm,
  
  // Constants
  REQUEST_TYPE
};







