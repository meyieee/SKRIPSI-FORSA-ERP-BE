const UserController = require('../controllers/UserController');

const ComController = require('../controllers/ComController')
const ComContactController = require('../controllers/ComContactController')
const ComDocumentController = require('../controllers/ComDocumentController')
const ComPictureController = require('../controllers/ComPictureController')
const ComContractController = require('../controllers/ComContractController')

const DepartmentController = require('../controllers/DepartmentController')
const SectionController = require('../controllers/SectionController')
const BusinessUnitController = require('../controllers/BusinessUnitController')
const DivisionController = require('../controllers/DivisionController');
const CostCenterController = require('../controllers/CostCenterController')
const AccountController = require('../controllers/AccountController')
const CurrencyController = require('../controllers/CurrencyController')
const LocationController = require('../controllers/LocationController')
const LocWorkController = require('../controllers/LocWorkController')
const LocOpsController = require('../controllers/LocOpsController')
const PriorityController = require('../controllers/PriorityController')
const ColourController = require('../controllers/ColourController')
const OfficerController = require('../controllers/OfficerController')
const OfficerTypeController = require('../controllers/OfficerTypeController');

const validationAPI = require('../../middlewares/validationAPI')
const { uploadSingleImage, uploadMultipleDocuments, uploadMultipleImage, uploadSingleDocument } = require('../../middlewares/multer');
const { checkPermissionByRoute, checkAnyPermissionByRoute } = require('../../middlewares/rbac');
const COM_TYPE  = require('../../constants')

const UserRouter = (router) =>{
    // | Users Routers
    router.post('/users/login', UserController.login);
    router.get('/users/dummy', validationAPI, UserController.dummy);
    router.post('/users/specific', validationAPI,UserController.spesificUser); // ini endpoint untuk refresh token
    router.post('/users/logout', validationAPI, UserController.logout);
    router.get('/users/session/:name', validationAPI, UserController.session);
    router.get('/users', validationAPI, UserController.getUsers);
    router.get('/users/role-categories', validationAPI, UserController.getRoleCategories);
    router.get('/user/:id', validationAPI, UserController.getUserById);
    router.get('/users/check-existing-admin', UserController.checkExistingAdmin);
    router.get('/users/:branch_code', validationAPI, UserController.getUsersPerBranch);
    router.post('/users', validationAPI, UserController.postUser);
    router.post('/users/registration', UserController.registrationFirstUser); // registrasi pertama user dari 0
    router.put('/users/:id', validationAPI, UserController.updateUser);
    router.put('/users', validationAPI, UserController.updatePasswordUser);
    router.put('/users/password/:id_number', validationAPI, UserController.resetPasswordUser);
    router.put('/users/:id/status', validationAPI, UserController.updateStatusUser);
    
    // | Users V1 Routers
    router.get('/v1/roles', validationAPI, UserController.getRolesV1);
    router.post('/v1/users/create', validationAPI, checkPermissionByRoute('/controls/create-user', 'Create'), UserController.postCreateUserV1);
    
    // ============================================
    // RBAC Test Endpoints
    // ============================================
    
    // Test endpoint: Read permission untuk /home/overview
    router.get('/test-rbac/overview/read', 
      validationAPI, 
      checkPermissionByRoute('/home/overview', 'Read'),
      (req, res) => {
        res.json({ 
          message: 'Access granted', 
          user: req.user,
          route: '/home/overview',
          privilege: 'Read',
          roleId: req.user.roleId || req.user.role_id
        });
      }
    );
    
    // Test endpoint: Create permission untuk /home/company_list
    router.get('/test-rbac/company-list/create', 
      validationAPI, 
      checkPermissionByRoute('/home/company_list', 'Create'),
      (req, res) => {
        res.json({ 
          message: 'Access granted', 
          user: req.user,
          route: '/home/company_list',
          privilege: 'Create',
          roleId: req.user.roleId || req.user.role_id
        });
      }
    );
    
    // Test endpoint: Update permission untuk /home/overview
    router.get('/test-rbac/overview/update', 
      validationAPI, 
      checkPermissionByRoute('/home/overview', 'Update'),
      (req, res) => {
        res.json({ 
          message: 'Access granted', 
          user: req.user,
          route: '/home/overview',
          privilege: 'Update',
          roleId: req.user.roleId || req.user.role_id
        });
      }
    );
    
    // Test endpoint: Delete permission
    router.get('/test-rbac/overview/delete', 
      validationAPI, 
      checkPermissionByRoute('/home/overview', 'Delete'),
      (req, res) => {
        res.json({ 
          message: 'Access granted', 
          user: req.user,
          route: '/home/overview',
          privilege: 'Delete',
          roleId: req.user.roleId || req.user.role_id
        });
      }
    );
    
    // Test endpoint: UpdateA permission
    router.get('/test-rbac/overview/updatea', 
      validationAPI, 
      checkPermissionByRoute('/home/overview', 'UpdateA'),
      (req, res) => {
        res.json({ 
          message: 'Access granted', 
          user: req.user,
          route: '/home/overview',
          privilege: 'UpdateA',
          roleId: req.user.roleId || req.user.role_id
        });
      }
    );
    
    // Test endpoint: Multiple permissions (OR logic) - user hanya perlu salah satu
    router.get('/test-rbac/overview/any', 
      validationAPI, 
      checkAnyPermissionByRoute('/home/overview', ['Read', 'Create', 'Update']),
      (req, res) => {
        res.json({ 
          message: 'Access granted', 
          user: req.user,
          route: '/home/overview',
          privileges: ['Read', 'Create', 'Update'],
          roleId: req.user.roleId || req.user.role_id
        });
      }
    );
    
    // Test endpoint: Route yang tidak ada permission
    router.get('/test-rbac/nonexistent-route/read', 
      validationAPI, 
      checkPermissionByRoute('/nonexistent-route', 'Read'),
      (req, res) => {
        res.json({ 
          message: 'Access granted', 
          user: req.user,
          route: '/nonexistent-route',
          privilege: 'Read',
          roleId: req.user.roleId || req.user.role_id
        });
      }
    );
}

const CompanyProfileRouter = (router) =>{
    router.post('/companyprofile', validationAPI, uploadSingleImage, ComController.postCom); // post com
    router.put('/companyprofile/:id', validationAPI, uploadSingleImage, ComController.updateCom); // edit com
    router.get('/companyprofile', validationAPI, ComController.getHOProfile); // get com
    router.get('/allactivecoms', validationAPI, ComController.getAllActiveComs); // get com
} 

const CompanyProfileContactRouter = (router) =>{
    router.post('/companyprofile/contact', validationAPI, uploadSingleImage,(req, res, next) => {
        req.com_type = COM_TYPE.company
        ComContactController.postComContact(req, res, next)
   }); // post contact
   router.put('/companyprofile/:comcode/:id/contact', validationAPI, uploadSingleImage,(req, res, next) => {
       req.com_type = COM_TYPE.company
       ComContactController.updateComContact(req, res, next)
   }); // update contact
   router.put('/companyprofile/:comcode/:id/contact/status',(req, res, next) => {
       req.com_type = COM_TYPE.company
       ComContactController.updateStatusComContact(req, res, next)
   }); // update status contact
   router.get('/companyprofile/:comcode/contacts', validationAPI,(req, res, next) => {
       req.com_type = COM_TYPE.company
       ComContactController.getAllComContacts(req, res, next)
   }); // get contacts
   router.get('/companyprofile/:comcode/:id/contact', validationAPI,(req, res, next) => {
       req.com_type = COM_TYPE.company
       ComContactController.getComContact(req, res, next)
   }); // get contact
}

const CompanyProfileDocumentRouter = (router) =>{
    router.post('/companyprofile/document', validationAPI, uploadSingleDocument, (req, res, next) => {
        req.com_type = COM_TYPE.company
        ComDocumentController.postComDocument(req, res, next)
    }); // post document
    router.put('/companyprofile/:comcode/:id/document', validationAPI, uploadSingleDocument, (req, res, next) => {
        req.com_type = COM_TYPE.company
        ComDocumentController.updateComDocument(req, res, next)
    }); // update document
    router.put('/companyprofile/:comcode/:id/document/status', validationAPI, (req, res, next) => {
        req.com_type = COM_TYPE.company
        ComDocumentController.updateStatusComDocument(req, res, next)
    }); // update status document
    router.get('/companyprofile/:comcode/documents', validationAPI,(req, res, next) => {
        req.com_type = COM_TYPE.company
        ComDocumentController.getAllComDocuments(req, res, next)
    }); // get documents
    router.get('/companyprofile/:comcode/:id/document', validationAPI,(req, res, next) => {
        req.com_type = COM_TYPE.company
        ComDocumentController.getComDocument(req, res, next)
    }); // get document
}

const CompanyProfileContractRouter = (router) =>{
    router.post('/companyprofile/contract', validationAPI, uploadMultipleDocuments, (req, res, next) => {
        req.com_type = COM_TYPE.company
        ComContractController.postComContract(req, res, next)
    }); // post contract
    router.put('/companyprofile/:comcode/:id/contract', validationAPI,uploadMultipleDocuments, (req, res, next) => {
        req.com_type = COM_TYPE.company
        ComContractController.updateComContract(req, res, next)
    }); // update contract
    router.put('/companyprofile/:comcode/:id/contract/status', validationAPI, (req, res, next) => {
        req.com_type = COM_TYPE.company
        ComContractController.updateStatusComContract(req, res, next)
    }); // update status contract
    router.get('/companyprofile/:comcode/contracts', validationAPI, (req, res, next) => {
        req.com_type = COM_TYPE.company
        ComContractController.getAllComContracts(req, res, next)
    }); // get contracts
    router.get('/companyprofile/:comcode/:id/contract', validationAPI, (req, res, next) => {
        req.com_type = COM_TYPE.company
        ComContractController.getComContract(req, res, next)
    }); // get contract
}

const CompanyProfilePictureRouter = (router) =>{
    router.post('/companyprofile/picture', validationAPI, uploadSingleImage, (req, res, next) => {
        req.com_type = COM_TYPE.company
        ComPictureController.postComPicture(req, res, next)
    }); // post picture
    router.put('/companyprofile/:comcode/:id/picture', validationAPI, uploadSingleImage, (req, res, next) => {
        req.com_type = COM_TYPE.company
        ComPictureController.updateComPicture(req, res, next)
    }); // update picture
    router.put('/companyprofile/:comcode/:id/picture/status', validationAPI, (req, res, next) => {
        req.com_type = COM_TYPE.company
        ComPictureController.updateStatusComPicture(req, res, next)
    }); // update status picture
    router.get('/companyprofile/:comcode/pictures', validationAPI, (req, res, next) => {
        req.com_type = COM_TYPE.company
        ComPictureController.getAllComPictures(req, res, next)
    }); // get pictures
    router.get('/companyprofile/:comcode/:id/picture', validationAPI, (req, res, next) => {
        req.com_type = COM_TYPE.company
        ComPictureController.getComPicture(req, res, next)
    }); // get picture
}

const DepartmentRouter = (router)=>{
    router.post('/department', validationAPI, DepartmentController.postDepartment); // post Department
    router.post('/departmentbatch', validationAPI, DepartmentController.postBatchDepartment); // batch post Department
    router.put('/department/:id', validationAPI, DepartmentController.updateDepartment); // edit Department by id
    router.put('/department/:id/status', validationAPI,DepartmentController.updateStatusDepartment); // edit Department by id
    router.get('/departments', validationAPI, DepartmentController.getAllDepartment); // get all Department
    router.get('/department/:id', validationAPI, DepartmentController.getDepartment); // get Department
    router.get('/departmentbycode/:code', validationAPI, DepartmentController.getDepartmentByCode); // get Department by code
    
}

const SectionRouter = (router)=>{
    router.get('/sections', validationAPI, SectionController.getAllSection); // get all Section
}

const BusinessUnitRouter = (router) =>{
    router.post('/businessunit', validationAPI, BusinessUnitController.postBusinessUnit); // post BusinessUnit
    router.post('/businessunitbatch', validationAPI, BusinessUnitController.postBatchBusinessUnit); // batch post BusinessUnit
    router.put('/businessunit/:id', validationAPI,BusinessUnitController.updateBusinessUnit); // edit BusinessUnit by id
    router.put('/businessunit/:id/status', validationAPI, BusinessUnitController.updateStatusBusinessUnit); // edit BusinessUnit by id
    router.get('/businessunit', validationAPI, BusinessUnitController.getAllBusinessUnit); // get all BusinessUnit
    router.get('/businessunit/:id', validationAPI, BusinessUnitController.getBusinessUnit); // get all BusinessUnit
}

const DivisionRouter = (router)=>{
    router.post('/division', validationAPI, DivisionController.postDivision); // post Division
    router.post('/divisionbatch', validationAPI, DivisionController.postBatchDivision); // batch post Division
    router.put('/division/:id', validationAPI, DivisionController.updateDivision); // edit Division by id
    router.put('/division/:id/status', validationAPI, DivisionController.updateStatusDivision); // edit Division by id
    router.get('/division', validationAPI, DivisionController.getAllDivision); // get all Division
    router.get('/division/:id', validationAPI, DivisionController.getDivision); // get all Division
}

const CostCenterRouter = (router)=>{
    router.post('/costcenter', validationAPI, CostCenterController.postCostCenter); // post CostCenter
    router.post('/costcenterbatch', validationAPI, CostCenterController.postBatchCostCenter); // batch post CostCenter
    router.put('/costcenter/:id', validationAPI, CostCenterController.updateCostCenter); // edit CostCenter by id
    router.put('/costcenter/:id/status', validationAPI, CostCenterController.updateStatusCostCenter); // edit CostCenter by id
    router.get('/costcenter', validationAPI, CostCenterController.getAllCostCenter); // get all CostCenter
    router.get('/costcenter/:id', validationAPI, CostCenterController.getCostCenter); // get all CostCenter
}

const AccountRouter = (router)=>{
    router.post('/account', validationAPI, AccountController.postAccount); // post Account
    router.post('/accountbatch', validationAPI, AccountController.postBatchAccount); // batch post Account
    router.put('/account/:id', validationAPI, AccountController.updateAccount); // edit Account by id
    router.put('/account/:id/status', validationAPI, AccountController.updateStatusAccount); // edit Account by id
    router.get('/accounts', validationAPI, AccountController.getAllAccount); // get all Account
    router.get('/account/:id', validationAPI, AccountController.getAccount); // get all Account
}

const CurrencyRouter = (router)=>{
    router.post('/currency', validationAPI, CurrencyController.postCurrency); // post Currency
    router.post('/currencybatch', validationAPI, CurrencyController.postBatchCurrency); // batch post Currency
    router.put('/currency/:id', validationAPI, CurrencyController.updateCurrency); // edit Currency by id
    router.put('/currency/:id/status', validationAPI, CurrencyController.updateStatusCurrency); // edit Currency by id
    router.get('/currency', validationAPI, CurrencyController.getAllCurrency); // get all Currency
    router.get('/currency/:id', validationAPI, CurrencyController.getCurrency); // get Currency by id
}

const LocationRouter = (router)=>{
    router.post('/location', validationAPI, LocationController.postLocation); // post Location
    router.post('/locationbatch', validationAPI, LocationController.postBatchLocation); // batch post Location
    router.put('/location/:id', validationAPI, LocationController.updateLocation); // edit Location by id
    router.put('/location/:id/status', validationAPI, LocationController.updateStatusLocation); // edit Location by id
    router.get('/location', validationAPI, LocationController.getAllLocation); // get all Location
    router.get('/location/:id', validationAPI, LocationController.getLocation); // get Location by id
}

const LocationWorkRouter = (router)=>{
    router.post('/locwork', validationAPI, LocWorkController.postLocWork); // post LocWork
    router.post('/locworkbatch', validationAPI, LocWorkController.postBatchLocWork); // batch post LocWork
    router.put('/locwork/:id', validationAPI, LocWorkController.updateLocWork); // edit LocWork by id
    router.put('/locwork/:id/status', validationAPI, LocWorkController.updateStatusLocWork); // edit LocWork by id
    router.get('/locwork', validationAPI, LocWorkController.getAllLocWork); // get all LocWork
    router.get('/locwork/:id', validationAPI, LocWorkController.getLocWork); // get LocWork by id
}

const LocationOperationsRouter = (router)=>{
    router.post('/locops', validationAPI, LocOpsController.postLocOps); // post LocOps
    router.post('/locopsbatch', validationAPI, LocOpsController.postBatchLocOps); // batch post LocOps
    router.put('/locops/:id', validationAPI, LocOpsController.updateLocOps); // edit LocOps by id
    router.put('/locops/:id/status', validationAPI, LocOpsController.updateStatusLocOps); // edit LocOps by id
    router.get('/locops', validationAPI, LocOpsController.getAllLocOps); // get all LocOps
    router.get('/locops/:id', validationAPI, LocOpsController.getLocOps); // get LocOps by id
}

const PriorityRouter = (router)=>{
    router.post('/priority', validationAPI, PriorityController.postPriority); // post Priority
    router.post('/prioritybatch', validationAPI, PriorityController.postBatchPriority); // batch post Priority
    router.put('/priority/:id', validationAPI, PriorityController.updatePriority); // edit Priority by id
    router.put('/priority/:id/status', validationAPI, PriorityController.updateStatusPriority); // edit Priority by id
    router.get('/priority', validationAPI, PriorityController.getAllPriority); // get all Priority
    router.get('/priority/:id', validationAPI, PriorityController.getPriority); // get Priority by id
    router.get('/prioritybycode/:code', validationAPI, PriorityController.getPriorityByCode); // get Priority by code
}

const ColourRouter = (router)=>{
    router.post('/colour', validationAPI, ColourController.postColour); // post Colour
    router.post('/colourbatch', validationAPI, ColourController.postBatchColour); // batch post Colour
    router.put('/colour/:id', validationAPI, ColourController.updateColour); // edit Colour by id
    router.put('/colour/:id/status', validationAPI, ColourController.updateStatusColour); // edit Colour by id
    router.get('/colour', validationAPI, ColourController.getAllColour); // get all Colour
}

const OfficerRouter = (router)=>{
    router.post('/officer', validationAPI, uploadSingleImage, OfficerController.postOfficer); // post Officer
    router.post('/officerbatch', validationAPI, uploadSingleImage, OfficerController.postBatchOfficer); // batch post Officer
    router.put('/officer/:id', validationAPI, uploadSingleImage, OfficerController.updateOfficer); // edit Officer by id
    router.put('/officer/:id/status', validationAPI, OfficerController.updateStatusOfficer); // edit Officer by id
    router.get('/officers', validationAPI, OfficerController.getAllOfficer); // get all Officer
    router.get('/officer/:id', validationAPI, OfficerController.getOfficer); // get all Officer
}

const OfficerTypeRouter = (router)=>{
    router.post('/officertype', validationAPI, OfficerTypeController.postOfficerType); // post Officer type
    router.post('/officertypebatch', validationAPI, OfficerTypeController.postBatchOfficerType); // batch post Officer type
    router.put('/officertype/:id', validationAPI, OfficerTypeController.updateOfficerType); // edit Officer type by id
    router.put('/officertype/:id/status', validationAPI, OfficerTypeController.updateStatusOfficerType); // edit Officer type by id
    router.get('/officertype', validationAPI, OfficerTypeController.getAllOfficerType); // get all Officer type
}

const BranchProfileRouter = (router) =>{
    router.post('/branchprofile', validationAPI, uploadSingleImage, ComController.postCom); // post com
    router.post('/branchprofilebatch', validationAPI, ComController.postBatchCom); // post coms
    router.put('/branchprofile/:id', validationAPI, uploadSingleImage, ComController.updateCom); // edit com
    router.put('/branchprofile/status/:id', validationAPI, (req, res, next) => {
        req.com_type = COM_TYPE.branch
        ComController.updateStatusCom(req, res, next)
    }); // edit status com
    router.get('/branchprofile/:id', validationAPI, (req, res, next) => {
        req.com_type = COM_TYPE.branch
        ComController.getCom(req, res, next)
    }); // get com
    router.get('/branchprofilebycode/:code', validationAPI, (req, res, next) => {
        req.com_type = COM_TYPE.branch
        ComController.getComByCode(req, res, next)
    }); // get com by code
    router.get('/branchprofiles/', validationAPI, (req, res, next) => {
        req.com_type = COM_TYPE.branch
        ComController.getAllComs(req, res, next)
    }); // get coms
    router.get('/hoandbranchprofiles/', validationAPI, ComController.getHoAndbranches); // get HO and Branches 
} 

const BranchProfileContactRouter = (router) =>{
    router.post('/branchprofile/contacts', validationAPI, uploadMultipleImage, (req, res, next) => {
        req.com_type = COM_TYPE.branch
        ComContactController.postComContacts(req, res, next)
    }); // post contact
    router.post('/branchprofile/contact', validationAPI, uploadSingleImage, (req, res, next) => {
        req.com_type = COM_TYPE.branch
        ComContactController.postComContact(req, res, next)
    }); // post contacts
    router.put('/branchprofile/:comcode/:id/contact', validationAPI, uploadSingleImage, (req, res, next) => {
        req.com_type = COM_TYPE.branch
        ComContactController.updateComContact(req, res, next)
    }); // update contact
    router.put('/branchprofile/:comcode/:id/contact/status', validationAPI,(req, res, next) => {
        req.com_type = COM_TYPE.branch
        ComContactController.updateStatusComContact(req, res, next)
    }); // update status contact
    router.get('/branchprofile/:comcode/contacts', validationAPI,(req, res, next) => {
        req.com_type = COM_TYPE.branch
        ComContactController.getAllComContacts(req, res, next)
    }); // get contacts
    router.get('/branchprofile/:comcode/:id/contact', validationAPI, (req, res, next) => {
        req.com_type = COM_TYPE.branch
        ComContactController.getComContact(req, res, next)
    }); // get contact
}

const BranchProfileDocumentRouter = (router) =>{
    router.post('/branchprofile/documents', validationAPI, uploadMultipleDocuments, (req, res, next) => {
        req.com_type = COM_TYPE.branch
        ComDocumentController.postComDocuments(req, res, next)
    }); // post documents
    router.post('/branchprofile/document', validationAPI, uploadSingleDocument, (req, res, next) => {
        req.com_type = COM_TYPE.branch
        ComDocumentController.postComDocument(req, res, next)
    }); // post document
    router.put('/branchprofile/:comcode/:id/document', validationAPI, uploadSingleDocument, (req, res, next) => {
        req.com_type = COM_TYPE.branch
        ComDocumentController.updateComDocument(req, res, next)
    }); // update document
    router.put('/branchprofile/:comcode/:id/document/status', validationAPI, (req, res, next) => {
        req.com_type = COM_TYPE.branch
        ComDocumentController.updateStatusComDocument(req, res, next)
    }); // update status document
    router.get('/branchprofile/:comcode/documents', validationAPI, (req, res, next) => {
        req.com_type = COM_TYPE.branch
        ComDocumentController.getAllComDocuments(req, res, next)
    }); // get documents
    router.get('/branchprofile/:comcode/:id/document', validationAPI, (req, res, next) => {
        req.com_type = COM_TYPE.branch
        ComDocumentController.getComDocument(req, res, next)
    }); // get document
}

const BranchProfileContractRouter = (router) =>{
    router.post('/branchprofile/contract', validationAPI, uploadMultipleDocuments, (req, res, next) => {
        req.com_type = COM_TYPE.branch
        ComContractController.postComContract(req, res, next)
    }); // post contract
    router.post('/branchprofile/contracts', validationAPI, uploadMultipleDocuments, (req, res, next) => {
        req.com_type = COM_TYPE.branch
        ComContractController.postComContracts(req, res, next)
    }); // post contracts
    router.put('/branchprofile/:comcode/:id/contract', validationAPI, uploadMultipleDocuments,(req, res, next) => {
        req.com_type = COM_TYPE.branch
        ComContractController.updateComContract(req, res, next)
    }); // update contract
    router.put('/branchprofile/:comcode/:id/contract/status', validationAPI, (req, res, next) => {
        req.com_type = COM_TYPE.branch
        ComContractController.updateStatusComContract(req, res, next)
    }); // update status contract
    router.get('/branchprofile/:comcode/contracts', validationAPI, (req, res, next) => {
        req.com_type = COM_TYPE.branch
        ComContractController.getAllComContracts(req, res, next)
    }); // get contracts
    router.get('/branchprofile/:comcode/:id/contract', validationAPI, (req, res, next) => {
        req.com_type = COM_TYPE.branch
        ComContractController.getComContract(req, res, next)
    }); // get contract
}

const BranchProfilePictureRouter = (router) =>{
    router.post('/branchprofile/pictures', validationAPI, uploadMultipleImage, (req, res, next) => {
        req.com_type = COM_TYPE.branch
        ComPictureController.postComPictures(req, res, next)
    }); // post pictures
    router.post('/branchprofile/picture', validationAPI, uploadSingleImage,(req, res, next) => {
        req.com_type = COM_TYPE.branch
        ComPictureController.postComPicture(req, res, next)
    }); // post picture
    router.put('/branchprofile/:comcode/:id/picture', validationAPI, uploadSingleImage, (req, res, next) => {
        req.com_type = COM_TYPE.branch
        ComPictureController.updateComPicture(req, res, next)
    }); // update picture
    router.put('/branchprofile/:comcode/:id/picture/status', validationAPI, (req, res, next) => {
        req.com_type = COM_TYPE.branch
        ComPictureController.updateStatusComPicture(req, res, next)
    }); // update status picture
    router.get('/branchprofile/:comcode/pictures', validationAPI, (req, res, next) => {
        req.com_type = COM_TYPE.branch
        ComPictureController.getAllComPictures(req, res, next)
    }); // get pictures
    router.get('/branchprofile/:comcode/:id/picture', validationAPI, (req, res, next) => {
        req.com_type = COM_TYPE.branch
        ComPictureController.getComPicture(req, res, next)
    }); // get picture
}

const ContractorProfileRouter = (router)=>{
    router.post('/contractorprofile', validationAPI, uploadSingleImage,  ComController.postCom); // post com
    router.post('/contractorprofilebatch', validationAPI, uploadSingleImage, ComController.postBatchCom); // post coms
    router.put('/contractorprofile/:id', validationAPI, uploadSingleImage, ComController.updateCom); // edit com
    router.put('/contractorprofile/status/:id', validationAPI, (req, res, next) => {
        req.com_type = COM_TYPE.contractor
        ComController.updateStatusCom(req, res, next)
    }); // edit status com
    router.get('/contractorprofile/:id', validationAPI, (req, res, next) => {
        req.com_type = COM_TYPE.contractor
        ComController.getCom(req, res, next)
    }); // get com
    router.get('/contractorprofiles/', validationAPI, (req, res, next) => {
        req.com_type = COM_TYPE.contractor
        ComController.getAllComs(req, res, next)
    }); // get coms
}

const ContractorProfileContactRouter = (router)=>{
    router.post('/contractorprofile/contacts', validationAPI, uploadMultipleImage,(req, res, next) => {
        req.com_type = COM_TYPE.contractor
        ComContactController.postComContacts(req, res, next)
    }); // post contacts
    router.post('/contractorprofile/contact', validationAPI, uploadSingleImage, (req, res, next) => {
        req.com_type = COM_TYPE.contractor
        ComContactController.postComContact(req, res, next)
    }); // post contact
    router.put('/contractorprofile/:comcode/:id/contact', validationAPI, uploadSingleImage,(req, res, next) => {
        req.com_type = COM_TYPE.contractor
        ComContactController.updateComContact(req, res, next)
    }); // update contact
    router.put('/contractorprofile/:comcode/:id/contact/status', validationAPI, (req, res, next) => {
        req.com_type = COM_TYPE.contractor
        ComContactController.updateStatusComContact(req, res, next)
    }); // update status contact
    router.get('/contractorprofile/:comcode/contacts', validationAPI, (req, res, next) => {
        req.com_type = COM_TYPE.contractor
        ComContactController.getAllComContacts(req, res, next)
    }); // get contacts
    router.get('/contractorprofile/:comcode/:id/contact', validationAPI,(req, res, next) => {
        req.com_type = COM_TYPE.contractor
        ComContactController.getComContact(req, res, next)
    }); // get contact
}

const ContractorProfileDocumentRouter = (router)=>{
    router.post('/contractorprofile/documents', validationAPI, uploadMultipleDocuments,(req, res, next) => {
        req.com_type = COM_TYPE.contractor
        ComDocumentController.postComDocuments(req, res, next)
    }); // post documents
    router.post('/contractorprofile/document', validationAPI, uploadSingleDocument, (req, res, next) => {
        req.com_type = COM_TYPE.contractor
        ComDocumentController.postComDocument(req, res, next)
    }); // post document
    router.put('/contractorprofile/:comcode/:id/document', validationAPI, uploadSingleDocument, (req, res, next) => {
        req.com_type = COM_TYPE.contractor
        ComDocumentController.updateComDocument(req, res, next)
    }); // update document
    router.put('/contractorprofile/:comcode/:id/document/status', validationAPI,(req, res, next) => {
        req.com_type = COM_TYPE.contractor
        ComDocumentController.updateStatusComDocument(req, res, next)
    }); // update status document
    router.get('/contractorprofile/:comcode/documents', validationAPI, (req, res, next) => {
        req.com_type = COM_TYPE.contractor
        ComDocumentController.getAllComDocuments(req, res, next)
    }); // get documents
    router.get('/contractorprofile/:comcode/:id/document', validationAPI, (req, res, next) => {
        req.com_type = COM_TYPE.contractor
        ComDocumentController.getComDocument(req, res, next)
    }); // get document
    
}

const ContractorProfileContractRouter = (router)=>{
    router.post('/contractorprofile/contract', validationAPI, uploadMultipleDocuments,(req, res, next) => {
        req.com_type = COM_TYPE.contractor
        ComContractController.postComContract(req, res, next)
    }); // post contract
    router.post('/contractorprofile/contracts', validationAPI, uploadMultipleDocuments,(req, res, next) => {
        req.com_type = COM_TYPE.contractor
        ComContractController.postComContracts(req, res, next)
    }); // post contracts
    router.put('/contractorprofile/:comcode/:id/contract', validationAPI, uploadMultipleDocuments, (req, res, next) => {
        req.com_type = COM_TYPE.contractor
        ComContractController.updateComContract(req, res, next)
    }); // update contract
    router.put('/contractorprofile/:comcode/:id/contract/status', validationAPI, (req, res, next) => {
        req.com_type = COM_TYPE.contractor
        ComContractController.updateStatusComContract(req, res, next)
    }); // update status contract
    router.get('/contractorprofile/:comcode/contracts', validationAPI, (req, res, next) => {
        req.com_type = COM_TYPE.contractor
        ComContractController.getAllComContracts(req, res, next)
    }); // get contracts
    router.get('/contractorprofile/:comcode/:id/contract', validationAPI, (req, res, next) => {
        req.com_type = COM_TYPE.contractor
        ComContractController.getComContract(req, res, next)
    }); // get contract
}

const ContractorProfilePictureRouter = (router)=>{
    router.post('/contractorprofile/pictures', validationAPI, uploadMultipleImage, (req, res, next) => {
        req.com_type = COM_TYPE.contractor
        ComPictureController.postComPictures(req, res, next)
    }); // post pictures
    router.post('/contractorprofile/picture', validationAPI, uploadSingleImage, (req, res, next) => {
        req.com_type = COM_TYPE.contractor
        ComPictureController.postComPicture(req, res, next)
    }); // post picture
    router.put('/contractorprofile/:comcode/:id/picture', validationAPI, uploadSingleImage, (req, res, next) => {
        req.com_type = COM_TYPE.contractor
        ComPictureController.updateComPicture(req, res, next)
    }); // update picture
    router.put('/contractorprofile/:comcode/:id/picture/status', validationAPI, (req, res, next) => {
        req.com_type = COM_TYPE.contractor
        ComPictureController.updateStatusComPicture(req, res, next)
    }); // update status picture
    router.get('/contractorprofile/:comcode/pictures', validationAPI, (req, res, next) => {
        req.com_type = COM_TYPE.contractor
        ComPictureController.getAllComPictures(req, res, next)
    }); // get pictures
    router.get('/contractorprofile/:comcode/:id/picture', validationAPI, (req, res, next) => {
        req.com_type = COM_TYPE.contractor
        ComPictureController.getComPicture(req, res, next)
    }); // get picture
}

const index = (router)=>{
    UserRouter(router)

    CompanyProfileRouter(router)
    CompanyProfileContactRouter(router)
    CompanyProfileDocumentRouter(router)
    CompanyProfileContractRouter(router)
    CompanyProfilePictureRouter(router)
    
    BranchProfileRouter(router)
    BranchProfileContactRouter(router)
    BranchProfileDocumentRouter(router)
    BranchProfileContractRouter(router)
    BranchProfilePictureRouter(router)
    
    ContractorProfileRouter(router)
    ContractorProfileContactRouter(router)
    ContractorProfileDocumentRouter(router)
    ContractorProfileContractRouter(router)
    ContractorProfilePictureRouter(router)
    
    DepartmentRouter(router)
    SectionRouter(router)
    BusinessUnitRouter(router)
    DivisionRouter(router)
    CostCenterRouter(router)
    AccountRouter(router)
    CurrencyRouter(router)
    LocationRouter(router)
    LocationWorkRouter(router)
    LocationOperationsRouter(router)
    PriorityRouter(router)
    ColourRouter(router)
    OfficerRouter(router)
    OfficerTypeRouter(router)
    }

module.exports= index
