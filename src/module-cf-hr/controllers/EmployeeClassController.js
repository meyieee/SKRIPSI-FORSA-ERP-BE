const EmployeeClass = require('../models/emp_cf_02_class')
const {io} = require('../../config/socketapi');
const { Op } = require("sequelize");
const { getAttributeEmployeeFullName } = require('../../function/getIncludeAtributes')
const { getModelEmployeeRegister } = require('../../function/getIncludeModels')

module.exports = {
  functionGetEmployeeClass: async () => {
    const results = await EmployeeClass.findAll({
      order: [
        ['emp_class', 'ASC']
      ],
      include: [getModelEmployeeRegister()],
      attributes: {
        include: [
          [getAttributeEmployeeFullName(), 'reg_by'],
        ],
      }
    })

    return results;
  },

  postEmployeeClass: async (req, res) => {
    try {
        const { emp_class, emp_class_des, reg_by, status } = req.body;

        const getEmployeeClass = await EmployeeClass.findOne({where: {emp_class}})
        if(getEmployeeClass!==null){
          return res.status(409).send({
            message: "Employee class already exists.",
          });
        }
       await EmployeeClass.create({ emp_class, emp_class_des, reg_by, status });

        // set up socket io
        io.emit('change-employeeclass-data', await module.exports.functionGetEmployeeClass())
        // end set up socket io

        res.status(201).send({
          message: "Successfully created employee class.",
        });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  postBatchEmployeeClass: async (req, res) => {
    try {
      const array = req.body; // Array of objects

      // Check for duplicate codes in the input array
      const codes = array.map(row => row.emp_class);
      const uniqueCodes = [...new Set(codes)];
      if (codes.length !== uniqueCodes.length) {
        return res.status(409).send({
          message: "Duplicate codes found in the input array.",
        });
      }

      const existingRows = await EmployeeClass.findAll({ where: { emp_class: { [Op.in]: codes } } });

      // Check for redundancy
      const existingCodes = existingRows.map(row => row.emp_class);
      const duplicateCodes = array.filter(row => existingCodes.includes(row.emp_class));

      if (duplicateCodes.length > 0) {
        return res.status(409).send({
          message: `Codes already exist: ${duplicateCodes.map(row => row.emp_class).join(', ')}`,
        });
      }

      // If no duplicates, create data
      await EmployeeClass.bulkCreate(array.map(row => ({
        emp_class: row.emp_class,
        emp_class_des: row.emp_class_des,
        reg_by: row.reg_by,
        status: row.status,
        remarks: row.remarks,
        status_date: new Date(),
      })));

      // Included socket for batch creating data
      io.emit('change-employeeclass-data', await module.exports.functionGetEmployeeClass())

      return res.status(200).send({
        message: "Successfully created data.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateEmployeeClass: async (req, res) => {
    try {
      const {  emp_class, emp_class_des, reg_by,  remarks } = req.body;
      const { id } = req.params;

      const findExistingEmployeeClass = await EmployeeClass.findOne({
        where: {emp_class,[Op.not]:{id}}
      });

      if(findExistingEmployeeClass){
        return res.status(409).send({
          message: "Employee Class already exist",
        });
      }

      const findEmployeeClass = await EmployeeClass.findOne({
        where: { id: id },
      });
      if(findEmployeeClass===null){
        return res.status(404).send({
          message: "Employee Class was not defined",
        });
      }

      await EmployeeClass.update({
        emp_class, emp_class_des, reg_by,  remarks,
      },{ where: { id: id } });

      // set up socket io
      io.emit('change-employeeclass-data', await module.exports.functionGetEmployeeClass())
      // end set up socket

      res.status(201).send({
        message: "Employee Class was successfully update",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateStatusEmployeeClass: async (req, res) => {
    try {
      const { reg_by, status, remarks } = req.body;

      const { id } = req.params;

      const findEmployeeClass = await EmployeeClass.findOne({
        where: { id: id },
      });

      if(findEmployeeClass===null){
        return res.status(404).send({
          message: "Employee Class  was not defined",
        });
      }

      function handleStatus () {
        if(status != findEmployeeClass._previousDataValues.status) {
          return new Date()
        }
      }

      await EmployeeClass.update({
        reg_by, status, status_date: handleStatus(), remarks
      },{ where: { id: id } });

      // set up socket io
      io.emit('change-employeeclass-data', await module.exports.functionGetEmployeeClass())
      // end set up socket

      res.status(200).send({
        message: "Employee Class Status was successfully update",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getAllEmployeeClass: async (req, res) => {
    try {
      const getEmployeeClass = await module.exports.functionGetEmployeeClass()

      if(getEmployeeClass===null){
        return res.status(404).send({
          message: "Employee Class was not found",
        });
      }
      res.status(200).send({
        message: "Employee Class was successfully get",
        data: getEmployeeClass
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getEmployeeClass: async (req, res) => {
    try {
      const { id } = req.params
      const getEmployeeClass = await EmployeeClass.findOne({ where: {id}});
      if(getEmployeeClass===null){
        return res.status(404).send({
          message: "Employee Class is not found",
        });
      }
      res.status(200).send({
       message: "Employee Class was successfully get",
       data: getEmployeeClass
     });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
};