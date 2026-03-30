const YearExp = require("../models/emp_cf_rec_03_yearexp")
const {io} = require('../../config/socketapi');
const { Op } = require("sequelize");
const { getAttributeEmployeeFullName } = require('../../function/getIncludeAtributes')
const { getModelEmployeeRegister } = require('../../function/getIncludeModels')

module.exports = {
  functionGetYearExp: async () => {
    const results = await YearExp.findAll({
      order: [
        ['year_exp_code', 'ASC']
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

  postYearExp: async (req, res) => {
    try {
      const { year_exp_code,	year_exp_description, status, reg_by } = req.body;
      const getYearExp = await YearExp.findOne({where: { year_exp_code: year_exp_code }})
      if(getYearExp !== null) {
        return res.status(409).send({
          message: "Year exp code already exists.",
        });
      }

      await YearExp.create({
        year_exp_code,	year_exp_description, reg_by, status
      });

      io.emit('change-yearexp-data', await module.exports.functionGetYearExp())

      return res.status(200).send({
        message: "Successfully added year exp.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  postBatchYearExp: async (req, res) => {
    try {
      const array = req.body; // Array of objects

      // Check for duplicate codes in the input array
      const codes = array.map(row => row.year_exp_code);
      const uniqueCodes = [...new Set(codes)];
      if (codes.length !== uniqueCodes.length) {
        return res.status(409).send({
          message: "Duplicate codes found in the input array.",
        });
      }

      const existingRows = await YearExp.findAll({ where: { year_exp_code: { [Op.in]: codes } } });

      // Check for redundancy
      const existingCodes = existingRows.map(row => row.year_exp_code);
      const duplicateCodes = array.filter(row => existingCodes.includes(row.year_exp_code));

      if (duplicateCodes.length > 0) {
        return res.status(409).send({
          message: `Codes already exist: ${duplicateCodes.map(row => row.year_exp_code).join(', ')}`,
        });
      }

      // If no duplicates, create data
      await YearExp.bulkCreate(array.map(row => ({
        year_exp_code: row.year_exp_code,
        year_exp_description: row.year_exp_description,
        reg_by: row.reg_by,
        status: row.status,
        remarks: row.remarks,
        status_date: new Date(),
      })));

      // Included socket for batch creating data
      io.emit('change-yearexp-data', await module.exports.functionGetYearExp())

      return res.status(200).send({
        message: "Successfully created data.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateYearExp: async (req, res) => {
    try {
      const { year_exp_code,	year_exp_description, reg_by } = req.body;
      const { id } = req.params;

      const getExistYearExpCode = await YearExp.findOne({where: { year_exp_code: year_exp_code, [Op.not]: {id} }})
      if(getExistYearExpCode !== null) {
        return res.status(409).send({
          message: "Year exp code already exists.",
        });
      }

      const findYearExp = await YearExp.findOne({
        where: { id: id },
      });
      
      if(findYearExp === null) {
        return res.status(404).send({
          message: "Cannot find item.",
        });
      }

      await YearExp.update({
        year_exp_code, year_exp_description, reg_by
      },{ where: { id: id } });

      io.emit('change-yearexp-data', await module.exports.functionGetYearExp())

      return res.status(201).send({
        message: "Successfully updated item.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateStatusYearExp: async (req, res) => {
    try {
      const { reg_by, status, remarks } = req.body;
      const { id } = req.params;
      const findYearExp = await YearExp.findOne({
        where: { id: id },
      });

      if(findYearExp === null) {
        return res.status(404).send({
          message: "Cannot find item.",
        });
      }

      function handleStatus () {
        if(status != findYearExp._previousDataValues.status ) {
          return new Date()
        }
      }

      await YearExp.update({
        reg_by, status, status_date: handleStatus(), remarks
      }, { where: { id: id } });

      io.emit('change-yearexp-data', await module.exports.functionGetYearExp())
      return res.status(200).send({
        message: "Successfully updated item status.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getAllYearExp: async (req, res) => {
    try {
      const yearexp = await module.exports.functionGetYearExp()
      if(yearexp === null) {
        return res.status(404).send({
          message: "Cannot find function data.",
        });
      }
      return res.status(200).send({
       message: "Successfully fetched function data.",
       data: yearexp
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getYearExp: async (req, res) => {
    try {
      const { id } = req.params
      const yearexp = await YearExp.findOne({ where: { id: id } });
      if(yearexp === null) {
        return res.status(404).send({
          message: "Cannot find item",
        });
      }

      return res.status(200).send({
       message: "Successfully fetched item.",
       data: yearexp
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
};