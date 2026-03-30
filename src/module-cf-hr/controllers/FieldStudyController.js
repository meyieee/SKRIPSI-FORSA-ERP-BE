const FieldStudy = require("../models/emp_cf_rec_02_fieldstudy")
const {io} = require('../../config/socketapi');
const { Op } = require("sequelize");
const { getAttributeEmployeeFullName } = require('../../function/getIncludeAtributes')
const { getModelEmployeeRegister } = require('../../function/getIncludeModels')

module.exports = {
  functionGetFieldStudy: async () => {
    const results = await FieldStudy.findAll({
      order: [
        ['field_study', 'ASC']
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

  postFieldStudy: async (req, res) => {
    try {
      const { field_study,	field_study_description, discipline, status, reg_by } = req.body;
      const getFieldStudy = await FieldStudy.findOne({where: { field_study: field_study }})
      if(getFieldStudy !== null) {
        return res.status(409).send({
          message: "Field study code already exists.",
        });
      }

      await FieldStudy.create({
        field_study,	field_study_description, discipline, reg_by, status
      });

      io.emit('change-fieldstudy-data', await module.exports.functionGetFieldStudy())

      return res.status(200).send({
        message: "Successfully added field study.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  postBatchFieldStudy: async (req, res) => {
    try {
      const array = req.body; // Array of objects

      // Check for duplicate codes in the input array
      const codes = array.map(row => row.field_study);
      const uniqueCodes = [...new Set(codes)];
      if (codes.length !== uniqueCodes.length) {
        return res.status(409).send({
          message: "Duplicate codes found in the input array.",
        });
      }

      const existingRows = await FieldStudy.findAll({ where: { field_study: { [Op.in]: codes } } });

      // Check for redundancy
      const existingCodes = existingRows.map(row => row.field_study);
      const duplicateCodes = array.filter(row => existingCodes.includes(row.field_study));

      if (duplicateCodes.length > 0) {
        return res.status(409).send({
          message: `Codes already exist: ${duplicateCodes.map(row => row.field_study).join(', ')}`,
        });
      }

      // If no duplicates, create data
      await FieldStudy.bulkCreate(array.map(row => ({
        field_study: row.field_study,
        field_study_description: row.field_study_description,
        discipline: row.discipline,
        reg_by: row.reg_by,
        status: row.status,
        remarks: row.remarks,
        status_date: new Date(),
      })));

      // Included socket for batch creating data
      io.emit('change-fieldstudy-data', await module.exports.functionGetFieldStudy())

      return res.status(200).send({
        message: "Successfully created data.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateFieldStudy: async (req, res) => {
    try {
      const { field_study,	field_study_description, discipline, reg_by } = req.body;
      const { id } = req.params;

      const getExistFieldStudyCode = await FieldStudy.findOne({where: { field_study: field_study, [Op.not]: {id} }})
      if(getExistFieldStudyCode !== null) {
        return res.status(409).send({
          message: "Field study code already exists.",
        });
      }

      const findFieldStudy = await FieldStudy.findOne({
        where: { id: id },
      });
      
      if(findFieldStudy === null) {
        return res.status(404).send({
          message: "Cannot find item.",
        });
      }

      await FieldStudy.update({
        field_study, field_study_description, discipline, reg_by
      },{ where: { id: id } });

      io.emit('change-fieldstudy-data', await module.exports.functionGetFieldStudy())

      return res.status(201).send({
        message: "Successfully updated item.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateStatusFieldStudy: async (req, res) => {
    try {
      const { reg_by, status, remarks } = req.body;
      const { id } = req.params;
      const findFieldStudy = await FieldStudy.findOne({
        where: { id: id },
      });

      if(findFieldStudy === null) {
        return res.status(404).send({
          message: "Cannot find item.",
        });
      }

      function handleStatus () {
        if(status != findFieldStudy._previousDataValues.status ) {
          return new Date()
        }
      }

      await FieldStudy.update({
        reg_by, status, status_date: handleStatus(), remarks
      }, { where: { id: id } });

      io.emit('change-fieldstudy-data', await module.exports.functionGetFieldStudy())
      return res.status(200).send({
        message: "Successfully updated item status.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getAllFieldStudy: async (req, res) => {
    try {
      const fieldstudy = await module.exports.functionGetFieldStudy()
      if(fieldstudy === null) {
        return res.status(404).send({
          message: "Cannot find function data.",
        });
      }
      return res.status(200).send({
       message: "Successfully fetched function data.",
       data: fieldstudy
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getFieldStudy: async (req, res) => {
    try {
      const { id } = req.params
      const fieldstudy = await FieldStudy.findOne({ where: { id: id } });
      if(fieldstudy === null) {
        return res.status(404).send({
          message: "Cannot find item",
        });
      }

      return res.status(200).send({
       message: "Successfully fetched item.",
       data: fieldstudy
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
};