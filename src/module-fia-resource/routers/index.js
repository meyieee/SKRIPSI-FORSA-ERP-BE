const ApprovalController = require("../controllers/ApprovalController");
const RequestsController = require("../controllers/RequestsController");
const OnlineRequestFeedsController = require("../controllers/OnlineRequestFeedsController");
const OnlineTaskFeedsController = require("../controllers/OnlineTaskFeedsController");
const TaskMessagesController = require("../controllers/TaskMessagesController");
const RosterNotesController = require("../controllers/RosterNotesController");
const TasksController = require("../controllers/TasksController");
const PersonalInfoController = require("../controllers/PersonalInfoController");
const { uploadMultiplefile } = require("../../middlewares/multer");

const validationAPI = require("../../middlewares/validationAPI");

// ========== APPROVAL =========
const ApprovalRouter = (router) => {
  router.get(
    "/fia-resource/approvals",
    validationAPI,
    ApprovalController.getCurrentApprovals
  );

  router.get(
    "/fia-resource/approvals/history",
    validationAPI,
    ApprovalController.getApprovalHistory
  );

  router.post(
    "/fia-resource/approvals/actions",
    validationAPI,
    ApprovalController.updateApprovalStatus
  );
};

// ========== REQUESTS ==========
const RequestsRouter = (router) => {
  router.get(
    "/fia-resource/requests",
    validationAPI,
    RequestsController.getMyRequests
  );

  router.get(
    "/fia-resource/requests/:refDocNo/history",
    validationAPI,
    RequestsController.getRequestHistory
  );

  router.get(
    "/fia-resource/requests/:refDocNo/detail",
    validationAPI,
    RequestsController.getRequestDetail
  );

  // Global online request history (UC10 Command Feeds)
  router.get(
    "/fia-home/command/feeds/online-request",
    validationAPI,
    OnlineRequestFeedsController.getGlobalOnlineRequestHistory
  );

  router.get(
    "/fia-home/command/feeds/online-request/:refDocNo/detail",
    validationAPI,
    OnlineRequestFeedsController.getGlobalOnlineRequestDetail
  );
};

// ========== TASKS ==========
const TasksRouter = (router) => {
  router.get(
    "/fia-resource/tasks/capabilities",
    validationAPI,
    TasksController.getTaskCapabilities
  );

  router.get("/fia-resource/tasks", validationAPI, TasksController.getMyTasks);

  router.get(
    "/fia-resource/tasks/assigned",
    validationAPI,
    TasksController.getAssignedTasks
  );

  router.get(
    "/fia-resource/tasks/assignees",
    validationAPI,
    TasksController.searchAssignees
  );

  router.post("/fia-resource/tasks", validationAPI, TasksController.createTask);

  router.patch(
    "/fia-resource/tasks/:taskId/status",
    validationAPI,
    TasksController.updateTaskStatus
  );

  // Global online tasks history (UC11 Command Feeds)
  router.get(
    "/fia-home/command/feeds/online-tasks",
    validationAPI,
    OnlineTaskFeedsController.getGlobalOnlineTasks
  );

  router.get(
    "/fia-home/command/feeds/online-tasks/:taskId/detail",
    validationAPI,
    OnlineTaskFeedsController.getGlobalOnlineTaskDetail
  );
};

// ========== TASK MESSAGES (CHAT) ==========
const TaskMessagesRouter = (router) => {
  router.get(
    "/fia-resource/tasks/:taskId/messages",
    validationAPI,
    TaskMessagesController.getMessagesByTask
  );

  router.post(
    "/fia-resource/tasks/:taskId/messages",
    validationAPI,
    uploadMultiplefile,
    TaskMessagesController.createMessage
  );

  router.delete(
    "/fia-resource/tasks/:taskId/messages/:messageId",
    validationAPI,
    TaskMessagesController.deleteMessage
  );
};

// ========== ROSTER NOTES ==========
const RosterRouter = (router) => {
  router.get(
    "/fia-resource/roster",
    validationAPI,
    RosterNotesController.getMonthlyRoster
  );

  router.post(
    "/fia-resource/roster",
    validationAPI,
    RosterNotesController.createNote
  );

  router.put(
    "/fia-resource/roster/:id",
    validationAPI,
    RosterNotesController.updateNote
  );

  router.delete(
    "/fia-resource/roster/:id",
    validationAPI,
    RosterNotesController.deleteNote
  );
};

// ========== PERSONAL INFO ==========
const PersonalInfoRouter = (router) => {
  router.get(
    "/fia-resource/personal-info/capabilities",
    validationAPI,
    PersonalInfoController.getSearchCapability
  );

  router.get(
    "/fia-resource/personal-info/search",
    validationAPI,
    PersonalInfoController.searchEmployees
  );

  router.get(
    "/fia-resource/personal-info/:idNumber",
    validationAPI,
    PersonalInfoController.getPersonalInfo
  );
};

// ========== REGISTER SEMUA ROUTES ==========
const index = (router) => {
  ApprovalRouter(router);
  RequestsRouter(router);
  TasksRouter(router);
  TaskMessagesRouter(router);
  RosterRouter(router);
  PersonalInfoRouter(router);
};

module.exports = index;
