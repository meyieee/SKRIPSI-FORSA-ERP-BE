const WorkFunction = require("../models/emp_cf_plan_b_function")
const {io} = require('../../config/socketapi');
const { Op } = require("sequelize");
const { getAttributeEmployeeFullName } = require('../../function/getIncludeAtributes')
const { getModelEmployeeRegister } = require('../../function/getIncludeModels')

module.exports = {
  functionGetWorkFunction: async () => {
    const results = await WorkFunction.findAll({
      order: [
        ['work_function', 'ASC']
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

  postWorkFunction: async (req, res) => {
    try {
      const { work_function,	work_function_des, work_group, status, reg_by } = req.body;
      const getWorkFunction = await WorkFunction.findOne({where: { work_function: work_function }})
      if(getWorkFunction !== null) {
        return res.status(409).send({
          message: "Work function code already exists.",
        });
      }

      await WorkFunction.create({
        work_function,	work_function_des, work_group, reg_by, status
      });

      io.emit('change-workfunction-data', await module.exports.functionGetWorkFunction())

      return res.status(200).send({
        message: "Successfully added work function.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  postBatchWorkFunction: async (req, res) => {
    try {
      const array = req.body; // Array of objects

      // Check for duplicate codes in the input array
      const codes = array.map(row => row.work_function);
      const uniqueCodes = [...new Set(codes)];
      if (codes.length !== uniqueCodes.length) {
        return res.status(409).send({
          message: "Duplicate codes found in the input array.",
        });
      }

      const existingRows = await WorkFunction.findAll({ where: { work_function: { [Op.in]: codes } } });

      // Check for redundancy
      const existingCodes = existingRows.map(row => row.work_function);
      const duplicateCodes = array.filter(row => existingCodes.includes(row.work_function));

      if (duplicateCodes.length > 0) {
        return res.status(409).send({
          message: `Codes already exist: ${duplicateCodes.map(row => row.work_function).join(', ')}`,
        });
      }

      // If no duplicates, create data
      await WorkFunction.bulkCreate(array.map(row => ({
        work_function: row.work_function,
        work_function_des: row.work_function_des,
        work_group: row.work_group,
        reg_by: row.reg_by,
        status: row.status,
        remarks: row.remarks,
        status_date: new Date(),
      })));

      // Included socket for batch creating data
      io.emit('change-workfunction-data', await module.exports.functionGetWorkFunction())

      return res.status(200).send({
        message: "Successfully created data.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateWorkFunction: async (req, res) => {
    try {
      const { work_function,	work_function_des, work_group, reg_by } = req.body;
      const { id } = req.params;

      const getExistWorkFunctionCode = await WorkFunction.findOne({where: { work_function: work_function, [Op.not]: {id} }})
      if(getExistWorkFunctionCode !== null) {
        return res.status(409).send({
          message: "Work function code already exists.",
        });
      }

      const findWorkFunction = await WorkFunction.findOne({
        where: { id: id },
      });
      
      if(findWorkFunction === null) {
        return res.status(404).send({
          message: "Cannot find item.",
        });
      }

      await WorkFunction.update({
        work_function, work_function_des, work_group, reg_by
      },{ where: { id: id } });

      io.emit('change-workfunction-data', await module.exports.functionGetWorkFunction())

      return res.status(201).send({
        message: "Successfully updated item.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateStatusWorkFunction: async (req, res) => {
    try {
      const { reg_by, status, remarks } = req.body;
      const { id } = req.params;
      const findWorkFunction = await WorkFunction.findOne({
        where: { id: id },
      });

      if(findWorkFunction === null) {
        return res.status(404).send({
          message: "Cannot find item.",
        });
      }

      function handleStatus () {
        if(status != findWorkFunction._previousDataValues.status ) {
          return new Date()
        }
      }

      await WorkFunction.update({
        reg_by, status, status_date: handleStatus(), remarks
      }, { where: { id: id } });

      io.emit('change-workfunction-data', await module.exports.functionGetWorkFunction())
      
      return res.status(200).send({
        message: "Successfully updated item status.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getAllWorkFunction: async (req, res) => {
    try {
      const workfunction = await module.exports.functionGetWorkFunction()
      if(workfunction === null) {
        return res.status(404).send({
          message: "Cannot find function data.",
        });
      }
      return res.status(200).send({
       message: "Successfully fetched function data.",
       data: workfunction
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getWorkFunction: async (req, res) => {
    try {
      const { id } = req.params
      const workfunction = await WorkFunction.findOne({ where: { id: id } });
      if(workfunction === null) {
        return res.status(404).send({
          message: "Cannot find item",
        });
      }

      return res.status(200).send({
       message: "Successfully fetched item.",
       data: workfunction
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
};