/**
 * Travel Request Repository
 * Handle travel requests dengan travelers di tabel terpisah
 */

const BaseRepository = require('./FIAOnlineReqBaseRepository');
const {
  transformTravelRequestToBackend,
  transformTravelRequestToFrontend
} = require('./FIAOnlineReqTransformers');

const REQUEST_TYPE = 'travel-request';

/**
 * Transform frontend data to backend format
 * @param {object} frontendData - Data dari frontend
 * @returns {object} Data dalam format backend
 */
function transformToBackend(frontendData) {
  return transformTravelRequestToBackend({
    ...frontendData,
    request_type: REQUEST_TYPE
  });
}

/**
 * Transform backend data to frontend format (include travelers)
 * @param {object} backendData - Data dari database
 * @returns {Promise<object>} Data dalam format frontend dengan travelers
 */
async function transformToFrontend(backendData) {
  if (!backendData) return null;
  
  // Transform main record
  const frontendData = transformTravelRequestToFrontend(backendData);
  
  // Load travelers from separate table
  const TravelerModel = require('../models/adm_fia_online_req_traveller');
  const travelers = await TravelerModel.findAll({
    where: { ref_request_no: backendData.ref_request_no },
    order: [['id', 'ASC']],
    raw: true
  });
  
  // Transform travelers to frontend format
  frontendData.travelers = travelers.map((traveler, index) => ({
    no: index + 1,
    lastName: traveler.last_name || '',
    firstName: traveler.first_name || '',
    category: traveler.category || '',
    comments: traveler.comments || ''
  }));
  
  return frontendData;
}

/**
 * Generate reference request number untuk travel request
 * @returns {Promise<string>} Generated ref_request_no
 */
async function generateRefRequestNo() {
  return BaseRepository.generateRefRequestNo(REQUEST_TYPE);
}

/**
 * Get Travel Request by ID
 * @param {number|string} id - Request ID
 * @returns {Promise<object|null>} Request data dalam format frontend atau null
 */
async function getById(id) {
  const result = await BaseRepository.getById(id);
  if (!result) return null;
  
  // Validate it's a travel request
  if (result.request_type !== REQUEST_TYPE) {
    return null;
  }
  
  return transformToFrontend(result);
}

/**
 * Get Travel Request by ref_request_no
 * @param {string} refRequestNo - Reference request number
 * @returns {Promise<object|null>} Request data dalam format frontend atau null
 */
async function getByRefNo(refRequestNo) {
  const result = await BaseRepository.getByRefNo(refRequestNo);
  if (!result) return null;
  
  // Validate it's a travel request
  if (result.request_type !== REQUEST_TYPE) {
    return null;
  }
  
  return transformToFrontend(result);
}

/**
 * Create new Travel Request
 * @param {object} frontendData - Request data dalam format frontend
 * @returns {Promise<object>} Created request data dalam format frontend
 */
async function create(frontendData) {
  // Transform main record to backend format
  const backendData = transformToBackend(frontendData);
  
  // Create main record in database
  await BaseRepository.create(backendData);
  
  // Get ref_request_no
  const refRequestNo = backendData.ref_request_no;
  
  // Create traveler records
  if (frontendData.travelers && frontendData.travelers.length > 0) {
    const TravelerModel = require('../models/adm_fia_online_req_traveller');
    
    for (const traveler of frontendData.travelers) {
      await TravelerModel.create({
        ref_request_no: refRequestNo,
        last_name: traveler.lastName || '',
        first_name: traveler.firstName || '',
        category: traveler.category || '',
        comments: traveler.comments || ''
      });
    }
  }
  
  // Retrieve created record with travelers
  const created = await BaseRepository.getByRefNo(refRequestNo);
  
  // Transform to frontend format (include travelers)
  return transformToFrontend(created);
}

/**
 * Update Travel Request
 * @param {object} frontendData - Request data dalam format frontend
 * @param {number|string} id - Request ID
 * @returns {Promise<object>} Updated request data dalam format frontend
 */
async function update(frontendData, id) {
  // Check if record exists and is travel request
  const existing = await BaseRepository.getById(id);
  if (!existing || existing.request_type !== REQUEST_TYPE) {
    throw new Error('Travel request not found');
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
  
  // Update travelers
  const refRequestNo = existing.ref_request_no;
  const TravelerModel = require('../models/adm_fia_online_req_traveller');
  
  // Delete all existing travelers
  await TravelerModel.destroy({
    where: { ref_request_no: refRequestNo }
  });
  
  // Create new travelers
  if (frontendData.travelers && frontendData.travelers.length > 0) {
    for (const traveler of frontendData.travelers) {
      await TravelerModel.create({
        ref_request_no: refRequestNo,
        last_name: traveler.lastName || '',
        first_name: traveler.firstName || '',
        category: traveler.category || '',
        comments: traveler.comments || ''
      });
    }
  }
  
  // Retrieve updated record with travelers
  const updated = await BaseRepository.getById(id);
  
  // Transform to frontend format
  return transformToFrontend(updated);
}

/**
 * Get list of Travel Requests
 * @param {object} filters - Filter options
 * @returns {Promise<object>} List of requests and pagination info
 */
async function getList(filters = {}) {
  const result = await BaseRepository.getList({
    ...filters,
    request_type: REQUEST_TYPE
  });
  
  // Transform each item to frontend format (include travelers)
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
    travelDetails: {
      numberOfPerson: 1,
      noDaysAbsent: 0,
      departure: '',
      return: '',
      dateReturnToWork: '',
      contactDuringLeave: '',
      pointOfLeave: '',
      totalLeaveDaysRemaining: 0,
      totalDayTakenOnThisHoliday: 0,
      dayOffHoliday: 0,
      totalDaysTakenOnThisVacation: 0,
      lastBalanceEntitlement: 0,
      firstWorkDayAbsentFromWork: '',
      lastWorkDayAbsentFromWork: '',
      totalNumberOfDaysAbsent: 0,
      lessStatutoryPublicHolidaySundayIncluded: 0,
      netWorkingDaysLeaveRequested: 0
    },
    travelers: [
      {
        no: 1,
        lastName: '',
        firstName: '',
        category: '',
        comments: ''
      }
    ],
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

