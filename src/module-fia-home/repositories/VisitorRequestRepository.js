/**
 * Visitor Request Repository
 */

const BaseRepository = require('./FIAOnlineReqBaseRepository');
const {
  transformVisitorRequestToBackend,
  transformVisitorRequestToFrontend
} = require('./FIAOnlineReqTransformers');

const REQUEST_TYPE = 'visitor-request';

/**
 * Transform frontend data to backend format
 * @param {object} frontendData - Data dari frontend
 * @returns {object} Data dalam format backend
 */
function transformToBackend(frontendData) {
  return transformVisitorRequestToBackend({
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
  return transformVisitorRequestToFrontend(backendData);
}

/**
 * Generate reference request number untuk visitor request
 * @returns {Promise<string>} Generated ref_request_no
 */
async function generateRefRequestNo() {
  return BaseRepository.generateRefRequestNo(REQUEST_TYPE);
}

/**
 * Get Visitor Request by ID
 * @param {number|string} id - Request ID
 * @returns {Promise<object|null>} Request data dalam format frontend atau null
 */
async function getById(id) {
  const result = await BaseRepository.getById(id);
  if (!result) return null;
  
  // Validate it's a visitor request
  if (result.request_type !== REQUEST_TYPE) {
    return null;
  }
  
  return transformToFrontend(result);
}

/**
 * Get Visitor Request by ref_request_no
 * @param {string} refRequestNo - Reference request number
 * @returns {Promise<object|null>} Request data dalam format frontend atau null
 */
async function getByRefNo(refRequestNo) {
  const result = await BaseRepository.getByRefNo(refRequestNo);
  if (!result) return null;
  
  // Validate it's a visitor request
  if (result.request_type !== REQUEST_TYPE) {
    return null;
  }
  
  return transformToFrontend(result);
}

/**
 * Create new Visitor Request
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
 * Update Visitor Request
 * @param {object} frontendData - Request data dalam format frontend
 * @param {number|string} id - Request ID
 * @returns {Promise<object>} Updated request data dalam format frontend
 */
async function update(frontendData, id) {
  // Check if record exists and is visitor request
  const existing = await BaseRepository.getById(id);
  if (!existing || existing.request_type !== REQUEST_TYPE) {
    throw new Error('Visitor request not found');
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
 * Get list of Visitor Requests
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
    visitorDetails: {
      visitorName: '',
      companyOrg: '',
      contactNoEmail: ''
    },
    visitDetails: {
      dateOfVisit: '',
      timeOfVisit: '',
      expectedDuration: ''
    },
    hostDetails: {
      hostName: '',
      department: '',
      contactNumber: ''
    },
    securityClearance: {
      clearanceRequired: '',
      typeOfClearance: '',
      comments: ''
    },
    specialRequirements: {
      meetingRoom: '',
      equipmentRequirements: '',
      comments: ''
    },
    visitorRegistration: {
      visitorId: '',
      checkInTime: '',
      checkOutTime: ''
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
  getNewForm,
  
  // Constants
  REQUEST_TYPE
};







