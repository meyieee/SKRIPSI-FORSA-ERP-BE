const Level = require("../models/emp_cf_plan_c_level")
const {io} = require('../../config/socketapi');
const { Op } = require("sequelize");
const { getAttributeEmployeeFullName } = require('../../function/getIncludeAtributes')
const { getModelEmployeeRegister } = require('../../function/getIncludeModels')

module.exports = {
  functionGetLevel: async () => {
    const results = await Level.findAll({
      order: [
        ['level_code', 'ASC']
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

  postLevel: async (req, res) => {
    try {
      const { level_code,	level, level_description, management_type, level_short_des, status, reg_by } = req.body;
      const getLevel = await Level.findOne({where: { level_code: level_code }})
      if(getLevel !== null) {
        return res.status(409).send({
          message: "Level code already exists.",
        });
      }

      await Level.create({
        level_code,	level, level_description, management_type, level_short_des, reg_by, status
      });

      io.emit('change-level-data', await module.exports.functionGetLevel())

      return res.status(200).send({
        message: "Successfully added level.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  postBatchLevel: async (req, res) => {
    try {
      const array = req.body; // Array of objects

      // Check for duplicate codes in the input array
      const codes = array.map(row => row.level_code);
      const uniqueCodes = [...new Set(codes)];
      if (codes.length !== uniqueCodes.length) {
        return res.status(409).send({
          message: "Duplicate codes found in the input array.",
        });
      }

      const existingRows = await Level.findAll({ where: { level_code: { [Op.in]: codes } } });

      // Check for redundancy
      const existingCodes = existingRows.map(row => row.level_code);
      const duplicateCodes = array.filter(row => existingCodes.includes(row.level_code));

      if (duplicateCodes.length > 0) {
        return res.status(409).send({
          message: `Codes already exist: ${duplicateCodes.map(row => row.level_code).join(', ')}`,
        });
      }

      // If no duplicates, create data
      await Level.bulkCreate(array.map(row => ({
        level_code: row.level_code,
        level: row.level,
        level_description: row.level_description,
        management_type: row.management_type,
        level_short_des: row.level_short_des,
        reg_by: row.reg_by,
        status: row.status,
        remarks: row.remarks,
        status_date: new Date(),
      })));

      // Included socket for batch creating data
      io.emit('change-level-data', await module.exports.functionGetLevel())

      return res.status(200).send({
        message: "Successfully created data.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateLevel: async (req, res) => {
    try {
      const { level_code,	level, level_description, management_type, level_short_des, reg_by } = req.body;
      const { id } = req.params;

      const getExistLevelCode = await Level.findOne({where: { level_code: level_code, [Op.not]: {id} }})
      if(getExistLevelCode !== null) {
        return res.status(409).send({
          message: "Level code already exists.",
        });
      }

      const findLevel = await Level.findOne({
        where: { id: id },
      });
      
      if(findLevel === null) {
        return res.status(404).send({
          message: "Cannot find item.",
        });
      }

      await Level.update({
        level_code, level, level_description, management_type, level_short_des, reg_by
      },{ where: { id: id } });

      io.emit('change-level-data', await module.exports.functionGetLevel())

      return res.status(201).send({
        message: "Successfully updated level.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateStatusLevel: async (req, res) => {
    try {
      const { reg_by, status, remarks } = req.body;
      const { id } = req.params;
      const findLevel = await Level.findOne({
        where: { id: id },
      });

      if(findLevel === null) {
        return res.status(404).send({
          message: "Cannot find item.",
        });
      }

      function handleStatus () {
        if(status != findLevel._previousDataValues.status ) {
          return new Date()
        }
      }

      await Level.update({
        reg_by, status, status_date: handleStatus(), remarks
      }, { where: { id: id } });

      io.emit('change-level-data', await module.exports.functionGetLevel())
      return res.status(200).send({
        message: "Successfully updated item status.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getAllLevel: async (req, res) => {
    try {
      const level = await module.exports.functionGetLevel()
      if(level === null) {
        return res.status(404).send({
          message: "Cannot find level data.",
        });
      }
      return res.status(200).send({
       message: "Successfully fetched level data.",
       data: level
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getLevel: async (req, res) => {
    try {
      const { id } = req.params
      const level = await Level.findOne({ where: { id: id } });
      if(level === null) {
        return res.status(404).send({
          message: "Cannot find item",
        });
      }

      return res.status(200).send({
       message: "Successfully fetched item.",
       data: level
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
};