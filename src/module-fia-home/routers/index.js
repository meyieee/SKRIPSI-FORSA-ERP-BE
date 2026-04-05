const JobRequest = require('../controllers/JobRequestController');
const FleetRequest = require('../controllers/FleetRequestController');
const TrainingRequest = require('../controllers/TrainingRequestController');
const InspectionDefect = require('../controllers/InspectionDefectController');
const TravelRequest = require('../controllers/TravelRequestController');
const WorkforceRequest = require('../controllers/WorkforceRequestController');
const AssetRequest = require('../controllers/AssetRequestController');
const CashRequest = require('../controllers/CashRequestController');
const AccommodationRequest = require('../controllers/AccommodationRequestController');
const TransportRequest = require('../controllers/TransportRequestController');
const VisitorRequest = require('../controllers/VisitorRequestController');
const PurchaseRequisition = require('../controllers/PurchaseRequisitionController');
const OnlineServiceEmployee = require('../controllers/OnlineServiceEmployeeController');
const validationAPI = require('../../middlewares/validationAPI');

/**
 * Job Request Router
 * Register all routes for Job Request
 */
const JobRequestRouter = (router) => {
  // | \ Job Request Routers
  
  // POST - Create new job request
  router.post('/job-request', validationAPI, JobRequest.postJobRequest);
  
  // GET - Get new form (MUST BE BEFORE /:id route)
  router.get('/job-request/new', validationAPI, JobRequest.getJobRequestNew);
  
  // GET - Get list (MUST BE BEFORE /:id route)
  router.get('/job-request', validationAPI, JobRequest.getJobRequestList);
  
  // GET - Get by ID (MUST BE AFTER specific routes)
  router.get('/job-request/:id', validationAPI, JobRequest.getJobRequest);
  
  // PUT - Update job request
  router.put('/job-request/:id', validationAPI, JobRequest.updateJobRequest);
  
  // PUT - Update status
  router.put('/job-request/:id/status', validationAPI, JobRequest.updateJobRequestStatus);
}

/**
 * Fleet Request Router
 * Register all routes for Fleet Request
 */
const FleetRequestRouter = (router) => {
  // | \ Fleet Request Routers
  
  // POST - Create new fleet request (submit final)
  router.post('/fleet-request', validationAPI, FleetRequest.postFleetRequest);
  
  // POST - Save draft
  router.post('/fleet-request/draft', validationAPI, FleetRequest.saveFleetRequestDraft);
  
  // GET - Get draft (optional)
  router.get('/fleet-request/draft', validationAPI, FleetRequest.getFleetRequestDraft);
  
  // GET - Get new form (MUST BE BEFORE /:id route)
  router.get('/fleet-request/new', validationAPI, FleetRequest.getFleetRequestNew);
  
  // GET - Get list (MUST BE BEFORE /:id route)
  router.get('/fleet-request', validationAPI, FleetRequest.getFleetRequestList);
  
  // GET - Get by ID (MUST BE AFTER specific routes)
  router.get('/fleet-request/:id', validationAPI, FleetRequest.getFleetRequest);
  
  // PUT - Update fleet request
  router.put('/fleet-request/:id', validationAPI, FleetRequest.updateFleetRequest);
}

/**
 * Training Request Router
 * Register all routes for Training Request
 */
const TrainingRequestRouter = (router) => {
  // | \ Training Request Routers
  
  // POST - Create new training request (submit final)
  router.post('/training-request', validationAPI, TrainingRequest.postTrainingRequest);
  
  // POST - Save draft
  router.post('/training-request/draft', validationAPI, TrainingRequest.saveTrainingRequestDraft);
  
  // GET - Get draft
  router.get('/training-request/draft', validationAPI, TrainingRequest.getTrainingRequestDraft);
  
  // GET - Get new form (MUST BE BEFORE /:id route)
  router.get('/training-request/new', validationAPI, TrainingRequest.getTrainingRequestNew);
  
  // GET - Get list (MUST BE BEFORE /:id route)
  router.get('/training-request', validationAPI, TrainingRequest.getTrainingRequestList);
  
  // GET - Get by ID (MUST BE AFTER specific routes)
  router.get('/training-request/:id', validationAPI, TrainingRequest.getTrainingRequest);
  
  // PUT - Update training request
  router.put('/training-request/:id', validationAPI, TrainingRequest.updateTrainingRequest);
}

/**
 * Inspection Defect Router
 * Register all routes for Inspection Defect Request
 */
const InspectionDefectRouter = (router) => {
  // | \ Inspection Defect Routers
  
  // POST - Create new inspection defect request (submit final)
  router.post('/inspection-defect', validationAPI, InspectionDefect.postInspectionDefect);
  
  // POST - Save draft
  router.post('/inspection-defect/draft', validationAPI, InspectionDefect.saveInspectionDefectDraft);
  
  // GET - Get draft
  router.get('/inspection-defect/draft', validationAPI, InspectionDefect.getInspectionDefectDraft);
  
  // GET - Get new form (MUST BE BEFORE /:id route)
  router.get('/inspection-defect/new', validationAPI, InspectionDefect.getInspectionDefectNew);
  
  // GET - Get list (MUST BE BEFORE /:id route)
  router.get('/inspection-defect', validationAPI, InspectionDefect.getInspectionDefectList);
  
  // GET - Get by ID (MUST BE AFTER specific routes)
  router.get('/inspection-defect/:id', validationAPI, InspectionDefect.getInspectionDefect);
  
  // PUT - Update inspection defect request
  router.put('/inspection-defect/:id', validationAPI, InspectionDefect.updateInspectionDefect);
  
  // PUT - Update status
  router.put('/inspection-defect/:id/status', validationAPI, InspectionDefect.updateInspectionDefectStatus);
}

/**
 * Travel Request Router
 * Register all routes for Travel Request
 */
const TravelRequestRouter = (router) => {
  // | \ Travel Request Routers
  
  // POST - Create new travel request (submit final)
  router.post('/travel-request', validationAPI, TravelRequest.postTravelRequest);
  
  // POST - Save draft
  router.post('/travel-request/draft', validationAPI, TravelRequest.saveTravelRequestDraft);
  
  // GET - Get draft
  router.get('/travel-request/draft', validationAPI, TravelRequest.getTravelRequestDraft);
  
  // GET - Get new form (MUST BE BEFORE /:id route)
  router.get('/travel-request/new', validationAPI, TravelRequest.getTravelRequestNew);
  
  // GET - Get list (MUST BE BEFORE /:id route)
  router.get('/travel-request', validationAPI, TravelRequest.getTravelRequestList);
  
  // GET - Get by ID (MUST BE AFTER specific routes)
  router.get('/travel-request/:id', validationAPI, TravelRequest.getTravelRequest);
  
  // PUT - Update travel request
  router.put('/travel-request/:id', validationAPI, TravelRequest.updateTravelRequest);
  
  // PUT - Update status
  router.put('/travel-request/:id/status', validationAPI, TravelRequest.updateTravelRequestStatus);
}

/**
 * Workforce Request Router
 * Register all routes for Workforce Request
 */
const WorkforceRequestRouter = (router) => {
  // | \ Workforce Request Routers
  
  // POST - Create new workforce request (submit final)
  router.post('/workforce-request', validationAPI, WorkforceRequest.postWorkforceRequest);
  
  // POST - Save draft
  router.post('/workforce-request/draft', validationAPI, WorkforceRequest.saveWorkforceRequestDraft);
  
  // GET - Get draft
  router.get('/workforce-request/draft', validationAPI, WorkforceRequest.getWorkforceRequestDraft);
  
  // GET - Get new form (MUST BE BEFORE /:id route)
  router.get('/workforce-request/new', validationAPI, WorkforceRequest.getWorkforceRequestNew);
  
  // GET - Get list (MUST BE BEFORE /:id route)
  router.get('/workforce-request', validationAPI, WorkforceRequest.getWorkforceRequestList);
  
  // GET - Get by ID (MUST BE AFTER specific routes)
  router.get('/workforce-request/:id', validationAPI, WorkforceRequest.getWorkforceRequest);
  
  // PUT - Update workforce request
  router.put('/workforce-request/:id', validationAPI, WorkforceRequest.updateWorkforceRequest);
  
  // PUT - Update status
  router.put('/workforce-request/:id/status', validationAPI, WorkforceRequest.updateWorkforceRequestStatus);
}

/**
 * Asset Request Router
 * Register all routes for Asset Request
 */
const AssetRequestRouter = (router) => {
  // | \ Asset Request Routers
  
  // POST - Create new asset request (submit final)
  router.post('/asset-request', validationAPI, AssetRequest.postAssetRequest);
  
  // POST - Save draft
  router.post('/asset-request/draft', validationAPI, AssetRequest.saveAssetRequestDraft);
  
  // GET - Get draft
  router.get('/asset-request/draft', validationAPI, AssetRequest.getAssetRequestDraft);
  
  // GET - Get new form (MUST BE BEFORE /:id route)
  router.get('/asset-request/new', validationAPI, AssetRequest.getAssetRequestNew);
  
  // GET - Get list (MUST BE BEFORE /:id route)
  router.get('/asset-request', validationAPI, AssetRequest.getAssetRequestList);
  
  // GET - Get by ID (MUST BE AFTER specific routes)
  router.get('/asset-request/:id', validationAPI, AssetRequest.getAssetRequest);
  
  // PUT - Update asset request
  router.put('/asset-request/:id', validationAPI, AssetRequest.updateAssetRequest);
  
  // PUT - Update status
  router.put('/asset-request/:id/status', validationAPI, AssetRequest.updateAssetRequestStatus);
}

/**
 * Cash Request Router
 * Register all routes for Cash Request
 */
const CashRequestRouter = (router) => {
  // | \ Cash Request Routers
  
  // POST - Create new cash request (submit final)
  router.post('/cash-request', validationAPI, CashRequest.postCashRequest);
  
  // POST - Save draft
  router.post('/cash-request/draft', validationAPI, CashRequest.saveCashRequestDraft);
  
  // GET - Get draft
  router.get('/cash-request/draft', validationAPI, CashRequest.getCashRequestDraft);
  
  // GET - Get new form (MUST BE BEFORE /:id route)
  router.get('/cash-request/new', validationAPI, CashRequest.getCashRequestNew);
  
  // GET - Get list (MUST BE BEFORE /:id route)
  router.get('/cash-request', validationAPI, CashRequest.getCashRequestList);
  
  // GET - Get by ID (MUST BE AFTER specific routes)
  router.get('/cash-request/:id', validationAPI, CashRequest.getCashRequest);
  
  // PUT - Update cash request
  router.put('/cash-request/:id', validationAPI, CashRequest.updateCashRequest);
  
  // PUT - Update status
  router.put('/cash-request/:id/status', validationAPI, CashRequest.updateCashRequestStatus);
}

/**
 * Accommodation Request Router
 * Register all routes for Accommodation Request
 */
const AccommodationRequestRouter = (router) => {
  // | \ Accommodation Request Routers
  
  // POST - Create new accommodation request (submit final)
  router.post('/accommodation-request', validationAPI, AccommodationRequest.postAccommodationRequest);
  
  // POST - Save draft
  router.post('/accommodation-request/draft', validationAPI, AccommodationRequest.saveAccommodationRequestDraft);
  
  // GET - Get draft
  router.get('/accommodation-request/draft', validationAPI, AccommodationRequest.getAccommodationRequestDraft);
  
  // GET - Get new form (MUST BE BEFORE /:id route)
  router.get('/accommodation-request/new', validationAPI, AccommodationRequest.getAccommodationRequestNew);
  
  // GET - Get list (MUST BE BEFORE /:id route)
  router.get('/accommodation-request', validationAPI, AccommodationRequest.getAccommodationRequestList);
  
  // GET - Get by ID (MUST BE AFTER specific routes)
  router.get('/accommodation-request/:id', validationAPI, AccommodationRequest.getAccommodationRequest);
  
  // PUT - Update accommodation request
  router.put('/accommodation-request/:id', validationAPI, AccommodationRequest.updateAccommodationRequest);
  
  // PUT - Update status
  router.put('/accommodation-request/:id/status', validationAPI, AccommodationRequest.updateAccommodationRequestStatus);
}

/**
 * Transport Request Router
 * Register all routes for Transport Request
 */
const TransportRequestRouter = (router) => {
  // | \ Transport Request Routers
  
  // POST - Create new transport request (submit final)
  router.post('/transport-request', validationAPI, TransportRequest.postTransportRequest);
  
  // POST - Save draft
  router.post('/transport-request/draft', validationAPI, TransportRequest.saveTransportRequestDraft);
  
  // GET - Get draft
  router.get('/transport-request/draft', validationAPI, TransportRequest.getTransportRequestDraft);
  
  // GET - Get new form (MUST BE BEFORE /:id route)
  router.get('/transport-request/new', validationAPI, TransportRequest.getTransportRequestNew);
  
  // GET - Get list (MUST BE BEFORE /:id route)
  router.get('/transport-request', validationAPI, TransportRequest.getTransportRequestList);
  
  // GET - Get by ID (MUST BE AFTER specific routes)
  router.get('/transport-request/:id', validationAPI, TransportRequest.getTransportRequest);
  
  // PUT - Update transport request
  router.put('/transport-request/:id', validationAPI, TransportRequest.updateTransportRequest);
  
  // PUT - Update status
  router.put('/transport-request/:id/status', validationAPI, TransportRequest.updateTransportRequestStatus);
}

/**
 * Visitor Request Router
 * Register all routes for Visitor Request
 */
const VisitorRequestRouter = (router) => {
  // | \ Visitor Request Routers
  
  // POST - Create new visitor request (submit final)
  router.post('/visitor-request', validationAPI, VisitorRequest.postVisitorRequest);
  
  // POST - Save draft
  router.post('/visitor-request/draft', validationAPI, VisitorRequest.saveVisitorRequestDraft);
  
  // GET - Get draft
  router.get('/visitor-request/draft', validationAPI, VisitorRequest.getVisitorRequestDraft);
  
  // GET - Get new form (MUST BE BEFORE /:id route)
  router.get('/visitor-request/new', validationAPI, VisitorRequest.getVisitorRequestNew);
  
  // GET - Get list (MUST BE BEFORE /:id route)
  router.get('/visitor-request', validationAPI, VisitorRequest.getVisitorRequestList);
  
  // GET - Get by ID (MUST BE AFTER specific routes)
  router.get('/visitor-request/:id', validationAPI, VisitorRequest.getVisitorRequest);
  
  // PUT - Update visitor request
  router.put('/visitor-request/:id', validationAPI, VisitorRequest.updateVisitorRequest);
  
  // PUT - Update status
  router.put('/visitor-request/:id/status', validationAPI, VisitorRequest.updateVisitorRequestStatus);
}

/**
 * Purchase Requisition Router
 * Register all routes for Purchase Requisition
 */
const PurchaseRequisitionRouter = (router) => {
  // | \ Purchase Requisition Routers
  
  // POST - Create new purchase requisition (submit final)
  router.post('/purchase-requisition', validationAPI, PurchaseRequisition.postPurchaseRequisition);
  
  // POST - Save draft
  router.post('/purchase-requisition/draft', validationAPI, PurchaseRequisition.savePurchaseRequisitionDraft);
  
  // GET - Get draft
  router.get('/purchase-requisition/draft', validationAPI, PurchaseRequisition.getPurchaseRequisitionDraft);
  
  // GET - Get new form (MUST BE BEFORE /:id route)
  router.get('/purchase-requisition/new', validationAPI, PurchaseRequisition.getPurchaseRequisitionNew);
  
  // GET - Get list (MUST BE BEFORE /:id route)
  router.get('/purchase-requisition', validationAPI, PurchaseRequisition.getPurchaseRequisitionList);
  
  // GET - Get by ID (MUST BE AFTER specific routes)
  router.get('/purchase-requisition/:id', validationAPI, PurchaseRequisition.getPurchaseRequisition);
  
  // PUT - Update purchase requisition
  router.put('/purchase-requisition/:id', validationAPI, PurchaseRequisition.updatePurchaseRequisition);
  
  // PUT - Update status
  router.put('/purchase-requisition/:id/status', validationAPI, PurchaseRequisition.updatePurchaseRequisitionStatus);
}

const index = (router) => {
  router.get(
    '/online-service/employees/search',
    validationAPI,
    OnlineServiceEmployee.searchActiveEmployees
  );

  JobRequestRouter(router);
  FleetRequestRouter(router);
  TrainingRequestRouter(router);
  InspectionDefectRouter(router);
  TravelRequestRouter(router);
  WorkforceRequestRouter(router);
  AssetRequestRouter(router);
  CashRequestRouter(router);
  AccommodationRequestRouter(router);
  TransportRequestRouter(router);
  VisitorRequestRouter(router);
  PurchaseRequisitionRouter(router);
}

module.exports = index;

