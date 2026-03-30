const WorkDay = require("../models/emp_cf_per_job_workday")
const {io} = require('../../config/socketapi');
const { Op } = require("sequelize");
const { getAttributeEmployeeFullName } = require('../../function/getIncludeAtributes')
const { getModelEmployeeRegister } = require('../../function/getIncludeModels')

module.exports = {
  functionGetWorkDay: async () => {
    const results = await WorkDay.findAll({
      order: [
        ['work_day', 'ASC']
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

  postWorkDay: async (req, res) => {
    try {
      const { work_day,	work_day_des, work_days, off_days, justification, status, reg_by } = req.body;
      const getWorkDay = await WorkDay.findOne({where: { work_day: work_day }})
      if(getWorkDay !== null) {
        return res.status(409).send({
          message: "Work day code already exists.",
        });
      }

      await WorkDay.create({
        work_day,	work_day_des, work_days, off_days, justification, reg_by, status
      });

      io.emit('change-workday-data', await module.exports.functionGetWorkDay())

      return res.status(200).send({
        message: "Successfully added work day.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  postBatchWorkDay: async (req, res) => {
    try {
      const array = req.body; // Array of objects

      // Check for duplicate codes in the input array
      const codes = array.map(row => row.work_day);
      const uniqueCodes = [...new Set(codes)];
      if (codes.length !== uniqueCodes.length) {
        return res.status(409).send({
          message: "Duplicate codes found in the input array.",
        });
      }

      const existingRows = await WorkDay.findAll({ where: { work_day: { [Op.in]: codes } } });

      // Check for redundancy
      const existingCodes = existingRows.map(row => row.work_day);
      const duplicateCodes = array.filter(row => existingCodes.includes(row.work_day));

      if (duplicateCodes.length > 0) {
        return res.status(409).send({
          message: `Codes already exist: ${duplicateCodes.map(row => row.work_day).join(', ')}`,
        });
      }

      // If no duplicates, create data
      await WorkDay.bulkCreate(array.map(row => ({
        work_day: row.work_day,
        work_day_des: row.work_day_des,
        work_days: row.work_days,
        off_days: row.off_days,
        justification: row.justification,
        reg_by: row.reg_by,
        status: row.status,
        remarks: row.remarks,
        status_date: new Date(),
      })));

      // Included socket for batch creating data
      io.emit('change-workday-data', await module.exports.functionGetWorkDay())

      return res.status(200).send({
        message: "Successfully created data.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateWorkDay: async (req, res) => {
    try {
      const { work_day,	work_day_des, work_days, off_days, justification, reg_by } = req.body;
      const { id } = req.params;

      const getExistWorkDayCode = await WorkDay.findOne({where: { work_day: work_day, [Op.not]: {id} }})
      if(getExistWorkDayCode !== null) {
        return res.status(409).send({
          message: "Work day code already exists.",
        });
      }

      const findWorkDay = await WorkDay.findOne({
        where: { id: id },
      });
      
      if(findWorkDay === null) {
        return res.status(404).send({
          message: "Cannot find item.",
        });
      }

      await WorkDay.update({
        work_day, work_day_des, work_days, off_days, justification, reg_by
      },{ where: { id: id } });

      io.emit('change-workday-data', await module.exports.functionGetWorkDay())

      return res.status(201).send({
        message: "Successfully updated work day.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateStatusWorkDay: async (req, res) => {
    try {
      const { reg_by, status, remarks } = req.body;
      const { id } = req.params;
      const findWorkDay = await WorkDay.findOne({
        where: { id: id },
      });

      if(findWorkDay === null) {
        return res.status(404).send({
          message: "Cannot find item.",
        });
      }

      function handleStatus () {
        if(status != findWorkDay._previousDataValues.status ) {
          return new Date()
        }
      }

      await WorkDay.update({
        reg_by, status, status_date: handleStatus(), remarks
      }, { where: { id: id } });

      io.emit('change-workday-data', await module.exports.functionGetWorkDay())
      
      return res.status(200).send({
        message: "Successfully updated item status.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getAllWorkDay: async (req, res) => {
    try {
      const workday = await module.exports.functionGetWorkDay()
      if(workday === null) {
        return res.status(404).send({
          message: "Cannot find work day data.",
        });
      }
      return res.status(200).send({
       message: "Successfully fetched work day data.",
       data: workday
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getWorkDay: async (req, res) => {
    try {
      const { id } = req.params
      const workday = await WorkDay.findOne({ where: { id: id } });
      if(workday === null) {
        return res.status(404).send({
          message: "Cannot find item",
        });
      }

      return res.status(200).send({
       message: "Successfully fetched item.",
       data: workday
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
};