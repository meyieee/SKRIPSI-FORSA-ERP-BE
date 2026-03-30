const EmploymentStatus = require('../models/emp_cf_04_statuses')
const {io} = require('../../config/socketapi');
const { Op } = require("sequelize");
const { getAttributeEmployeeFullName } = require('../../function/getIncludeAtributes')
const { getModelEmployeeRegister } = require('../../function/getIncludeModels')

module.exports = {
  functionGetEmploymentStatus: async () => {
    const results = await EmploymentStatus.findAll({
      order: [
          ['emp_status', 'ASC']
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

  postEmployeeStatus: async (req, res) => {
    try {
        const { emp_status, emp_status_des, reg_by, status } = req.body;

        const getEmployeeStatus = await EmploymentStatus.findOne({where: { emp_status }})
        if(getEmployeeStatus!==null){
          return res.status(409).send({
            message: "Employee status already exists.",
          });
        }
       await EmploymentStatus.create({ emp_status, emp_status_des, reg_by, status });

        // set up socket io
        io.emit('change-employeestatus-data', await module.exports.functionGetEmploymentStatus())
        // end set up socket io

        res.status(201).send({
          message: "Successfully created employee status.",
        });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  postBatchEmploymentStatus: async (req, res) => {
    try {
      const array = req.body; // Array of objects

      // Check for duplicate codes in the input array
      const codes = array.map(row => row.emp_status);
      const uniqueCodes = [...new Set(codes)];
      if (codes.length !== uniqueCodes.length) {
        return res.status(409).send({
          message: "Duplicate codes found in the input array.",
        });
      }

      const existingRows = await EmploymentStatus.findAll({ where: { emp_status: { [Op.in]: codes } } });

      // Check for redundancy
      const existingCodes = existingRows.map(row => row.emp_status);
      const duplicateCodes = array.filter(row => existingCodes.includes(row.emp_status));

      if (duplicateCodes.length > 0) {
        return res.status(409).send({
          message: `Codes already exist: ${duplicateCodes.map(row => row.emp_status).join(', ')}`,
        });
      }

      // If no duplicates, create data
      await EmploymentStatus.bulkCreate(array.map(row => ({
        emp_status: row.emp_status,
        emp_status_des: row.emp_status_des,
        reg_by: row.reg_by,
        status: row.status,
        remarks: row.remarks,
        status_date: new Date(),
      })));

      // Included socket for batch creating data
      io.emit('change-employeestatus-data', await module.exports.functionGetEmploymentStatus())

      return res.status(200).send({
        message: "Successfully created data.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateEmployeeStatus: async (req, res) => {
    try {
      const {  emp_status, emp_status_des, reg_by } = req.body;
      const { id } = req.params;

      const findExistingEmployeeStatus = await EmploymentStatus.findOne({
        where: {emp_status,[Op.not]:{id}}
      });

      if(findExistingEmployeeStatus){
        return res.status(409).send({
          message: "Employee Status already exist",
        });
      }

      const findEmployeeStatus = await EmploymentStatus.findOne({
        where: { id: id },
      });
      if(findEmployeeStatus===null){
        return res.status(404).send({
          message: "Employee Status was not defined",
        });
      }

      await EmploymentStatus.update({
        emp_status, emp_status_des, reg_by,
      },{ where: { id: id } });

        // set up socket io
      io.emit('change-employeestatus-data', await module.exports.functionGetEmploymentStatus())
      // end set up socket

      res.status(201).send({
        message: "Employee Status was successfully update",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateStatusEmployeeStatus: async (req, res) => {
    try {
      const { reg_by, status, remarks } = req.body;

      const { id } = req.params;

      const findEmployeeStatus = await EmploymentStatus.findOne({
        where: { id: id },
      });

      if(findEmployeeStatus===null){
        return res.status(404).send({
          message: "Employee Status  was not defined",
        });
      }

      function handleStatus () {
        if(status != findEmploymentStatus._previousDataValues.status ){
          return new Date()
        }
      }

      await EmploymentStatus.update({
        reg_by, status, status_date: handleStatus(), remarks
      },{ where: { id: id } });

      // set up socket io
      io.emit('change-employeestatus-data', await module.exports.functionGetEmploymentStatus())
      // end set up socket

      res.status(200).send({
        message: "Employee Status Status was successfully update",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getAllEmployeeStatus: async (req, res) => {
    try {
      const getEmployeeStatus = await module.exports.functionGetEmploymentStatus()
      if(getEmployeeStatus===null){
        return res.status(404).send({
          message: "Employee Status was not found",
        });
      }
      res.status(200).send({
        message: "Employee Status was successfully get",
        data: getEmployeeStatus
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getEmployeeStatus: async (req, res) => {
    try {
      const { id } = req.params
      const getEmployeeStatus = await EmploymentStatus.findOne({ where: {id}});
      if(getEmployeeStatus===null){
        return res.status(404).send({
          message: "Employee Status is not found",
        });
      }
      res.status(200).send({
       message: "Employee Status was successfully get",
       data: getEmployeeStatus
     });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
};