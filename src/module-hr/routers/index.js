const EmployeeRegister = require('../controllers/EmployeeRegisterController')
const { uploadSingleImage } = require('../../middlewares/multer');
const validationAPI = require('../../middlewares/validationAPI')

const EmployeeRegisterRouter = (router) =>{
    router.post('/employeeregister', validationAPI, uploadSingleImage, EmployeeRegister.registerEmployee);
    router.put('/employeeregister/:id', validationAPI, uploadSingleImage, EmployeeRegister.updateEmployee);
    // router.put('/employeeregister/status/:id',validationAPI, EmployeeRegister.updateStatusEmployee);
    router.put('/employeeregister/delete/:id', validationAPI, EmployeeRegister.deleteEmployee); // soft delete
    router.get('/employeeregister/dept/:branch_code', validationAPI, EmployeeRegister.getAllEmployeeByBranchGroupedByDept); // return object of employee
    router.get('/employeeregister/dept', validationAPI, EmployeeRegister.getAllEmployeeGroupedByDept); // return object of employee
    router.get('/employeeregister/', validationAPI, EmployeeRegister.getAllEmployee); //return array of employee
    router.get('/employeeregister/:branch_code', validationAPI, EmployeeRegister.getAllEmployeeByBranch);
    router.get('/employeeregister/id/:id', validationAPI, EmployeeRegister.getEmployeeById);
}

const index = (router) =>{
    EmployeeRegisterRouter(router)
}
module.exports= index
