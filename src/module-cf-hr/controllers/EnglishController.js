const English = require("../models/emp_cf_rec_05_english")
const {io} = require('../../config/socketapi');
const { Op } = require("sequelize");
const { getAttributeEmployeeFullName } = require('../../function/getIncludeAtributes')
const { getModelEmployeeRegister } = require('../../function/getIncludeModels')

module.exports = {
  functionGetEnglish: async () => {
    const results = await English.findAll({
      order: [
        ['seq', 'ASC']
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

  postEnglish: async (req, res) => {
    try {
      const { english_code,	english_description, seq, status, reg_by } = req.body;
      const getEnglish = await English.findOne({where: { english_code: english_code }})
      if(getEnglish !== null) {
        return res.status(409).send({
          message: "English code already exists.",
        });
      }

      await English.create({
        english_code,	english_description, seq, reg_by, status
      });

      io.emit('change-english-data', await module.exports.functionGetEnglish())

      return res.status(200).send({
        message: "Successfully added english.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  postBatchEnglish: async (req, res) => {
    try {
      const array = req.body; // Array of objects

      // Check for duplicate codes in the input array
      const codes = array.map(row => row.english_code);
      const uniqueCodes = [...new Set(codes)];
      if (codes.length !== uniqueCodes.length) {
        return res.status(409).send({
          message: "Duplicate codes found in the input array.",
        });
      }

      const existingRows = await English.findAll({ where: { english_code: { [Op.in]: codes } } });

      // Check for redundancy
      const existingCodes = existingRows.map(row => row.english_code);
      const duplicateCodes = array.filter(row => existingCodes.includes(row.english_code));

      if (duplicateCodes.length > 0) {
        return res.status(409).send({
          message: `Codes already exist: ${duplicateCodes.map(row => row.english_code).join(', ')}`,
        });
      }

      // If no duplicates, create data
      await English.bulkCreate(array.map(row => ({
        english_code: row.english_code,
        english_description: row.english_description,
        seq: row.seq,
        reg_by: row.reg_by,
        status: row.status,
        remarks: row.remarks,
        status_date: new Date(),
      })));

      // Included socket for batch creating data
      io.emit('change-english-data', await module.exports.functionGetEnglish())

      return res.status(200).send({
        message: "Successfully created data.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateEnglish: async (req, res) => {
    try {
      const { english_code,	english_description, seq, reg_by } = req.body;
      const { id } = req.params;

      const getExistEnglishCode = await English.findOne({where: { english_code: english_code, [Op.not]: {id} }})
      if(getExistEnglishCode !== null) {
        return res.status(409).send({
          message: "English code already exists.",
        });
      }

      const findEnglish = await English.findOne({
        where: { id: id },
      });
      
      if(findEnglish === null) {
        return res.status(404).send({
          message: "Cannot find item.",
        });
      }

      await English.update({
        english_code, english_description, seq, reg_by
      },{ where: { id: id } });

      io.emit('change-english-data', await module.exports.functionGetEnglish())

      return res.status(201).send({
        message: "Successfully updated item.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateStatusEnglish: async (req, res) => {
    try {
      const { reg_by, status, remarks } = req.body;
      const { id } = req.params;
      const findEnglish = await English.findOne({
        where: { id: id },
      });

      if(findEnglish === null) {
        return res.status(404).send({
          message: "Cannot find item.",
        });
      }

      function handleStatus () {
        if(status != findEnglish._previousDataValues.status ) {
          return new Date()
        }
      }

      await English.update({
        reg_by, status, status_date: handleStatus(), remarks
      }, { where: { id: id } });

      io.emit('change-english-data', await module.exports.functionGetEnglish())
      return res.status(200).send({
        message: "Successfully updated item status.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getAllEnglish: async (req, res) => {
    try {
      const english = await module.exports.functionGetEnglish()
      if(english === null) {
        return res.status(404).send({
          message: "Cannot find function data.",
        });
      }
      return res.status(200).send({
       message: "Successfully fetched function data.",
       data: english
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getEnglish: async (req, res) => {
    try {
      const { id } = req.params
      const english = await English.findOne({ where: { id: id } });
      if(english === null) {
        return res.status(404).send({
          message: "Cannot find item",
        });
      }

      return res.status(200).send({
       message: "Successfully fetched item.",
       data: english
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
};