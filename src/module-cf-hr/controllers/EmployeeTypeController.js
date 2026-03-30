const EmployeeType = require('../models/emp_cf_01_types')
const {io} = require('../../config/socketapi');
const { Op } = require("sequelize");
const { getAttributeEmployeeFullName } = require('../../function/getIncludeAtributes')
const { getModelEmployeeRegister } = require('../../function/getIncludeModels')

module.exports = {
  functionGetEmployeeType: async () => {
    const results = await EmployeeType.findAll({
      order: [
        ['emp_type', 'ASC']
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

  postEmployeeType: async (req, res) => {
    try {
        const { emp_type, emp_type_des, status, reg_by } = req.body;

        const getEmployeeType = await EmployeeType.findOne({where: {emp_type}})
        if(getEmployeeType !== null) {
          return res.status(409).send({
            message: "Employee type already exists.",
          });
        }

        await EmployeeType.create({ emp_type, emp_type_des, reg_by, status });

        // set up socket io
        io.emit('change-employeetype-data', await module.exports.functionGetEmployeeType())
        // end set up socket io

        res.status(201).send({
          message: "Successfully added employee type.",
        });
    } catch (error) {
      return res.status(500).send({ message: error });
    }
  },

  postBatchEmployeeType: async (req, res) => {
    try {
      const array = req.body; // Array of objects

      // Check for duplicate codes in the input array
      const codes = array.map(row => row.emp_type);
      const uniqueCodes = [...new Set(codes)];
      if (codes.length !== uniqueCodes.length) {
        return res.status(409).send({
          message: "Duplicate codes found in the input array.",
        });
      }

      const existingRows = await EmployeeType.findAll({ where: { emp_type: { [Op.in]: codes } } });

      // Check for redundancy
      const existingCodes = existingRows.map(row => row.emp_type);
      const duplicateCodes = array.filter(row => existingCodes.includes(row.emp_type));

      if (duplicateCodes.length > 0) {
        return res.status(409).send({
          message: `Codes already exist: ${duplicateCodes.map(row => row.emp_type).join(', ')}`,
        });
      }

      // If no duplicates, create data
      await EmployeeType.bulkCreate(array.map(row => ({
        emp_type: row.emp_type,
        emp_type_des: row.emp_type_des,
        reg_by: row.reg_by,
        status: row.status,
        remarks: row.remarks,
        status_date: new Date(),
      })));

      // Included socket for batch creating data
      io.emit('change-employeetype-data', await module.exports.functionGetEmployeeType())

      return res.status(200).send({
        message: "Successfully created data.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateEmployeeType: async (req, res) => {
    try {
      const {  emp_type, emp_type_des, reg_by,  remarks } = req.body;
      const { id } = req.params;

      const findExistingEmployeeType = await EmployeeType.findOne({
        where: {emp_type,[Op.not]:{id}}
      });

      if(findExistingEmployeeType){
        return res.status(409).send({
          message: "Employee Type already exist",
        });
      }

      const findEmployeeType = await EmployeeType.findOne({
        where: { id: id },
      });
      if(findEmployeeType===null){
        return res.status(404).send({
          message: "Employee Type was not defined",
        });
      }

      await EmployeeType.update({
        emp_type, emp_type_des, reg_by,  remarks,
      },{ where: { id: id } });

        // set up socket io
      io.emit('change-employeetype-data', await module.exports.functionGetEmployeeType())
      // end set up socket

      res.status(201).send({
        message: "Employee Type was successfully update",
      });
    } catch (error) {
      return res.status(500).send({ message: error });
    }
  },

  updateStatusEmployeeType: async (req, res) => {
    try {
      const { reg_by, status, remarks } = req.body;

      const { id } = req.params;

      const findEmployeeType = await EmployeeType.findOne({
        where: { id: id },
      });

      if(findEmployeeType===null){
        return res.status(404).send({
          message: "Employee Type  was not defined",
        });
      }

      function handleStatus () {
        if(status != findEmployeeType._previousDataValues.status) {
          return new Date()
        }
      }

      await EmployeeType.update({
        reg_by, status, status_date: handleStatus(), remarks
      },{ where: { id: id } });

      // set up socket io
      io.emit('change-employeetype-data', await module.exports.functionGetEmployeeType())
      // end set up socket

      res.status(200).send({
        message: "Employee Type Status was successfully update",
      });
    } catch (error) {
      return res.status(500).send({ message: error });
    }
  },

  getAllEmployeeType: async (req, res) => {
    try {
      const getEmployeeType = await module.exports.functionGetEmployeeType()
      if(getEmployeeType===null){
        return res.status(404).send({
          message: "Employee Type was not found",
        });
      }
      res.status(200).send({
        message: "Employee Type was successfully get",
        data: getEmployeeType
      });
    } catch (error) {
      return res.status(500).send({ message: error });
    }
  },

  getEmployeeType: async (req, res) => {
    try {
      const { id } = req.params
      const getEmployeeType = await EmployeeType.findOne({ where: {id}});
      if(getEmployeeType===null){
        return res.status(404).send({
          message: "Employee Type is not found",
        });
      }
      res.status(200).send({
       message: "Employee Type was successfully get",
       data: getEmployeeType
     });
    } catch (error) {
      return res.status(500).send({ message: error });
    }
  },
};