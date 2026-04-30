/**
 * FIA Online Request Transformers
 * Transform functions untuk convert antara frontend (nested) dan backend (flat) format
 */

const { safeParseInt, safeParseFloat } = require('./FIAOnlineReqHelpers');

function normalizeTimeField(value) {
  if (!value || value === '' || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '' || trimmed.toLowerCase() === 'invalid date') {
      return null;
    }
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
      const [datePart, timePart] = trimmed.split('T');
      const timeWithSeconds = timePart.includes(':') && timePart.split(':').length === 2
        ? `${timePart}:00`
        : timePart;
      return `${datePart} ${timeWithSeconds}`;
    }
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(trimmed)) {
      return null;
    }
  }
  return value;
}

function combineDateAndTimeForDateTime(dateValue, timeValue) {
  const rawDate = String(dateValue || '').trim();
  const rawTime = String(timeValue || '').trim();

  if (!rawDate || !rawTime) return null;
  if (rawTime.toLowerCase() === 'invalid date') return null;

  if (/^\d{2}:\d{2}$/.test(rawTime)) {
    return `${rawDate} ${rawTime}:00`;
  }

  if (/^\d{2}:\d{2}:\d{2}$/.test(rawTime)) {
    return `${rawDate} ${rawTime}`;
  }

  const parsed = new Date(rawTime);
  if (Number.isNaN(parsed.getTime())) return null;

  const hh = String(parsed.getHours()).padStart(2, '0');
  const mm = String(parsed.getMinutes()).padStart(2, '0');
  const ss = String(parsed.getSeconds()).padStart(2, '0');
  return `${rawDate} ${hh}:${mm}:${ss}`;
}

function extractTimeForFrontend(value) {
  if (!value) return '';

  if (value instanceof Date) {
    const hh = String(value.getHours()).padStart(2, '0');
    const mm = String(value.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  const raw = String(value).trim();
  if (!raw) return '';

  const match = raw.match(/(\d{2}):(\d{2})(?::\d{2})?/);
  if (match) {
    return `${match[1]}:${match[2]}`;
  }

  return raw;
}

/**
 * Transform common fields (Header, RequestInfo, WorkflowTracking)
 * Fields yang sama untuk semua request types
 * @param {object} frontendData - Data dari frontend
 * @returns {object} Common fields dalam format backend
 */
function transformCommonFieldsToBackend(frontendData) {
  const {
    header,
    requestInfo,
    workflowTracking,
    approvals
  } = frontendData;

  return {
    // Header fields
    request_type: header?.requestType || frontendData.request_type,
    ref_request_no: header?.refRequestNo || frontendData.ref_request_no,
    
    // Request Info fields
    request_date: requestInfo?.requestDate || frontendData.request_date,
    request_by: requestInfo?.requestBy || frontendData.request_by,
    request_for: requestInfo?.requestFor || frontendData.request_for,
    request_purpose: requestInfo?.requestPurpose || frontendData.request_purpose,
    priority: requestInfo?.priority || frontendData.priority,
    approval_status: requestInfo?.approvalStatus || frontendData.approval_status,
    branch_site: requestInfo?.branchSite || frontendData.branch_site,
    department: requestInfo?.department || frontendData.department,
    cost_center: requestInfo?.costCenter || frontendData.cost_center,
    request_description: requestInfo?.requestDescription || frontendData.request_description,
    justification: requestInfo?.justification || frontendData.justification,
    comments: requestInfo?.commentRemarkNote || frontendData.comments,
    add_comments: requestInfo?.additionalComments || frontendData.add_comments,
    relevant_docs: requestInfo?.relevantDocs || frontendData.relevant_docs,
    relevant_docs_second: requestInfo?.relevantDocsSecond || frontendData.relevant_docs_second,
    location: requestInfo?.location || frontendData.location,
    
    // Workflow Tracking fields
    check_by: workflowTracking?.checkBy || frontendData.check_by,
    check_date: workflowTracking?.checkDate || frontendData.check_date,
    check_comments: workflowTracking?.checkComments || frontendData.check_comments,
    review_by: workflowTracking?.reviewBy || frontendData.review_by,
    review_date: workflowTracking?.reviewDate || frontendData.review_date,
    review_comments: workflowTracking?.reviewComments || frontendData.review_comments,
    approve_one: workflowTracking?.approveOneBy || approvals?.immediateSupervisor || approvals?.departmentHead || frontendData.approve_one,
    approve_one_date: workflowTracking?.approveOneDate || frontendData.approve_one_date,
    approve_one_comments: workflowTracking?.approveOneComments || frontendData.approve_one_comments,
    approve_second_by: workflowTracking?.approveSecondBy || approvals?.relatedManager || approvals?.departmentHead || frontendData.approve_second_by,
    approve_second_date: workflowTracking?.approveSecondDate || frontendData.approve_second_date,
    approve_second_comments: workflowTracking?.approveSecondComments || frontendData.approve_second_comments,
    approve_third_by: workflowTracking?.approveThirdBy || approvals?.humanResource || frontendData.approve_third_by,
    approve_third_date: workflowTracking?.approveThirdDate || frontendData.approve_third_date,
    approve_third_comments: workflowTracking?.approveThirdComments || frontendData.approve_third_comments,
    
    // Assignment & Scheduling fields (common untuk beberapa request types)
    assigned_to: frontendData.assignment?.assignedTo || frontendData.assigned_to,
    schedule_start_date: frontendData.assignment?.scheduleStartDate || frontendData.schedule_start_date,
    completion_date: frontendData.assignment?.completionDate || frontendData.completion_date,
    workorder_status: frontendData.assignment?.workorderStatus || frontendData.workorder_status,
    actual_start_date: frontendData.assignment?.actualStartDate || frontendData.actual_start_date,
    actual_completion_date: frontendData.assignment?.actualCompletionDate || frontendData.actual_completion_date,
    workorder_closure_date: frontendData.assignment?.workorderClosure || frontendData.workorder_closure_date,
    
    // Work Requirements fields (common untuk beberapa request types)
    special_instructions: frontendData.workRequirements?.specialInstructions || frontendData.special_instructions,
    safety_precautions: frontendData.workRequirements?.safetyPrecautions || frontendData.safety_precautions,
    material_required: frontendData.workRequirements?.materialRequired || frontendData.material_required,
    tool_required: frontendData.workRequirements?.toolRequired || frontendData.tool_required,
    
    // Draft flag
    is_draft: frontendData.is_draft !== undefined ? frontendData.is_draft : false,
  };
}

/**
 * Transform common fields dari backend ke frontend
 * @param {object} backendData - Data dari database
 * @returns {object} Common fields dalam format frontend
 */
function transformCommonFieldsToFrontend(backendData) {
  if (!backendData) return null;

  return {
    id: backendData.id,
    approval_status: backendData.approval_status || '',
    is_draft: backendData.is_draft || false,
    header: {
      requestId: backendData.id?.toString() || '',
      requestType: backendData.request_type || '',
      refRequestNo: backendData.ref_request_no || '',
    },
    requestInfo: {
      requestDate: backendData.request_date || '',
      requestBy: backendData.request_by || '',
      requestFor: backendData.request_for || '',
      requestPurpose: backendData.request_purpose || '',
      priority: backendData.priority || '',
      approvalStatus: backendData.approval_status || '',
      branchSite: backendData.branch_site || '',
      department: backendData.department || '',
      costCenter: backendData.cost_center || '',
      requestDescription: backendData.request_description || '',
      justification: backendData.justification || '',
      commentRemarkNote: backendData.comments || '',
      additionalComments: backendData.add_comments || '',
      relevantDocs: backendData.relevant_docs || '',
      relevantDocsSecond: backendData.relevant_docs_second || '',
      location: backendData.location || '',
    },
    workRequirements: {
      specialInstructions: backendData.special_instructions || '',
      safetyPrecautions: backendData.safety_precautions || '',
      materialRequired: backendData.material_required || '',
      toolRequired: backendData.tool_required || '',
    },
    assignment: {
      assignedTo: backendData.assigned_to || '',
      workorderStatus: backendData.workorder_status || '',
      workorderClosure: backendData.workorder_closure_date || '',
      scheduleStartDate: backendData.schedule_start_date || '',
      actualStartDate: backendData.actual_start_date || '',
      completionDate: backendData.completion_date || '',
      actualCompletionDate: backendData.actual_completion_date || '',
      additionalComments: backendData.add_comments || '',
    },
    approvals: {
      immediateSupervisor: backendData.approve_one || '',
      departmentHead: backendData.approve_second_by || '',
      humanResource: backendData.approve_third_by || '',
      relatedManager: backendData.approve_second_by || '', // Keep for backward compatibility
    },
    workflowTracking: {
      checkBy: backendData.check_by || '',
      checkDate: backendData.check_date || '',
      checkComments: backendData.check_comments || '',
      reviewBy: backendData.review_by || '',
      reviewDate: backendData.review_date || '',
      reviewComments: backendData.review_comments || '',
      approveOneBy: backendData.approve_one || '',
      approveOneDate: backendData.approve_one_date || '',
      approveOneComments: backendData.approve_one_comments || '',
      approveSecondBy: backendData.approve_second_by || '',
      approveSecondDate: backendData.approve_second_date || '',
      approveSecondComments: backendData.approve_second_comments || '',
      approveThirdBy: backendData.approve_third_by || '',
      approveThirdDate: backendData.approve_third_date || '',
      approveThirdComments: backendData.approve_third_comments || '',
      createdAt: backendData.created_at || '',
      updatedAt: backendData.updated_at || '',
    },
  };
}

/**
 * Transform Training Request specific fields dari frontend ke backend
 * @param {object} frontendData - Data dari frontend
 * @returns {object} Training-specific fields dalam format backend
 */
function transformTrainingRequestToBackend(frontendData) {
  const common = transformCommonFieldsToBackend(frontendData);
  const { trainingDetails } = frontendData;

  return {
    ...common,
    // TrainingDetails fields
    training_title: trainingDetails?.trainingTitle || frontendData.training_title,
    training_duration: safeParseInt(trainingDetails?.trainingDuration || frontendData.training_duration),
    training_method: trainingDetails?.trainingMethod || frontendData.training_method,
    last_attended: trainingDetails?.lastAttended || frontendData.last_attended,
    training_provider: trainingDetails?.organizerProvider || frontendData.training_provider,
    date_of_training: trainingDetails?.organizerDate || frontendData.date_of_training,
    venue: trainingDetails?.organizerVenue || frontendData.venue,
    fees: safeParseFloat(trainingDetails?.organizerFees || frontendData.fees),
    employee_request: trainingDetails?.identifiedByEmployee || frontendData.employee_request,
    supervisor_request: trainingDetails?.identifiedBySupervisor || frontendData.supervisor_request,
  };
}

/**
 * Transform Training Request specific fields dari backend ke frontend
 * @param {object} backendData - Data dari database
 * @returns {object} Training-specific fields dalam format frontend
 */
function transformTrainingRequestToFrontend(backendData) {
  if (!backendData) return null;

  const common = transformCommonFieldsToFrontend(backendData);

  return {
    ...common,
    trainingDetails: {
      trainingTitle: backendData.training_title || '',
      trainingDuration: backendData.training_duration?.toString() || '',
      trainingMethod: backendData.training_method || '',
      lastAttended: backendData.last_attended || '',
      organizerProvider: backendData.training_provider || '',
      organizerDate: backendData.date_of_training || '',
      organizerVenue: backendData.venue || '',
      organizerFees: backendData.fees?.toString() || '',
      identifiedByEmployee: backendData.employee_request || '',
      identifiedBySupervisor: backendData.supervisor_request || '',
      identifiedByOther: backendData.identified_by_other || '',
    },
  };
}

/**
 * Transform Job Request specific fields dari frontend ke backend
 * @param {object} frontendData - Data dari frontend
 * @returns {object} Job-specific fields dalam format backend
 */
function transformJobRequestToBackend(frontendData) {
  const common = transformCommonFieldsToBackend(frontendData);
  const { jobOrder } = frontendData;

  return {
    ...common,
    // Job Order fields
    work_location: jobOrder?.location || frontendData.work_location,
    job_type: jobOrder?.jobType || frontendData.job_type,
    asset_no: jobOrder?.assetEquipment || frontendData.asset_no,
  };
}

/**
 * Transform Job Request specific fields dari backend ke frontend
 * @param {object} backendData - Data dari database
 * @returns {object} Job-specific fields dalam format frontend
 */
function transformJobRequestToFrontend(backendData) {
  if (!backendData) return null;

  const common = transformCommonFieldsToFrontend(backendData);

  return {
    ...common,
    jobOrder: {
      jobType: backendData.job_type || '',
      location: backendData.work_location || '',
      assetEquipment: backendData.asset_no || '',
    },
  };
}

/**
 * Transform Fleet Request specific fields dari frontend ke backend
 * @param {object} frontendData - Data dari frontend
 * @returns {object} Fleet-specific fields dalam format backend
 */
function transformFleetRequestToBackend(frontendData) {
  const common = transformCommonFieldsToBackend(frontendData);
  const { fleetDetails, transferDetails } = frontendData;

  return {
    ...common,
    // FleetDetails fields
    fleet_type: fleetDetails?.fleetType || frontendData.fleet_type,
    number_of_units: safeParseInt(fleetDetails?.numberOfUnits || frontendData.number_of_units),
    specifications: fleetDetails?.specifications || frontendData.specifications,
    
    // TransferDetails fields
    current_owner: transferDetails?.currentOwner || frontendData.current_owner,
    reason_for_transfer: transferDetails?.reasonForTransfer || frontendData.reason_for_transfer,
    work_location: transferDetails?.workLocation || frontendData.work_location,
  };
}

/**
 * Transform Fleet Request specific fields dari backend ke frontend
 * @param {object} backendData - Data dari database
 * @returns {object} Fleet-specific fields dalam format frontend
 */
function transformFleetRequestToFrontend(backendData) {
  if (!backendData) return null;

  const common = transformCommonFieldsToFrontend(backendData);

  return {
    ...common,
    fleetDetails: {
      fleetType: backendData.fleet_type || '',
      numberOfUnits: backendData.number_of_units?.toString() || '',
      specifications: backendData.specifications || '',
    },
    transferDetails: {
      currentOwner: backendData.current_owner || '',
      workLocation: backendData.work_location || '',
      reasonForTransfer: backendData.reason_for_transfer || '',
    },
  };
}

/**
 * Transform Inspection Defect Request specific fields dari frontend ke backend
 * @param {object} frontendData - Data dari frontend
 * @returns {object} Inspection Defect-specific fields dalam format backend
 */
function transformInspectionDefectToBackend(frontendData) {
  const common = transformCommonFieldsToBackend(frontendData);
  const { inspectionDetailInfo } = frontendData;

  return {
    ...common,
    // Inspection Detail Info fields
    asset_no: inspectionDetailInfo?.assetNo || frontendData.asset_no || '',
    asset_type: inspectionDetailInfo?.assetType || frontendData.asset_type || '',
    asset_model: inspectionDetailInfo?.assetModel || frontendData.asset_model || '',
    location: inspectionDetailInfo?.location || frontendData.requestInfo?.location || frontendData.location || '',
    inspection_summary: inspectionDetailInfo?.inspectionSummary || frontendData.inspection_summary || '',
    comments: inspectionDetailInfo?.notesComments || frontendData.requestInfo?.commentRemarkNote || frontendData.comments || '',
    add_comments: inspectionDetailInfo?.additionalNotes || frontendData.requestInfo?.additionalComments || frontendData.add_comments || ''
    // assetDescription SKIPPED - tidak disimpan, akan di-fetch dari API asset berdasarkan asset_no
  };
}

/**
 * Transform Inspection Defect Request specific fields dari backend ke frontend
 * @param {object} backendData - Data dari database
 * @returns {object} Inspection Defect-specific fields dalam format frontend
 */
function transformInspectionDefectToFrontend(backendData) {
  if (!backendData) return null;

  const common = transformCommonFieldsToFrontend(backendData);

  return {
    ...common,
    // Inspection Detail Info
    inspectionDetailInfo: {
      assetNo: backendData.asset_no || '',
      assetDescription: '', // SKIPPED - akan di-fetch dari API asset berdasarkan asset_no
      assetType: backendData.asset_type || '',
      assetModel: backendData.asset_model || '',
      location: backendData.location || '',
      inspectionSummary: backendData.inspection_summary || '',
      notesComments: backendData.comments || '',
      additionalNotes: backendData.add_comments || ''
    },
    // Defect Details will be loaded separately in repository
    defectDetails: []
  };
}

/**
 * Transform Travel Request specific fields dari frontend ke backend
 * @param {object} frontendData - Data dari frontend
 * @returns {object} Travel-specific fields dalam format backend
 */
function transformTravelRequestToBackend(frontendData) {
  const common = transformCommonFieldsToBackend(frontendData);
  const { travelDetails } = frontendData;

  return {
    ...common,
    // Travel Details fields
    number_of_person: safeParseInt(travelDetails?.numberOfPerson),
    no_days_absent: safeParseInt(travelDetails?.noDaysAbsent),
    departure: travelDetails?.departure || null,
    return_date: travelDetails?.return || null,
    date_return_to_work: travelDetails?.dateReturnToWork || null,
    point_of_leave: travelDetails?.pointOfLeave || '',
    total_leave_days_remaining: safeParseInt(travelDetails?.totalLeaveDaysRemaining),
    total_day_taken_on_this_holiday: safeParseInt(travelDetails?.totalDayTakenOnThisHoliday),
    day_off_holiday: safeParseInt(travelDetails?.dayOffHoliday),
    total_days_taken_on_this_vacation: safeParseInt(travelDetails?.totalDaysTakenOnThisVacation),
    last_balance_entitlement: safeParseInt(travelDetails?.lastBalanceEntitlement),
    first_workday_absentfrom_work: travelDetails?.firstWorkDayAbsentFromWork || null,
    last_workday_absent_from_work: travelDetails?.lastWorkDayAbsentFromWork || null,
    total_number_of_days_absent: safeParseInt(travelDetails?.totalNumberOfDaysAbsent),
    less_statutory: safeParseInt(travelDetails?.lessStatutoryPublicHolidaySundayIncluded),
    net_working_days_leave_requested: safeParseInt(travelDetails?.netWorkingDaysLeaveRequested)
    // contactDuringLeave SKIPPED - tidak disimpan
  };
}

/**
 * Transform Travel Request specific fields dari backend ke frontend
 * @param {object} backendData - Data dari database
 * @returns {object} Travel-specific fields dalam format frontend
 */
function transformTravelRequestToFrontend(backendData) {
  if (!backendData) return null;

  const common = transformCommonFieldsToFrontend(backendData);

  return {
    ...common,
    // Travel Details
    travelDetails: {
      numberOfPerson: backendData.number_of_person || 0,
      noDaysAbsent: backendData.no_days_absent || 0,
      departure: backendData.departure || '',
      return: backendData.return_date || '',
      dateReturnToWork: backendData.date_return_to_work || '',
      contactDuringLeave: '', // SKIPPED - not stored in database
      pointOfLeave: backendData.point_of_leave || '',
      totalLeaveDaysRemaining: backendData.total_leave_days_remaining || 0,
      totalDayTakenOnThisHoliday: backendData.total_day_taken_on_this_holiday || 0,
      dayOffHoliday: backendData.day_off_holiday || 0,
      totalDaysTakenOnThisVacation: backendData.total_days_taken_on_this_vacation || 0,
      lastBalanceEntitlement: backendData.last_balance_entitlement || 0,
      firstWorkDayAbsentFromWork: backendData.first_workday_absentfrom_work || '',
      lastWorkDayAbsentFromWork: backendData.last_workday_absent_from_work || '',
      totalNumberOfDaysAbsent: backendData.total_number_of_days_absent || 0,
      lessStatutoryPublicHolidaySundayIncluded: backendData.less_statutory || 0,
      netWorkingDaysLeaveRequested: backendData.net_working_days_leave_requested || 0
    },
    // Travelers will be loaded separately in repository
    travelers: []
  };
}

/**
 * Transform Workforce Request specific fields dari frontend ke backend
 * @param {object} frontendData - Data dari frontend
 * @returns {object} Workforce-specific fields dalam format backend
 */
function transformWorkforceRequestToBackend(frontendData) {
  const common = transformCommonFieldsToBackend(frontendData);
  const { workforceSpecs, jobRequirements } = frontendData;

  return {
    ...common,
    // Workforce Specs fields
    job_title: workforceSpecs?.jobTitle || '',
    number_of_position: safeParseInt(workforceSpecs?.positions),
    employment_type: workforceSpecs?.employmentType || '',
    overtime_require: workforceSpecs?.overtimeRequired === true ? 'true' : (workforceSpecs?.overtimeRequired === false ? 'false' : ''),
    work_schedule: workforceSpecs?.workSchedule || '',
    work_location: workforceSpecs?.workLocation || '',
    shift: workforceSpecs?.shift || '',
    // Job Requirements fields
    job_description: jobRequirements?.jobDescription || '',
    key_responsibilities: jobRequirements?.keyResponsibilities || '',
    required_skills: jobRequirements?.requiredSkills || '',
    experience: jobRequirements?.experience || '',
    education: jobRequirements?.education || ''
  };
}

/**
 * Transform Workforce Request specific fields dari backend ke frontend
 * @param {object} backendData - Data dari database
 * @returns {object} Workforce-specific fields dalam format frontend
 */
function transformWorkforceRequestToFrontend(backendData) {
  if (!backendData) return null;

  const common = transformCommonFieldsToFrontend(backendData);

  return {
    ...common,
    workforceSpecs: {
      jobTitle: backendData.job_title || '',
      positions: backendData.number_of_position || 0,
      employmentType: backendData.employment_type || '',
      overtimeRequired: backendData.overtime_require === 'true' || backendData.overtime_require === true,
      workSchedule: backendData.work_schedule || '',
      workLocation: backendData.work_location || '',
      shift: backendData.shift || ''
    },
    jobRequirements: {
      jobDescription: backendData.job_description || '',
      keyResponsibilities: backendData.key_responsibilities || '',
      requiredSkills: backendData.required_skills || '',
      experience: backendData.experience || '',
      education: backendData.education || ''
    }
  };
}

/**
 * Transform Asset Request specific fields dari frontend ke backend
 * @param {object} frontendData - Data dari frontend
 * @returns {object} Asset-specific fields dalam format backend
 */
function transformAssetRequestToBackend(frontendData) {
  const common = transformCommonFieldsToBackend(frontendData);
  const { assetDetails } = frontendData;

  return {
    ...common,
    // Asset Details fields
    asset_type: assetDetails?.assetType || '',
    asset_model: assetDetails?.assetModel || '',
    asset_specification: assetDetails?.assetSpecification || '',
    quantity: safeParseInt(assetDetails?.quantity)
    // assetDetails.comments SKIPPED - tidak disimpan
  };
}

/**
 * Transform Asset Request specific fields dari backend ke frontend
 * @param {object} backendData - Data dari database
 * @returns {object} Asset-specific fields dalam format frontend
 */
function transformAssetRequestToFrontend(backendData) {
  if (!backendData) return null;

  const common = transformCommonFieldsToFrontend(backendData);

  return {
    ...common,
    assetDetails: {
      assetType: backendData.asset_type || '',
      assetModel: backendData.asset_model || '',
      assetSpecification: backendData.asset_specification || '',
      quantity: backendData.quantity || 1,
      comments: '' // SKIPPED - not stored in database
    }
  };
}

/**
 * Transform Cash Request specific fields dari frontend ke backend
 * @param {object} frontendData - Data dari frontend
 * @returns {object} Cash-specific fields dalam format backend
 */
function transformCashRequestToBackend(frontendData) {
  const common = transformCommonFieldsToBackend(frontendData);
  const { cashRequestDetails } = frontendData;

  return {
    ...common,
    // Cash Request Details fields
    expense_type: cashRequestDetails?.expenseType || '',
    amount_request: safeParseFloat(cashRequestDetails?.amountRequest),
    payment_method: cashRequestDetails?.paymentMethod || '',
    bank_account: cashRequestDetails?.bankAccount || ''
    // currency SKIPPED - tidak disimpan di backend
  };
}

/**
 * Transform Cash Request specific fields dari backend ke frontend
 * @param {object} backendData - Data dari database
 * @returns {object} Cash-specific fields dalam format frontend
 */
function transformCashRequestToFrontend(backendData) {
  if (!backendData) return null;

  const common = transformCommonFieldsToFrontend(backendData);

  return {
    ...common,
    cashRequestDetails: {
      expenseType: backendData.expense_type || '',
      amountRequest: backendData.amount_request || 0,
      paymentMethod: backendData.payment_method || '',
      bankAccount: backendData.bank_account || '',
      currency: 'IDR' // SKIPPED - default value, not stored in database
    }
  };
}

/**
 * Transform Accommodation Request specific fields dari frontend ke backend
 * @param {object} frontendData - Data dari frontend
 * @returns {object} Accommodation-specific fields dalam format backend
 */
function transformAccommodationRequestToBackend(frontendData) {
  const common = transformCommonFieldsToBackend(frontendData);
  const { extendedRequestDetails, accommodationRequirements, accommodationDetails } = frontendData;

  return {
    ...common,
    // Extended Request Details fields
    visitor_name: extendedRequestDetails?.visitorName || '',
    duration_of_stay: safeParseInt(extendedRequestDetails?.durationOfStay),
    // extendedRequestDetails.comments SKIPPED - tidak disimpan
    // Accommodation Requirements fields
    accomodation_type: accommodationRequirements?.accommodationType || '',
    number_of_nights: safeParseInt(accommodationRequirements?.numberOfNights),
    extra_bed: accommodationRequirements?.extraBed || '',
    meal_provided: accommodationRequirements?.mealProvided || '',
    // Accommodation Details fields
    // accommodationDetails.arrivalLocation SKIPPED - tidak disimpan
    accomodation_location: accommodationDetails?.accommodationLocation || '',
    room_number: accommodationDetails?.roomNumber || '',
    checkin_time: normalizeTimeField(accommodationDetails?.checkInTime),
checkout_time: normalizeTimeField(accommodationDetails?.checkOutTime)
  };
}

/**
 * Transform Accommodation Request specific fields dari backend ke frontend
 * @param {object} backendData - Data dari database
 * @returns {object} Accommodation-specific fields dalam format frontend
 */
function transformAccommodationRequestToFrontend(backendData) {
  if (!backendData) return null;

  const common = transformCommonFieldsToFrontend(backendData);

  return {
    ...common,
    extendedRequestDetails: {
      visitorName: backendData.visitor_name || '',
      durationOfStay: backendData.duration_of_stay ? backendData.duration_of_stay.toString() : '',
      comments: '' // SKIPPED - not stored in database
    },
    accommodationRequirements: {
      accommodationType: backendData.accomodation_type || '',
      numberOfNights: backendData.number_of_nights ? backendData.number_of_nights.toString() : '',
      extraBed: backendData.extra_bed || '',
      mealProvided: backendData.meal_provided || ''
    },
    accommodationDetails: {
      arrivalLocation: '', // SKIPPED - not stored in database
      accommodationLocation: backendData.accomodation_location || '',
      roomNumber: backendData.room_number || '',
      checkInTime: backendData.checkin_time || '',
      checkOutTime: backendData.checkout_time || ''
    }
  };
}

/**
 * Transform Transport Request specific fields dari frontend ke backend
 * @param {object} frontendData - Data dari frontend
 * @returns {object} Transport-specific fields dalam format backend
 */
function transformTransportRequestToBackend(frontendData) {
  const common = transformCommonFieldsToBackend(frontendData);
  const { transportationDetails, officeUseDetails } = frontendData;

  return {
    ...common,
    // Transportation Details fields
    destination: transportationDetails?.destination || '',
    mode_of_transport: transportationDetails?.modeOfTransport || '',
    no_of_passengers: safeParseInt(transportationDetails?.noOfPassengers),
    pickup_time: transportationDetails?.pickUpTime || null,
    special_requirement: transportationDetails?.specialRequirement || '',
    drop_off_time: transportationDetails?.dropOffTime || null,
    // transportationDetails.comments SKIPPED - tidak disimpan
    // Office Use Details fields
    vehicle_no: officeUseDetails?.vehicleNo || '',
    driver_name: officeUseDetails?.driverName || '',
    contact_no: officeUseDetails?.contactNo || ''
    // requestInfo.relevantDates SKIPPED - tidak disimpan
  };
}

/**
 * Transform Transport Request specific fields dari backend ke frontend
 * @param {object} backendData - Data dari database
 * @returns {object} Transport-specific fields dalam format frontend
 */
function transformTransportRequestToFrontend(backendData) {
  if (!backendData) return null;

  const common = transformCommonFieldsToFrontend(backendData);

  return {
    ...common,
    transportationDetails: {
      destination: backendData.destination || '',
      modeOfTransport: backendData.mode_of_transport || '',
      noOfPassengers: backendData.no_of_passengers ? backendData.no_of_passengers.toString() : '',
      pickUpTime: backendData.pickup_time || '',
      specialRequirement: backendData.special_requirement || '',
      dropOffTime: backendData.drop_off_time || '',
      comments: '' // SKIPPED - not stored in database
    },
    officeUseDetails: {
      vehicleNo: backendData.vehicle_no || '',
      driverName: backendData.driver_name || '',
      contactNo: backendData.contact_no || ''
    }
  };
}

/**
 * Transform Visitor Request specific fields dari frontend ke backend
 * @param {object} frontendData - Data dari frontend
 * @returns {object} Visitor-specific fields dalam format backend
 */
function transformVisitorRequestToBackend(frontendData) {
  const common = transformCommonFieldsToBackend(frontendData);
  const { visitorDetails, visitDetails, hostDetails, securityClearance, specialRequirements, visitorRegistration } = frontendData;

  return {
    ...common,
    // Visitor Details fields
    visitor_name: visitorDetails?.visitorName || '',
    company_organizer: visitorDetails?.companyOrg || '',
    contact: visitorDetails?.contactNoEmail || '',
    // Visit Details fields
    date_visit: visitDetails?.dateOfVisit || null,
    time_visit: combineDateAndTimeForDateTime(visitDetails?.dateOfVisit, visitDetails?.timeOfVisit),
    expected_duration: visitDetails?.expectedDuration || '',
    // Host Details fields
    host_name: hostDetails?.hostName || '',
    host_department: hostDetails?.department || '',
    host_contact: hostDetails?.contactNumber || '',
    // Security Clearance fields
    clearance_required: securityClearance?.clearanceRequired || '',
    type_of_clearance: securityClearance?.typeOfClearance || '',
    // securityClearance.comments SKIPPED - tidak ada di model
    // Special Requirements fields
    meeting_room: specialRequirements?.meetingRoom || '',
    equipment_require: specialRequirements?.equipmentRequirements || '',
    // specialRequirements.comments SKIPPED - tidak ada di model
    // Visitor Registration fields
    visitor_id: visitorRegistration?.visitorId || '',
    // visitorRegistration.checkInTime SKIPPED - tidak ada field check_in di model
    // visitorRegistration.checkOutTime SKIPPED - tidak ada field check_out di model
  };
}

/**
 * Transform Visitor Request specific fields dari backend ke frontend
 * @param {object} backendData - Data dari database
 * @returns {object} Visitor-specific fields dalam format frontend
 */
function transformVisitorRequestToFrontend(backendData) {
  if (!backendData) return null;

  const common = transformCommonFieldsToFrontend(backendData);

  return {
    ...common,
    visitorDetails: {
      visitorName: backendData.visitor_name || '',
      companyOrg: backendData.company_organizer || '',
      contactNoEmail: backendData.contact || ''
    },
    visitDetails: {
      dateOfVisit: backendData.date_visit || '',
      timeOfVisit: extractTimeForFrontend(backendData.time_visit),
      expectedDuration: backendData.expected_duration || ''
    },
    hostDetails: {
      hostName: backendData.host_name || '',
      department: backendData.host_department || '',
      contactNumber: backendData.host_contact || ''
    },
    securityClearance: {
      clearanceRequired: backendData.clearance_required || '',
      typeOfClearance: backendData.type_of_clearance || '',
      comments: '' // SKIPPED - not stored in database
    },
    specialRequirements: {
      meetingRoom: backendData.meeting_room || '',
      equipmentRequirements: backendData.equipment_require || '',
      comments: '' // SKIPPED - not stored in database
    },
    visitorRegistration: {
      visitorId: backendData.visitor_id || '',
      checkInTime: '', // SKIPPED - not stored in database
      checkOutTime: '' // SKIPPED - not stored in database
    }
  };
}

/**
 * Transform Purchase Requisition specific fields dari frontend ke backend
 * @param {object} frontendData - Data dari frontend
 * @returns {object} Purchase Requisition-specific fields dalam format backend
 */
function transformPurchaseRequisitionToBackend(frontendData) {
  const common = transformCommonFieldsToBackend(frontendData);
  const { requisitionInfo } = frontendData;

  return {
    ...common,
    // Request Info fields - Purchase Requisition specific
    // amount_request SKIPPED — tidak lagi dikirim dari form FE (gunakan itemDetails / estimated total jika perlu)
    // requestInfo.estimatedTime SKIPPED - tidak ada di model
    // requestInfo.firstService SKIPPED - tidak ada di model
    // Requisition Information fields
    supplier: requisitionInfo?.supplier || '',
    payment_method: frontendData.header?.fullPaymentMethod || '',
    // requisitionInfo.supplierAddress SKIPPED - tidak ada di model (read-only dari master)
    // requisitionInfo.supplierContact SKIPPED - tidak ada di model (read-only dari master)
    // requisitionInfo.comments SKIPPED - tidak ada di model (bisa pakai comments/add_comments jika perlu)
    // estimatedTotalCost SKIPPED - calculated field, tidak perlu disimpan
    // remark, internalNote, attachment SKIPPED - tidak ada di model
  };
}

/**
 * Transform Purchase Requisition specific fields dari backend ke frontend
 * @param {object} backendData - Data dari database
 * @returns {object} Purchase Requisition-specific fields dalam format frontend
 */
function transformPurchaseRequisitionToFrontend(backendData) {
  if (!backendData) return null;

  const common = transformCommonFieldsToFrontend(backendData);

  return {
    ...common,
    header: {
      ...common.header,
      // Override requisitionId untuk purchase requisition
      // Jika backendData.id ada (sudah tersimpan), gunakan ID tersebut
      // Jika belum ada (form baru), gunakan requestId dari common
      requisitionId: backendData.id?.toString() || common.header.requestId || '',
      fullPaymentMethod: backendData.payment_method || ''
    },
    requestInfo: {
      ...common.requestInfo,
      estimatedTime: '', // SKIPPED - not stored in database
      firstService: '' // SKIPPED - not stored in database
    },
    requisitionInfo: {
      supplier: backendData.supplier || '',
      supplierAddress: '', // SKIPPED - not stored in database (read-only dari master)
      supplierContact: '', // SKIPPED - not stored in database (read-only dari master)
      comments: '' // SKIPPED - not stored in database
    },
    itemDetails: [], // Empty array - akan di-load di repository
    estimatedTotalCost: '0.00', // Calculated field
    remark: '', // SKIPPED - not stored in database
    internalNote: '', // SKIPPED - not stored in database
    attachment: '' // SKIPPED - not stored in database
  };
}

module.exports = {
  // Common transformers
  transformCommonFieldsToBackend,
  transformCommonFieldsToFrontend,
  
  // Specific transformers
  transformTrainingRequestToBackend,
  transformTrainingRequestToFrontend,
  transformJobRequestToBackend,
  transformJobRequestToFrontend,
  transformFleetRequestToBackend,
  transformFleetRequestToFrontend,
  transformInspectionDefectToBackend,
  transformInspectionDefectToFrontend,
  transformTravelRequestToBackend,
  transformTravelRequestToFrontend,
  transformWorkforceRequestToBackend,
  transformWorkforceRequestToFrontend,
  transformAssetRequestToBackend,
  transformAssetRequestToFrontend,
  transformCashRequestToBackend,
  transformCashRequestToFrontend,
  transformAccommodationRequestToBackend,
  transformAccommodationRequestToFrontend,
  transformTransportRequestToBackend,
  transformTransportRequestToFrontend,
  transformVisitorRequestToBackend,
  transformVisitorRequestToFrontend,
  transformPurchaseRequisitionToBackend,
  transformPurchaseRequisitionToFrontend,
};



