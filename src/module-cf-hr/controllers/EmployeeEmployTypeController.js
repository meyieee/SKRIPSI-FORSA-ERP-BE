const EmploymentType = require('../models/emp_cf_03_employtypes')
const {io} = require('../../config/socketapi');
const { Op } = require("sequelize");
const { getAttributeEmployeeFullName } = require('../../function/getIncludeAtributes')
const { getModelEmployeeRegister } = require('../../function/getIncludeModels')

module.exports = {
  functionGetEmploymentType: async () => {
    const results = await EmploymentType.findAll({
      order: [
        ['employ_type', 'ASC']
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
  
  postEmployeeEmployType: async (req, res) => {
    try {
      const { employ_type, employ_type_des, reg_by, status } = req.body;

      const getEmployeeEmployType = await EmploymentType.findOne({where: { employ_type }})
      if(getEmployeeEmployType!==null){
        return res.status(409).send({
          message: "Employment type already exists.",
        });
      }
      await EmploymentType.create({ employ_type, employ_type_des, reg_by, status });

      // set up socket io
      io.emit('change-employtype-data', await module.exports.functionGetEmploymentType())
      // end set up socket io

      res.status(201).send({
        message: "Succesfully created employment type.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  postBatchEmploymentType: async (req, res) => {
    try {
      const array = req.body; // Array of objects

      // Check for duplicate codes in the input array
      const codes = array.map(row => row.employ_type);
      const uniqueCodes = [...new Set(codes)];
      if (codes.length !== uniqueCodes.length) {
        return res.status(409).send({
          message: "Duplicate codes found in the input array.",
        });
      }

      const existingRows = await EmploymentType.findAll({ where: { employ_type: { [Op.in]: codes } } });

      // Check for redundancy
      const existingCodes = existingRows.map(row => row.employ_type);
      const duplicateCodes = array.filter(row => existingCodes.includes(row.employ_type));

      if (duplicateCodes.length > 0) {
        return res.status(409).send({
          message: `Codes already exist: ${duplicateCodes.map(row => row.employ_type).join(', ')}`,
        });
      }

      // If no duplicates, create data
      await EmploymentType.bulkCreate(array.map(row => ({
        employ_type: row.employ_type,
        employ_type_des: row.employ_type_des,
        reg_by: row.reg_by,
        status: row.status,
        remarks: row.remarks,
        status_date: new Date(),
      })));

      // Included socket for batch creating data
      io.emit('change-employtype-data', await module.exports.functionGetEmploymentType())

      return res.status(200).send({
        message: "Successfully created data.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateEmployeeEmployType: async (req, res) => {
    try {
      const {   employ_type,  employ_type_des, reg_by,  remarks } = req.body;
      const { id } = req.params;

      const findExistingEmployeeEmployType = await EmploymentType.findOne({
        where: { employ_type,[Op.not]:{id}}
      });

      if(findExistingEmployeeEmployType){
        return res.status(409).send({
          message: "Employee Type already exist",
        });
      }

      const findEmployeeEmployType = await EmploymentType.findOne({
        where: { id: id },
      });
      if(findEmployeeEmployType===null){
        return res.status(404).send({
          message: "Employee Type was not defined",
        });
      }

      await EmploymentType.update({
         employ_type,  employ_type_des, reg_by,  remarks,
      },{ where: { id: id } });

        // set up socket io
      io.emit('change-employtype-data', await module.exports.functionGetEmploymentType())
      // end set up socket

      res.status(201).send({
        message: "Employee Type was successfully update",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateStatusEmployeeEmployType: async (req, res) => {
    try {
      const { reg_by, status, remarks } = req.body;

      const { id } = req.params;

      const findEmployeeEmployType = await EmploymentType.findOne({
        where: { id: id },
      });

      if(findEmployeeEmployType===null){
        return res.status(404).send({
          message: "Employee Type  was not defined",
        });
      }

      function handleStatus () {
        if(status != findEmploymentType._previousDataValues.status ){
          return new Date()
        }
      }

      await EmploymentType.update({
        reg_by, status, status_date: handleStatus(), remarks
      },{ where: { id: id } });

      // set up socket io
      io.emit('change-employtype-data', await module.exports.functionGetEmploymentType())
      // end set up socket

      res.status(200).send({
        message: "Employee Type Status was successfully update",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getAllEmployeeEmployType: async (req, res) => {
    try {
      const getEmployeeEmployType = await module.exports.functionGetEmploymentType()
      if(getEmployeeEmployType===null){
        return res.status(404).send({
          message: "Employee Type was not found",
        });
      }
      res.status(200).send({
        message: "Employee Type was successfully get",
        data: getEmployeeEmployType
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getEmployeeEmployType: async (req, res) => {
    try {
      const { id } = req.params
      const getEmployeeEmployType = await EmploymentType.findOne({ where: {id}});
      if(getEmployeeEmployType===null){
        return res.status(404).send({
          message: "Employee Type is not found",
        });
      }
      res.status(200).send({
       message: "Employee Type was successfully get",
       data: getEmployeeEmployType
     });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
};