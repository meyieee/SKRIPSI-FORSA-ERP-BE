/**
 * FIA Online Request Constants
 * Constants untuk approval status dan status values lainnya
 */

/**
 * Approval Status Enum
 * Status untuk approval workflow
 */
const APPROVAL_STATUS = {
  WAITING_FOR_APPROVAL: 'Waiting for approval',
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected'
};

/**
 * Get all approval status values
 * @returns {string[]} Array of approval status values
 */
function getAllApprovalStatuses() {
  return Object.values(APPROVAL_STATUS);
}

/**
 * Check if approval status is valid
 * @param {string} status - Status to validate
 * @returns {boolean} True if valid, false otherwise
 */
function isValidApprovalStatus(status) {
  return Object.values(APPROVAL_STATUS).includes(status);
}

module.exports = {
  APPROVAL_STATUS,
  getAllApprovalStatuses,
  isValidApprovalStatus
};
