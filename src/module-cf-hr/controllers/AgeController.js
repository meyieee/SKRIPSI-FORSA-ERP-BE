const Age = require("../models/emp_cf_rec_04_age")
const {io} = require('../../config/socketapi');
const { Op } = require("sequelize");
const { getAttributeEmployeeFullName } = require('../../function/getIncludeAtributes')
const { getModelEmployeeRegister } = require('../../function/getIncludeModels')

module.exports = {
  functionGetAge: async () => {
    const results = await Age.findAll({
      order: [
        ['age_code', 'ASC']
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

  postAge: async (req, res) => {
    try {
      const { age_code,	age_description, status, reg_by } = req.body;
      const getAge = await Age.findOne({ where: { age_code: age_code } })
      if(getAge !== null) {
        return res.status(409).send({
          message: "Age code already exists.",
        });
      }

      await Age.create({
        age_code,	age_description, reg_by, status
      });

      io.emit('change-age-data',  await module.exports.functionGetAge())

      return res.status(200).send({
        message: "Successfully added age.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  postBatchAge: async (req, res) => {
    try {
      const array = req.body; // Array of objects

      // Check for duplicate codes in the input array
      const codes = array.map(row => row.age_code);
      const uniqueCodes = [...new Set(codes)];
      if (codes.length !== uniqueCodes.length) {
        return res.status(409).send({
          message: "Duplicate codes found in the input array.",
        });
      }

      const existingRows = await Age.findAll({ where: { age_code: { [Op.in]: codes } } });

      // Check for redundancy
      const existingCodes = existingRows.map(row => row.age_code);
      const duplicateCodes = array.filter(row => existingCodes.includes(row.age_code));

      if (duplicateCodes.length > 0) {
        return res.status(409).send({
          message: `Codes already exist: ${duplicateCodes.map(row => row.age_code).join(', ')}`,
        });
      }

      // If no duplicates, create data
      await Age.bulkCreate(array.map(row => ({
        age_code: row.age_code,
        age_description: row.age_description,
        reg_by: row.reg_by,
        status: row.status,
        remarks: row.remarks,
        status_date: new Date(),
      })));

      // Included socket for batch creating data
      io.emit('change-age-data', await module.exports.functionGetAge())

      return res.status(200).send({
        message: "Successfully created data.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateAge: async (req, res) => {
    try {
      const { age_code,	age_description, reg_by } = req.body;
      const { id } = req.params;

      const getExistAgeCode = await Age.findOne({ where: { age_code: age_code, [Op.not]: {id} } })
      if(getExistAgeCode !== null) {
        return res.status(409).send({
          message: "Age code already exists.",
        });
      }

      const findAge = await Age.findOne({
        where: { id: id },
      });
      
      if(findAge === null) {
        return res.status(404).send({
          message: "Cannot find item.",
        });
      }

      await Age.update({
        age_code, age_description, reg_by
      }, { where: { id: id } });

      io.emit('change-age-data',  await module.exports.functionGetAge())

      return res.status(201).send({
        message: "Successfully updated item.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateStatusAge: async (req, res) => {
    try {
      const { reg_by, status, remarks } = req.body;
      const { id } = req.params;

      const findAge = await Age.findOne({
        where: { id: id },
      });

      if(findAge === null) {
        return res.status(404).send({
          message: "Cannot find item.",
        });
      }

      function handleStatus() {
        if(status != findAge._previousDataValues.status) {
          return new Date()
        }
      }

      await Age.update({
        reg_by, status, status_date: handleStatus(), remarks
      }, { where: { id: id } });

      io.emit('change-age-data', await module.exports.functionGetAge())

      return res.status(200).send({
        message: "Successfully updated item status.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getAllAge: async (req, res) => {
    try {
      const age = await module.exports.functionGetAge()

      if(!age) {
        return res.status(404).send({
          message: "Cannot find function data.",
        });
      }

      return res.status(200).send({
       message: "Successfully fetched function data.",
       data: age
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getAge: async (req, res) => {
    try {
      const { id } = req.params
      const age = await Age.findOne({ where: { id: id } });
      
      if(age === null) {
        return res.status(404).send({
          message: "Cannot find item",
        });
      }

      return res.status(200).send({
       message: "Successfully fetched item.",
       data: age
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
};