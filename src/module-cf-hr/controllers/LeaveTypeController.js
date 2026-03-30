const LeaveType = require("../models/emp_cf_per_job_leavetype")
const {io} = require('../../config/socketapi');
const { Op } = require("sequelize");
const { getAttributeEmployeeFullName } = require('../../function/getIncludeAtributes')
const { getModelEmployeeRegister } = require('../../function/getIncludeModels')

module.exports = {
  functionGetLeaveType: async () => {
    const results = await LeaveType.findAll({
      order: [
        ['leave_type', 'ASC']
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

  postLeaveType: async (req, res) => {
    try {
      const { leave_type,	leave_type_des, justification, status, reg_by } = req.body;
      const getLeaveType = await LeaveType.findOne({where: { leave_type: leave_type }})
      if(getLeaveType !== null) {
        return res.status(409).send({
          message: "Leave type code already exists.",
        });
      }

      await LeaveType.create({
        leave_type,	leave_type_des, justification, reg_by, status
      });

      io.emit('change-leavetype-data', await module.exports.functionGetLeaveType())

      return res.status(200).send({
        message: "Successfully added leave type.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  postBatchLeaveType: async (req, res) => {
    try {
      const array = req.body; // Array of objects

      // Check for duplicate codes in the input array
      const codes = array.map(row => row.leave_type);
      const uniqueCodes = [...new Set(codes)];
      if (codes.length !== uniqueCodes.length) {
        return res.status(409).send({
          message: "Duplicate codes found in the input array.",
        });
      }

      const existingRows = await LeaveType.findAll({ where: { leave_type: { [Op.in]: codes } } });

      // Check for redundancy
      const existingCodes = existingRows.map(row => row.leave_type);
      const duplicateCodes = array.filter(row => existingCodes.includes(row.leave_type));

      if (duplicateCodes.length > 0) {
        return res.status(409).send({
          message: `Codes already exist: ${duplicateCodes.map(row => row.leave_type).join(', ')}`,
        });
      }

      // If no duplicates, create data
      await LeaveType.bulkCreate(array.map(row => ({
        leave_type: row.leave_type,
        leave_type_des: row.leave_type_des,
        justification: row.justification,
        reg_by: row.reg_by,
        status: row.status,
        remarks: row.remarks,
        status_date: new Date(),
      })));

      // Included socket for batch creating data
      io.emit('change-leavetype-data', await module.exports.functionGetLeaveType())

      return res.status(200).send({
        message: "Successfully created data.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateLeaveType: async (req, res) => {
    try {
      const { leave_type,	leave_type_des, justification, reg_by } = req.body;
      const { id } = req.params;

      const getExistLeaveTypeCode = await LeaveType.findOne({where: { leave_type: leave_type, [Op.not]: {id} }})
      if(getExistLeaveTypeCode !== null) {
        return res.status(409).send({
          message: "Leave type code already exists.",
        });
      }

      const findLeaveType = await LeaveType.findOne({
        where: { id: id },
      });
      
      if(findLeaveType === null) {
        return res.status(404).send({
          message: "Cannot find item.",
        });
      }

      await LeaveType.update({
        leave_type, leave_type_des, justification, reg_by
      },{ where: { id: id } });

      io.emit('change-leavetype-data', await module.exports.functionGetLeaveType())

      return res.status(201).send({
        message: "Successfully updated leave type.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateStatusLeaveType: async (req, res) => {
    try {
      const { reg_by, status, remarks } = req.body;
      const { id } = req.params;
      const findLeaveType = await LeaveType.findOne({
        where: { id: id },
      });

      if(findLeaveType === null) {
        return res.status(404).send({
          message: "Cannot find item.",
        });
      }

      function handleStatus () {
        if(status != findLeaveType._previousDataValues.status ) {
          return new Date()
        }
      }

      await LeaveType.update({
        reg_by, status, status_date: handleStatus(), remarks
      }, { where: { id: id } });

      io.emit('change-leavetype-data', await module.exports.functionGetLeaveType())
      return res.status(200).send({
        message: "Successfully updated item status.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getAllLeaveType: async (req, res) => {
    try {
      const leavetype = await module.exports.functionGetLeaveType()
      if(leavetype === null) {
        return res.status(404).send({
          message: "Cannot find leave type data.",
        });
      }
      return res.status(200).send({
       message: "Successfully fetched leave type data.",
       data: leavetype
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getLeaveType: async (req, res) => {
    try {
      const { id } = req.params
      const leavetype = await LeaveType.findOne({ where: { id: id } });
      if(leavetype === null) {
        return res.status(404).send({
          message: "Cannot find item",
        });
      }

      return res.status(200).send({
       message: "Successfully fetched item.",
       data: leavetype
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
};