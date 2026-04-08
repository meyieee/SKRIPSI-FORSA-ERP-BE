/**
 * FIA Online Request Base Repository
 * Shared CRUD operations untuk semua request types
 */

const FIAOnlineReq = require('../models/adm_fia_online_req');
const { processDateFields, getRequestTypePrefix, formatRefRequestNo } = require('./FIAOnlineReqHelpers');
const { APPROVAL_STATUS } = require('./FIAOnlineReqConstants');

/**
 * Generate ref_request_no berdasarkan request_type
 * Format: JOB-001, JOB-002, dst.
 * @param {string} requestType - Request type (e.g., 'job-request')
 * @returns {Promise<string>} Generated ref_request_no
 */
async function generateRefRequestNo(requestType) {
  try {
    const prefix = getRequestTypePrefix(requestType);
    
    // Ambil record terakhir dengan request_type yang sama
    const lastRecord = await FIAOnlineReq.findOne({
      where: { request_type: requestType },
      order: [['id', 'DESC']],
      raw: true
    });

    let nextNumber = 1;
    
    if (lastRecord && lastRecord.ref_request_no) {
      // Extract number dari ref_request_no (format: JOB-001)
      const parts = lastRecord.ref_request_no.split('-');
      if (parts.length === 2) {
        const lastNumber = parseInt(parts[1], 10);
        if (!isNaN(lastNumber)) {
          nextNumber = lastNumber + 1;
        }
      }
    }

    // Format: JOB-001, JOB-002, dst.
    return formatRefRequestNo(prefix, nextNumber);
  } catch (error) {
    throw new Error(`Failed to generate ref_request_no: ${error.message}`);
  }
}

/**
 * Get FIA Online Request by ID
 * @param {number|string} id - Request ID
 * @returns {Promise<object|null>} Request data or null
 */
async function getById(id) {
  try {
    if (!id) {
      throw new Error('ID parameter is required');
    }
    
    const result = await FIAOnlineReq.findOne({
      where: { id: parseInt(id, 10) },
      raw: true
    });
    return result;
  } catch (error) {
    throw new Error(`Failed to get FIA Online Request by ID: ${error.message}`);
  }
}

/**
 * Get FIA Online Request by ref_request_no
 * @param {string} refRequestNo - Reference request number
 * @returns {Promise<object|null>} Request data or null
 */
async function getByRefNo(refRequestNo) {
  try {
    if (!refRequestNo) {
      throw new Error('refRequestNo parameter is required');
    }
    
    const result = await FIAOnlineReq.findOne({
      where: { ref_request_no: refRequestNo },
      raw: true
    });
    return result;
  } catch (error) {
    throw new Error(`Failed to get FIA Online Request by ref_request_no: ${error.message}`);
  }
}

/**
 * Create new FIA Online Request
 * @param {object} data - Request data (already transformed to backend format)
 * @returns {Promise<object>} Created request data
 */
async function create(data) {
  try {
    // Process date fields
    const processedData = processDateFields(data);
    
    // Set approval_status otomatis jika is_draft = false (submit final)
    // Draft tidak perlu status, biarkan default ''
    if (processedData.is_draft === false || processedData.is_draft === 0) {
      // Jika approval_status belum di-set, set ke "Waiting for approval"
      if (!processedData.approval_status || processedData.approval_status === '') {
        processedData.approval_status = APPROVAL_STATUS.WAITING_FOR_APPROVAL;
      }
    }
    
    const created = await FIAOnlineReq.create(processedData);
    return created.toJSON();
  } catch (error) {
    throw new Error(`Failed to create FIA Online Request: ${error.message}`);
  }
}

/**
 * Update FIA Online Request
 * @param {object} data - Request data to update (already transformed to backend format)
 * @param {number|string} id - Request ID
 * @returns {Promise<number>} Number of affected rows
 */
async function update(data, id) {
  try {
    if (!id) {
      throw new Error('ID parameter is required');
    }
    
    // Process date fields
    const processedData = processDateFields(data);
    
    const [affectedRows] = await FIAOnlineReq.update(processedData, {
      where: { id: parseInt(id, 10) }
    });
    
    return affectedRows;
  } catch (error) {
    throw new Error(`Failed to update FIA Online Request: ${error.message}`);
  }
}

/**
 * Get list of FIA Online Requests with filters
 * @param {object} filters - Filter options
 * @param {string} filters.request_type - Request type (required)
 * @param {string} filters.branch_site - Branch site (optional)
 * @param {string} filters.workorder_status - Work order status (optional)
 * @param {number} filters.limit - Limit results (optional, default: 50)
 * @param {number} filters.offset - Offset for pagination (optional, default: 0)
 * @returns {Promise<object>} List of requests and pagination info
 */
async function getList(filters = {}) {
  try {
    const {
      request_type,
      branch_site,
      workorder_status,
      limit = 50,
      offset = 0
    } = filters;

    // Build where clause
    const whereClause = {};
    
    if (request_type) {
      whereClause.request_type = request_type;
    }
    
    if (branch_site) {
      whereClause.branch_site = branch_site;
    }
    
    if (workorder_status) {
      whereClause.workorder_status = workorder_status;
    }

    // Get total count
    const total = await FIAOnlineReq.count({ where: whereClause });

    // Get list
    const data = await FIAOnlineReq.findAll({
      where: whereClause,
      order: [['id', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      raw: true
    });

    return {
      data,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };
  } catch (error) {
    throw new Error(`Failed to get FIA Online Request list: ${error.message}`);
  }
}

/**
 * Update workorder status
 * @param {number|string} id - Request ID
 * @param {string} status - New status
 * @returns {Promise<number>} Number of affected rows
 */
async function updateStatus(id, status) {
  try {
    if (!id) {
      throw new Error('ID parameter is required');
    }
    
    if (!status) {
      throw new Error('Status parameter is required');
    }
    
    const [affectedRows] = await FIAOnlineReq.update(
      { 
        workorder_status: status,
        updated_at: new Date()
      },
      { where: { id: parseInt(id, 10) } }
    );
    
    return affectedRows;
  } catch (error) {
    throw new Error(`Failed to update FIA Online Request status: ${error.message}`);
  }
}

/**
 * Get last ID untuk request type tertentu
 * @param {string} requestType - Request type (e.g., 'job-request')
 * @returns {Promise<number>} Last ID atau 0 jika tidak ada
 */
async function getLastIdByRequestType(requestType) {
  try {
    if (!requestType) {
      throw new Error('requestType parameter is required');
    }
    
    const lastRecord = await FIAOnlineReq.findOne({
      where: { request_type: requestType },
      order: [['id', 'DESC']],
      attributes: ['id'],
      raw: true
    });
    
    return lastRecord ? lastRecord.id : 0;
  } catch (error) {
    throw new Error(`Failed to get last ID: ${error.message}`);
  }
}

/**
 * Generate next request ID berdasarkan request_type
 * Mengambil ID terakhir dari database dan increment
 * @param {string} requestType - Request type (e.g., 'job-request')
 * @returns {Promise<string>} Next request ID sebagai string
 */
async function generateNextRequestId(requestType) {
  try {
    if (!requestType) {
      throw new Error('requestType parameter is required');
    }
    
    const lastId = await getLastIdByRequestType(requestType);
    const nextRequestId = lastId > 0 ? (lastId + 1).toString() : '1';
    
    return nextRequestId;
  } catch (error) {
    throw new Error(`Failed to generate next request ID: ${error.message}`);
  }
}

module.exports = {
  generateRefRequestNo,
  getById,
  getByRefNo,
  create,
  update,
  getList,
  updateStatus,
  getLastIdByRequestType,
  generateNextRequestId
};

