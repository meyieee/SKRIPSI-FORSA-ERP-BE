/**
 * FIA Online Request Helper Functions
 * Shared utility functions untuk semua request types
 */

/**
 * Request Type Prefix Mapping
 * Mapping request_type ke prefix untuk ref_request_no
 */
const REQUEST_TYPE_PREFIX_MAP = {
  'job-request': 'JOB',
  'fleet-request': 'FLE',
  'inspection-defect': 'INS',
  'travel-request': 'TRL',
  'training-request': 'TRQ',
  'workforce-request': 'WFR',
  'asset-request': 'ASR',
  'cash-request': 'CAR',
  'purchase-requisition': 'PRQ',
  'accommodation-request': 'ACC',
  'transport-request': 'TPR',
  'visitor-request': 'VIS'
};

// Valid request types (whitelist)
const VALID_REQUEST_TYPES = Object.keys(REQUEST_TYPE_PREFIX_MAP);

// Date fields yang perlu di-convert dari string ke Date object
const DATE_FIELDS = [
  'request_date',
  'schedule_start_date',
  'completion_date',
  'actual_start_date',
  'actual_completion_date',
  'workorder_closure_date',
  'last_attended',
  'date_of_training',
  'check_date',
  'review_date',
  'approve_one_date',
  'approve_second_date',
  'approve_third_date',
  // Travel Request date fields
  'departure',
  'return_date',
  'date_return_to_work',
  'first_workday_absentfrom_work',
  'last_workday_absent_from_work',
  // Accommodation Request date fields
  'checkin_time',
  'checkout_time',
  // Transport Request date fields
  'pickup_time',
  'drop_off_time',
  // Visitor Request date fields
  'date_visit',
  'time_visit'
];

// Reference number padding
const REF_REQUEST_NO_PADDING = 3;

function getRefRequestPeriod(date = new Date()) {
  const dt = date instanceof Date ? date : new Date(date);
  const year = String(dt.getFullYear()).slice(-2);
  const month = String(dt.getMonth() + 1).padStart(2, '0');
  return `${year}${month}`;
}

/**
 * Get prefix untuk ref_request_no berdasarkan request_type
 * @param {string} requestType - Request type dari frontend (e.g., 'job-request')
 * @returns {string} Prefix untuk ref_request_no (e.g., 'JOB')
 */
function getRequestTypePrefix(requestType) {
  return REQUEST_TYPE_PREFIX_MAP[requestType] || 'REQ';
}

/**
 * Validate request_type apakah valid
 * @param {string} requestType - Request type yang akan divalidasi
 * @returns {boolean} True jika valid, false jika tidak
 */
function validateRequestType(requestType) {
  return VALID_REQUEST_TYPES.includes(requestType);
}

/**
 * Safe parseInt dengan default value
 * @param {any} value - Value yang akan di-parse
 * @param {number|null} defaultValue - Default value jika parsing gagal
 * @returns {number|null} Parsed integer atau default value
 */
function safeParseInt(value, defaultValue = null) {
  if (!value && value !== 0) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Safe parseFloat dengan default value
 * @param {any} value - Value yang akan di-parse
 * @param {number|null} defaultValue - Default value jika parsing gagal
 * @returns {number|null} Parsed float atau default value
 */
function safeParseFloat(value, defaultValue = null) {
  if (!value && value !== 0) return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Process date fields - convert string to Date object atau null
 * @param {object} data - Data object yang akan di-process
 * @returns {object} Data dengan date fields yang sudah di-convert
 */
// Di FIAOnlineReqHelpers.js
function processDateFields(data) {
  const processed = { ...data };
  
  DATE_FIELDS.forEach(field => {
    // Skip jika sudah dalam format datetime string (YYYY-MM-DD HH:mm:ss)
    if (processed[field] && typeof processed[field] === 'string') {
      const value = processed[field].trim();
      
      // Jika sudah format datetime string, biarkan sebagai string
      // Sequelize akan handle conversion
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
        // Already in correct format, keep as string
        return;
      }
      
      // Handle datetime-local format
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value)) {
        // Convert ke format database: "YYYY-MM-DD HH:mm:ss"
        const [datePart, timePart] = value.split('T');
        const timeWithSeconds = timePart.split(':').length === 2 
          ? `${timePart}:00` 
          : timePart;
        processed[field] = `${datePart} ${timeWithSeconds}`;
        return;
      }
      
      // Untuk format lain, convert ke Date object
      processed[field] = new Date(value);
    } else if (processed[field] === '' || processed[field] === null) {
      processed[field] = null;
    }
  });
  
  return processed;
}

/**
 * Format reference request number
 * @param {string} prefix - Prefix untuk ref_request_no (e.g., 'TRQ')
 * @param {number} number - Number untuk ref_request_no
 * @returns {string} Formatted ref_request_no (e.g., 'TRQ-001')
 */
function formatRefRequestNo(prefix, number, date = new Date()) {
  return `${prefix}${getRefRequestPeriod(date)}-${String(number).padStart(REF_REQUEST_NO_PADDING, '0')}`;
}

module.exports = {
  // Constants
  REQUEST_TYPE_PREFIX_MAP,
  VALID_REQUEST_TYPES,
  DATE_FIELDS,
  REF_REQUEST_NO_PADDING,
  
  // Helper functions
  getRefRequestPeriod,
  getRequestTypePrefix,
  validateRequestType,
  safeParseInt,
  safeParseFloat,
  processDateFields,
  formatRefRequestNo
};

