const WorkGroup = require("../models/emp_cf_plan_a_workgroup")
const {io} = require('../../config/socketapi');
const { Op } = require("sequelize");
const { getAttributeEmployeeFullName } = require('../../function/getIncludeAtributes')
const { getModelEmployeeRegister } = require('../../function/getIncludeModels')

module.exports = {
  functionGetWorkGroup: async () => {
    const results = await WorkGroup.findAll({
      order: [
        ['work_group', 'ASC']
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

  postWorkGroup: async (req, res) => {
    try {
      const { work_group,	work_group_des, status, reg_by } = req.body;
      const getWorkGroup = await WorkGroup.findOne({where: { work_group: work_group }})
      if(getWorkGroup !== null) {
        return res.status(409).send({
          message: "Work group code already exists.",
        });
      }

      await WorkGroup.create({
        work_group,	work_group_des, reg_by, status
      });

      io.emit('change-workgroup-data', await module.exports.functionGetWorkGroup())

      return res.status(200).send({
        message: "Successfully added work group.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  postBatchWorkGroup: async (req, res) => {
    try {
      const array = req.body; // Array of objects

      // Check for duplicate codes in the input array
      const codes = array.map(row => row.work_group);
      const uniqueCodes = [...new Set(codes)];
      if (codes.length !== uniqueCodes.length) {
        return res.status(409).send({
          message: "Duplicate codes found in the input array.",
        });
      }

      const existingRows = await WorkGroup.findAll({ where: { work_group: { [Op.in]: codes } } });

      // Check for redundancy
      const existingCodes = existingRows.map(row => row.work_group);
      const duplicateCodes = array.filter(row => existingCodes.includes(row.work_group));

      if (duplicateCodes.length > 0) {
        return res.status(409).send({
          message: `Codes already exist: ${duplicateCodes.map(row => row.work_group).join(', ')}`,
        });
      }

      // If no duplicates, create data
      await WorkGroup.bulkCreate(array.map(row => ({
        work_group: row.work_group,
        work_group_des: row.work_group_des,
        reg_by: row.reg_by,
        status: row.status,
        remarks: row.remarks,
        status_date: new Date(),
      })));

      // Included socket for batch creating data
      io.emit('change-workgroup-data', await module.exports.functionGetWorkGroup())

      return res.status(200).send({
        message: "Successfully created data.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateWorkGroup: async (req, res) => {
    try {
      const { work_group,	work_group_des, reg_by } = req.body;
      const { id } = req.params;

      const getExistWorkGroupCode = await WorkGroup.findOne({where: { work_group: work_group, [Op.not]: {id} }})
      if(getExistWorkGroupCode !== null) {
        return res.status(409).send({
          message: "Work group code already exists.",
        });
      }

      const findWorkGroup = await WorkGroup.findOne({
        where: { id: id },
      });
      
      if(findWorkGroup === null) {
        return res.status(404).send({
          message: "Cannot find item.",
        });
      }

      await WorkGroup.update({
        work_group, work_group_des, reg_by
      },{ where: { id: id } });

      io.emit('change-workgroup-data', await module.exports.functionGetWorkGroup())

      return res.status(201).send({
        message: "Successfully updated work group.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateStatusWorkGroup: async (req, res) => {
    try {
      const { reg_by, status, remarks } = req.body;
      const { id } = req.params;
      const findWorkGroup = await WorkGroup.findOne({
        where: { id: id },
      });

      if(findWorkGroup === null) {
        return res.status(404).send({
          message: "Cannot find item.",
        });
      }

      function handleStatus () {
        if(status != findWorkGroup._previousDataValues.status ) {
          return new Date()
        }
      }

      await WorkGroup.update({
        reg_by, status, status_date: handleStatus(), remarks
      }, { where: { id: id } });

      io.emit('change-workgroup-data', await module.exports.functionGetWorkGroup())
      return res.status(200).send({
        message: "Successfully updated item status.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getAllWorkGroup: async (req, res) => {
    try {
      const workgroup = await module.exports.functionGetWorkGroup()
      if(workgroup === null) {
        return res.status(404).send({
          message: "Cannot find work group data.",
        });
      }
      return res.status(200).send({
       message: "Successfully fetched work group data.",
       data: workgroup
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getWorkGroup: async (req, res) => {
    try {
      const { id } = req.params
      const workgroup = await WorkGroup.findOne({ where: { id: id } });
      if(workgroup === null) {
        return res.status(404).send({
          message: "Cannot find item",
        });
      }

      return res.status(200).send({
       message: "Successfully fetched item.",
       data: workgroup
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
};