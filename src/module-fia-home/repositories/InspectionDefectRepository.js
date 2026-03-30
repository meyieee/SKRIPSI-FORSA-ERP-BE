/**
 * Inspection Defect Repository
 * Handle inspection defect requests dengan defect details di tabel terpisah
 */

const BaseRepository = require('./FIAOnlineReqBaseRepository');
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
 * Transform backend data to frontend format (include defect details)
 * @param {object} backendData - Data dari database
 * @returns {Promise<object>} Data dalam format frontend dengan defect details
 */
async function transformToFrontend(backendData) {
  if (!backendData) return null;
  
  // Transform main record
  const frontendData = transformInspectionDefectToFrontend(backendData);
  
  // Load defect details from separate table
  const InspectionDefectModel = require('../models/adm_fia_online_req_inspect');
  const defectDetails = await InspectionDefectModel.findAll({
    where: { ref_request_no: backendData.ref_request_no },
    order: [['id', 'ASC']],
    raw: true
  });
  
  // Transform defect details to frontend format
  frontendData.defectDetails = defectDetails.map((defect, index) => ({
    id: defect.id.toString(),
    no: index + 1,
    defectDescription: defect.defect_description || '',
    condition: defect.condition_status || 'Good',
    category: defect.category || 'Mechanical',
    recommendedAction: defect.recommended_action || '',
    assignedTo: defect.assigned_to || '',
    dueDate: defect.due_date ? defect.due_date.toISOString().slice(0, 10) : '',
    actionTaken: defect.action_taken || 'None',
    result: defect.result || 'Pass',
    status: defect.status || 'Open'
  }));
  
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
  
  // Get ref_request_no
  const refRequestNo = backendData.ref_request_no;
  
  // Create defect details records
  if (frontendData.defectDetails && frontendData.defectDetails.length > 0) {
    const InspectionDefectModel = require('../models/adm_fia_online_req_inspect');
    
    for (const defect of frontendData.defectDetails) {
      await InspectionDefectModel.create({
        ref_request_no: refRequestNo,
        defect_description: defect.defectDescription || '',
        condition_status: defect.condition || '',
        category: defect.category || '',
        recommended_action: defect.recommendedAction || '',
        assigned_to: defect.assignedTo || '',
        due_date: defect.dueDate || null,
        action_taken: defect.actionTaken || '',
        result: defect.result || '',
        status: defect.status || ''
      });
    }
  }
  
  // Retrieve created record with defect details
  const created = await BaseRepository.getByRefNo(refRequestNo);
  
  // Transform to frontend format (include defect details)
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
  
  // Update defect details
  const refRequestNo = existing.ref_request_no;
  const InspectionDefectModel = require('../models/adm_fia_online_req_inspect');
  
  // Delete all existing defect details
  await InspectionDefectModel.destroy({
    where: { ref_request_no: refRequestNo }
  });
  
  // Create new defect details
  if (frontendData.defectDetails && frontendData.defectDetails.length > 0) {
    for (const defect of frontendData.defectDetails) {
      await InspectionDefectModel.create({
        ref_request_no: refRequestNo,
        defect_description: defect.defectDescription || '',
        condition_status: defect.condition || '',
        category: defect.category || '',
        recommended_action: defect.recommendedAction || '',
        assigned_to: defect.assignedTo || '',
        due_date: defect.dueDate || null,
        action_taken: defect.actionTaken || '',
        result: defect.result || '',
        status: defect.status || ''
      });
    }
  }
  
  // Retrieve updated record with defect details
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
  
  // Transform each item to frontend format (include defect details)
  const transformedData = await Promise.all(
    result.data.map(item => transformToFrontend(item))
  );
  
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
 * Save Inspection Defect Request as Draft
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
  
  const InspectionDefectModel = require('../models/adm_fia_online_req_inspect');
  
  if (existing) {
    // Update existing draft
    await BaseRepository.update(backendData, existing.id);
    
    // Update defect details
    await InspectionDefectModel.destroy({
      where: { ref_request_no: refRequestNo }
    });
    
    if (frontendData.defectDetails && frontendData.defectDetails.length > 0) {
      for (const defect of frontendData.defectDetails) {
        await InspectionDefectModel.create({
          ref_request_no: refRequestNo,
          defect_description: defect.defectDescription || '',
          condition_status: defect.condition || '',
          category: defect.category || '',
          recommended_action: defect.recommendedAction || '',
          assigned_to: defect.assignedTo || '',
          due_date: defect.dueDate || null,
          action_taken: defect.actionTaken || '',
          result: defect.result || '',
          status: defect.status || ''
        });
      }
    }
    
    const updated = await BaseRepository.getById(existing.id);
    return transformToFrontend(updated);
  } else {
    // Create new draft
    await BaseRepository.create(backendData);
    
    // Create defect details
    if (frontendData.defectDetails && frontendData.defectDetails.length > 0) {
      for (const defect of frontendData.defectDetails) {
        await InspectionDefectModel.create({
          ref_request_no: refRequestNo,
          defect_description: defect.defectDescription || '',
          condition_status: defect.condition || '',
          category: defect.category || '',
          recommended_action: defect.recommendedAction || '',
          assigned_to: defect.assignedTo || '',
          due_date: defect.dueDate || null,
          action_taken: defect.actionTaken || '',
          result: defect.result || '',
          status: defect.status || ''
        });
      }
    }
    
    const created = await BaseRepository.getByRefNo(refRequestNo);
    return transformToFrontend(created);
  }
}

/**
 * Get Inspection Defect Request Draft
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
    defectDetails: [
      {
        id: Date.now().toString(),
        no: 1,
        defectDescription: '',
        condition: 'Good',
        category: 'Mechanical',
        recommendedAction: '',
        assignedTo: '',
        dueDate: '',
        actionTaken: 'None',
        result: 'Pass',
        status: 'Open'
      }
    ],
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

