const { socketEmitRoom } =require('../../function/socketEmit')
const { deleteFileWhenFailedPostOrUpdate, deleteFile } = require('../../function/deleteFiles')
const { 
        getAllEmployeeGroupedByDeptRepository, getEmployeeRegisterByIdNumberRepository, getEmployeeRegisterByIdNumberExcludeCurrentIdRepository, 
        getEmployeeRegisterByIdRepository, getAllEmployeeRepository, postEmployeeRegisterRepository, updateEmployeeRegisterRepository, 
        getAllEmployeeByBranchGroupedByDeptRepository, updateStatusEmployeeRegisterRepository,
        getExistingEmployeeByIdRepository
      } = require('../repositories/EmployeeRegisterRepository')
const { company } = require("../../constants");

module.exports = {
    registerEmployee: async (req, res) => {
      const {id_number, branch_code} = req.body
     
      try {
        const findExistUser = await getEmployeeRegisterByIdNumberRepository(id_number)
        if(findExistUser) {
          deleteFileWhenFailedPostOrUpdate(req.file, 'images')
          return res.status(404).send({
            message: "ID number already exists.",
          }); 
        }

        await postEmployeeRegisterRepository(req.body, req.file)

        socketEmitRoom(branch_code,`employee_${branch_code}`, await getAllEmployeeByBranchGroupedByDeptRepository(branch_code)) // branch level
        socketEmitRoom(company,'employee', await getAllEmployeeGroupedByDeptRepository())// HO level

        return res.status(201).send({
          message: "Successfully registered employee.",
        }); 
      } catch (error) {
        deleteFileWhenFailedPostOrUpdate(req.file, 'images')
        return res.status(500).send({ message: error.message }); 
      }
    },
    updateEmployee: async (req, res) => {
      try {
        const { id } = req.params
        const { id_number, image, branch_code } = req.body

        const findExistUser = await getEmployeeRegisterByIdNumberExcludeCurrentIdRepository(id_number, id)
        if(findExistUser) {
          deleteFileWhenFailedPostOrUpdate(req.file, 'images')
          return res.status(409).send({
            message: "id number already exist",
          }); 
        }

        const findEmployee = await getExistingEmployeeByIdRepository(id)
        if (!findEmployee) {
          deleteFileWhenFailedPostOrUpdate(req.file, 'images');
          return res.status(404).send({
            message: "employee does not exist.",
          });
        }
       
        if((image === 'deleted' || req.file) && findEmployee){
          deleteFile(findEmployee.photo)
        }

        await updateEmployeeRegisterRepository(req.body, req.file, id, findEmployee.photo)

        socketEmitRoom(branch_code,`employee_${branch_code}`, await getAllEmployeeByBranchGroupedByDeptRepository(branch_code)) // branch level
        socketEmitRoom(branch_code,`employee_${id}`, await getEmployeeRegisterByIdRepository(id)) // get emplyoee by id
        socketEmitRoom(company,`employee_${id}`, await getEmployeeRegisterByIdRepository(id)) // get emplyoee by id
        socketEmitRoom(company,'employee', await getAllEmployeeGroupedByDeptRepository())// HO level

        return res.status(201).send({
          message: "Employee successfully updated.",
        }); 
      } catch (error) {
        deleteFileWhenFailedPostOrUpdate(req.file, 'images')
        return res.status(500).send({ message: error.message }); 
      }
    },

    deleteEmployee: async (req, res) => {
      try {
        const { id } = req.params
        const { status, remarks } = req.body

        const findEmployee = await getExistingEmployeeByIdRepository(id)
        if(!findEmployee){
          return res.status(404).send({
            message: "Employee is not Found",
          });
        }

        await updateStatusEmployeeRegisterRepository(id, status, remarks)

        socketEmitRoom(findEmployee.branch_code,`employee_${findEmployee.branch_code}`, await getAllEmployeeByBranchGroupedByDeptRepository(findEmployee.branch_code)) // branch level
        socketEmitRoom(company,'employee', await getAllEmployeeGroupedByDeptRepository())// HO level

        return res.status(201).send({
            message: "Sucessfully Update Status Employee",
          });
      } catch (error) {
        return res.status(500).send({ message: error.message });
      }
    },

    getAllEmployeeGroupedByDept: async (req, res) => {
      try {
        const data = await getAllEmployeeGroupedByDeptRepository();
        return res.status(200).send({
          message: "User Sucessfully get",
          data: data
        });
      } catch (error) {
        return res.status(500).send({ message: error.message });
      }
    },

    getAllEmployeeByBranchGroupedByDept: async (req, res) => {
      const {branch_code} = req.params
      try {
        const data = await getAllEmployeeByBranchGroupedByDeptRepository(branch_code);
        return res.status(200).send({
          message: "User Sucessfully get",
          data: data
        });
      } catch (error) {
        return res.status(500).send({ message: error.message });
      }
    },

    getAllEmployee: async (req, res) => {
      try {
        const employee = await getAllEmployeeRepository()
        if(!employee) {
          return res.status(404).send({
            message: "Cannot find employee list.",
          });
        }
        
        return res.status(200).send({
         message: "Successfully fetched employee list.",
         data: employee
        });
      } catch (error) {
        return res.status(500).send({ message: error.message });
      }
    },
    getAllEmployeeByBranch: async (req, res) => {
      const { branch_code } =req.params;
      try {
        const employee = await getAllEmployeeRepository(branch_code)
        if(!employee) {
          return res.status(404).send({
            message: "Cannot find employee list.",
          });
        }
        
        return res.status(200).send({
         message: "Successfully fetched employee list.",
         data: employee
        });
      } catch (error) {
        return res.status(500).send({ message: error.message });
      }
    },

    getEmployeeById: async (req, res) => {
      const { id } = req.params;
      try {
        const employee = await getEmployeeRegisterByIdRepository(id)
        if(!employee) {
          return res.status(404).send({
            message: "Cannot find employee.",
          });
        }
        
        return res.status(200).send({
         message: "Successfully fetched employe.",
         data: employee
        });
      } catch (error) {
        return res.status(500).send({ message: error.message });
      }
    },
};