const Education = require("../models/emp_cf_rec_01_education")
const {io} = require('../../config/socketapi');
const { Op } = require("sequelize");
const { getAttributeEmployeeFullName } = require('../../function/getIncludeAtributes')
const { getModelEmployeeRegister } = require('../../function/getIncludeModels')

module.exports = {
  functionGetEducation: async () => {
    const results = await Education.findAll({
      order: [
        ['seq', 'ASC'],
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

  postEducation: async (req, res) => {
    try {
      const { edu,	edu_description, seq, work_group, status, reg_by } = req.body;
      const getEducation = await Education.findOne({where: { edu: edu }})
      if(getEducation !== null) {
        return res.status(409).send({
          message: "Education code already exists.",
        });
      }

      await Education.create({
        edu,	edu_description, seq, work_group, reg_by, status
      });

      io.emit('change-education-data', await module.exports.functionGetEducation())

      return res.status(200).send({
        message: "Successfully added education.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  postBatchEducation: async (req, res) => {
    try {
      const array = req.body; // Array of objects

      // Check for duplicate codes in the input array
      const codes = array.map(row => row.edu);
      const uniqueCodes = [...new Set(codes)];
      if (codes.length !== uniqueCodes.length) {
        return res.status(409).send({
          message: "Duplicate codes found in the input array.",
        });
      }

      const existingRows = await Education.findAll({ where: { edu: { [Op.in]: codes } } });

      // Check for redundancy
      const existingCodes = existingRows.map(row => row.edu);
      const duplicateCodes = array.filter(row => existingCodes.includes(row.edu));

      if (duplicateCodes.length > 0) {
        return res.status(409).send({
          message: `Codes already exist: ${duplicateCodes.map(row => row.edu).join(', ')}`,
        });
      }

      // If no duplicates, create data
      await Education.bulkCreate(array.map(row => ({
        edu: row.edu,
        edu_description: row.edu_description,
        seq: row.seq,
        work_group: row.work_group,
        reg_by: row.reg_by,
        status: row.status,
        remarks: row.remarks,
        status_date: new Date(),
      })));

      // Included socket for batch creating data
      io.emit('change-education-data', await module.exports.functionGetEducation())

      return res.status(200).send({
        message: "Successfully created data.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateEducation: async (req, res) => {
    try {
      const { edu,	edu_description, seq, work_group, reg_by } = req.body;
      const { id } = req.params;

      const getExistEducationCode = await Education.findOne({where: { edu: edu, [Op.not]: {id} }})
      if(getExistEducationCode !== null) {
        return res.status(409).send({
          message: "Education code already exists.",
        });
      }

      const findEducation = await Education.findOne({
        where: { id: id },
      });
      
      if(findEducation === null) {
        return res.status(404).send({
          message: "Cannot find item.",
        });
      }

      await Education.update({
        edu, edu_description, seq, work_group, reg_by
      },{ where: { id: id } });

      io.emit('change-education-data', await module.exports.functionGetEducation())

      return res.status(201).send({
        message: "Successfully updated item.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateStatusEducation: async (req, res) => {
    try {
      const { reg_by, status, remarks } = req.body;
      const { id } = req.params;
      const findEducation = await Education.findOne({
        where: { id: id },
      });

      if(findEducation === null) {
        return res.status(404).send({
          message: "Cannot find item.",
        });
      }

      function handleStatus () {
        if(status != findEducation._previousDataValues.status ) {
          return new Date()
        }
      }

      await Education.update({
        reg_by, status, status_date: handleStatus(), remarks
      }, { where: { id: id } });

      io.emit('change-education-data', await module.exports.functionGetEducation())
      
      return res.status(200).send({
        message: "Successfully updated item status.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getAllEducation: async (req, res) => {
    try {
      const education = await module.exports.functionGetEducation()

      if(education === null) {
        return res.status(404).send({
          message: "Cannot find function data.",
        });
      }
      return res.status(200).send({
       message: "Successfully fetched function data.",
       data: education
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getEducation: async (req, res) => {
    try {
      const { id } = req.params
      const education = await Education.findOne({ where: { id: id } });
      if(education === null) {
        return res.status(404).send({
          message: "Cannot find item",
        });
      }

      return res.status(200).send({
       message: "Successfully fetched item.",
       data: education
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
};