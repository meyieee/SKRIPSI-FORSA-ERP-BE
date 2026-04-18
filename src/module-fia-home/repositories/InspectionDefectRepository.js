/**
 * Inspection Defect Repository
 * Handle inspection defect requests
 */

const BaseRepository = require('./FIAOnlineReqBaseRepository');
const { formatLocalDate } = require('./DateOnlyHelper');
const {
  transformInspectionDefectToBackend,
  transformInspectionDefectToFrontend
} = require('./FIAOnlineReqTransformers');

const REQUEST_TYPE = 'inspection-defect';

/**
 * Transform frontend data to backend format
 * @param {object} frontendData - Data dari frontend
 * @returns {object} Data dalam format backend
 */
function transformToBackend(frontendData) {
  return transformInspectionDefectToBackend({
    ...frontendData,
    request_type: REQUEST_TYPE
  });
}

/**
 * Transform backend data to frontend format
 * @param {object} backendData - Data dari database
 * @returns {Promise<object>} Data dalam format frontend
 */
async function transformToFrontend(backendData) {
  if (!backendData) return null;
  
  // Transform main record
  const frontendData = transformInspectionDefectToFrontend(backendData);
  
  frontendData.defectDetails = [];
  
  return frontendData;
}

/**
 * Generate reference request number untuk inspection defect request
 * @returns {Promise<string>} Generated ref_request_no
 */
async function generateRefRequestNo() {
  return BaseRepository.generateRefRequestNo(REQUEST_TYPE);
}

/**
 * Get Inspection Defect Request by ID
 * @param {number|string} id - Request ID
 * @returns {Promise<object|null>} Request data dalam format frontend atau null
 */
async function getById(id) {
  const result = await BaseRepository.getById(id);
  if (!result) return null;
  
  // Validate it's an inspection defect request
  if (result.request_type !== REQUEST_TYPE) {
    return null;
  }
  
  return transformToFrontend(result);
}

/**
 * Get Inspection Defect Request by ref_request_no
 * @param {string} refRequestNo - Reference request number
 * @returns {Promise<object|null>} Request data dalam format frontend atau null
 */
async function getByRefNo(refRequestNo) {
  const result = await BaseRepository.getByRefNo(refRequestNo);
  if (!result) return null;
  
  // Validate it's an inspection defect request
  if (result.request_type !== REQUEST_TYPE) {
    return null;
  }
  
  return transformToFrontend(result);
}

/**
 * Create new Inspection Defect Request
 * @param {object} frontendData - Request data dalam format frontend
 * @returns {Promise<object>} Created request data dalam format frontend
 */
async function create(frontendData) {
  // Transform main record to backend format
  const backendData = transformToBackend(frontendData);
  
  // Create main record in database
  await BaseRepository.create(backendData);
  
  const created = await BaseRepository.getByRefNo(backendData.ref_request_no);
  
  return transformToFrontend(created);
}

/**
 * Update Inspection Defect Request
 * @param {object} frontendData - Request data dalam format frontend
 * @param {number|string} id - Request ID
 * @returns {Promise<object>} Updated request data dalam format frontend
 */
async function update(frontendData, id) {
  // Check if record exists and is inspection defect request
  const existing = await BaseRepository.getById(id);
  if (!existing || existing.request_type !== REQUEST_TYPE) {
    throw new Error('Inspection defect request not found');
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
  
  const updated = await BaseRepository.getById(id);
  
  // Transform to frontend format
  return transformToFrontend(updated);
}

/**
 * Get list of Inspection Defect Requests
 * @param {object} filters - Filter options
 * @returns {Promise<object>} List of requests and pagination info
 */
async function getList(filters = {}) {
  const result = await BaseRepository.getList({
    ...filters,
    request_type: REQUEST_TYPE
  });
  
  // Transform each item to frontend format
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
      requestId: nextRequestId,
      requestType: REQUEST_TYPE,
      refRequestNo: refRequestNo,
    },
    requestInfo: {
      requestDate: formatLocalDate(new Date()),
      requestBy: '',
      requestFor: '',
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
      location: ''
    },
    inspectionDetailInfo: {
      assetNo: '',
      assetDescription: '', // Will be fetched from asset API
      assetType: '',
      assetModel: '',
      location: '',
      inspectionSummary: '',
      notesComments: '',
      additionalNotes: ''
    },
    defectDetails: [],
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
  getNewForm,
  
  // Constants
  REQUEST_TYPE
};

