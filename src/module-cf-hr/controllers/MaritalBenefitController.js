const MaritalBenefit = require("../models/emp_cf_cb_maritals")
const { Op } = require("sequelize");
const { getAttributeEmployeeFullName } = require('../../function/getIncludeAtributes')
const { getModelEmployeeRegister } = require('../../function/getIncludeModels')
const { socketEmitGlobal } = require('../../function/socketEmit')

module.exports = {
  functionGetMaritalBenefit: async () => {
    const results = await MaritalBenefit.findAll({
      order: [
        ['marital_benefit', 'ASC']
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

  postMaritalBenefit: async (req, res) => {
    try {
      const { marital_benefit,marital_benefit_des, status, reg_by } = req.body;
      const getMaritalBenefit = await MaritalBenefit.findOne({where: { marital_benefit: marital_benefit }})
      if(getMaritalBenefit !== null) {
        return res.status(409).send({
          message: "Marital code already exists.",
        });
      }

      await MaritalBenefit.create({ marital_benefit,	marital_benefit_des, reg_by, status });

      socketEmitGlobal('change-maritalbenefit-data', await module.exports.functionGetMaritalBenefit())

      return res.status(200).send({
        message: "Successfully added marital benefit.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  postBatchMaritalBenefit: async (req, res) => {
    try {
      const array = req.body; // Array of objects

      // Check for duplicate codes in the input array
      const codes = array.map(row => row.marital_benefit);
      const uniqueCodes = [...new Set(codes)];
      if (codes.length !== uniqueCodes.length) {
        return res.status(409).send({
          message: "Duplicate codes found in the input array.",
        });
      }

      const existingRows = await MaritalBenefit.findAll({ where: { marital_benefit: { [Op.in]: codes } } });

      // Check for redundancy
      const existingCodes = existingRows.map(row => row.marital_benefit);
      const duplicateCodes = array.filter(row => existingCodes.includes(row.marital_benefit));

      if (duplicateCodes.length > 0) {
        return res.status(409).send({
          message: `Codes already exist: ${duplicateCodes.map(row => row.marital_benefit).join(', ')}`,
        });
      }

      // If no duplicates, create data
      await MaritalBenefit.bulkCreate(array.map(row => ({
        marital_benefit: row.marital_benefit,
        marital_benefit_des: row.marital_benefit_des,
        reg_by: row.reg_by,
        status: row.status,
        remarks: row.remarks,
        status_date: new Date(),
      })));

      // Included socket for batch creating data
      socketEmitGlobal('change-maritalbenefit-data', await module.exports.functionGetMaritalBenefit())

      return res.status(200).send({
        message: "Successfully created data.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateMaritalBenefit: async (req, res) => {
    try {
      const { marital_benefit, marital_benefit_des, reg_by } = req.body;
      const { id } = req.params;

      const getExistMaritalBenefitCode = await MaritalBenefit.findOne({where: { marital_benefit: marital_benefit, [Op.not]: {id} }})
      if(getExistMaritalBenefitCode !== null) {
        return res.status(409).send({
          message: "Marital code already exists.",
        });
      }

      const findMaritalBenefit = await MaritalBenefit.findOne({where: { id}});
      if(findMaritalBenefit === null) {
        return res.status(404).send({
          message: "Cannot find item.",
        });
      }

      await MaritalBenefit.update({marital_benefit, marital_benefit_des, reg_by},{ where: { id: id } });

      socketEmitGlobal('change-maritalbenefit-data', await module.exports.functionGetMaritalBenefit())

      return res.status(201).send({
        message: "Successfully updated marital benefit.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateStatusMaritalBenefit: async (req, res) => {
    try {
      const { reg_by, status, remarks } = req.body;
      const { id } = req.params;
      const findMaritalBenefit = await MaritalBenefit.findOne({
        where: { id: id },
      });

      if(findMaritalBenefit === null) {
        return res.status(404).send({
          message: "Cannot find item.",
        });
      }

      function handleStatus () {
        if(status != findMaritalBenefit._previousDataValues.status ) {
          return new Date()
        }
      }

      await MaritalBenefit.update({
        reg_by, status, status_date: handleStatus(), remarks
      }, { where: { id: id } });

      socketEmitGlobal('change-maritalbenefit-data', await module.exports.functionGetMaritalBenefit())
      return res.status(200).send({
        message: "Successfully updated item status.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getAllMaritalBenefit: async (req, res) => {
    try {
      const maritalbenefit = await module.exports.functionGetMaritalBenefit()
      if(maritalbenefit === null) {
        return res.status(404).send({
          message: "Cannot find marital benefit data.",
        });
      }
      return res.status(200).send({
       message: "Successfully fetched marital benefit data.",
       data: maritalbenefit
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getMaritalBenefit: async (req, res) => {
    try {
      const { id } = req.params
      const maritalbenefit = await MaritalBenefit.findOne({ where: { id: id } });
      if(maritalbenefit === null) {
        return res.status(404).send({
          message: "Cannot find item",
        });
      }

      return res.status(200).send({
       message: "Successfully fetched item.",
       data: maritalbenefit
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
};