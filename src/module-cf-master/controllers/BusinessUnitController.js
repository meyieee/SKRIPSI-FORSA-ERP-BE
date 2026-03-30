const BusinessUnit = require("../models/adm_cf_12_bu");
const { io } = require("../../config/socketapi");
const { Op } = require("sequelize");
const { getAttributeEmployeeFullName } = require('../../function/getIncludeAtributes')
const { getModelEmployeeRegister } = require('../../function/getIncludeModels')

module.exports = {
  functionGetBusinessUnit: async () => {
    const results = await BusinessUnit.findAll({
      order: [["bu_code", "ASC"]],
      include: [getModelEmployeeRegister()],
      attributes: {
        include: [
          [getAttributeEmployeeFullName(), 'reg_by'],
        ],
      }
    });

    return results;
  },

  postBusinessUnit: async (req, res) => {
    try {
      const { bu_code, bu_des, reg_by, status, remarks } = req.body;

      const getBusinessUnit = await BusinessUnit.findOne({
        where: { bu_code: bu_code },
      });

      if (getBusinessUnit !== null) {
        return res.status(409).send({
          message: "business code already exist",
        });
      }
      await BusinessUnit.create({
        bu_code,
        bu_des,
        reg_by,
        status,
        remarks,
        status_date: new Date(),
      });

      io.emit("change-businessunit-data", await module.exports.functionGetBusinessUnit());

      return res.status(201).send({
        message: "BusinessUnit was successfully added",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  postBatchBusinessUnit: async (req, res) => {
    try {
      const array = req.body; // Array of objects

      // Check for duplicate codes in the input array
      const codes = array.map(row => row.bu_code);
      const uniqueCodes = [...new Set(codes)];
      if (codes.length !== uniqueCodes.length) {
        return res.status(409).send({
          message: "Duplicate codes found in the input array.",
        });
      }

      const existingRows = await BusinessUnit.findAll({ where: { bu_code: { [Op.in]: codes } } });

      // Check for redundancy
      const existingCodes = existingRows.map(row => row.bu_code);
      const duplicateCodes = array.filter(row => existingCodes.includes(row.bu_code));

      if (duplicateCodes.length > 0) {
        return res.status(409).send({
          message: `Codes already exist: ${duplicateCodes.map(row => row.bu_code).join(', ')}`,
        });
      }

      // If no duplicates, create data
      await BusinessUnit.bulkCreate(array.map(row => ({
        bu_code: row.bu_code,
        bu_des: row.bu_des,
        reg_by: row.reg_by,
        status: row.status,
        remarks: row.remarks,
        status_date: new Date(),
      })));

      // Included socket for batch creating data
      io.emit("change-businessunit-data", await module.exports.functionGetBusinessUnit());

      return res.status(200).send({
        message: "Successfully created data.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateBusinessUnit: async (req, res) => {
    try {
      const { bu_code, bu_des, reg_by, status, remarks } = req.body;
      const { id } = req.params;

      const getExist = await BusinessUnit.findOne({
        where: {
          bu_code: bu_code,
          id: { [Op.not]: id },
        },
      });
      if (getExist) {
        return res.status(409).send({
          message: "BusinessUnit code has been exist",
        });
      }

      const findBusinessUnit = await BusinessUnit.findOne({
        where: { id: id },
      });

      if (findBusinessUnit === null) {
        return res.status(404).send({
          message: "BusinessUnit was not found",
        });
      }

      function handleStatus() {
        if (status != findBusinessUnit._previousDataValues.status) {
          return new Date();
        }
      }
      await BusinessUnit.update(
        {
          bu_code,
          bu_des,
          reg_by,
          status,
          remarks,
          status_date: handleStatus(),
        },
        { where: { id: id } },
      );

      io.emit("change-businessunit-data", await module.exports.functionGetBusinessUnit());

      return res.status(201).send({
        message: "BusinessUnit was successfully update",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateStatusBusinessUnit: async (req, res) => {
    try {
      const { status, reg_by, remarks } = req.body;
      const { id } = req.params;
      const findBusinessUnit = await BusinessUnit.findOne({
        where: { id: id },
      });

      if (findBusinessUnit === null) {
        return res.status(404).send({
          message: "BusinessUnit is not found",
        });
      }
      function handleStatus() {
        if (status != findBusinessUnit._previousDataValues.status) {
          return new Date();
        }
      }

      await BusinessUnit.update(
        {
          remarks,
          status,
          reg_by,
          status_date: handleStatus(),
        },
        { where: { id: id } },
      );

      io.emit("change-businessunit-data", await module.exports.functionGetBusinessUnit());

      return res.status(200).send({
        message: "BusinessUnit Status was successfully update",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  deleteBusinessUnit: async (req, res) => {
    try {
      const { id } = req.params;
      await BusinessUnit.destroy({ where: { id } });
      io.emit("change-businessunit-data", await module.exports.functionGetBusinessUnit());

      return res.status(200).send({
        message: "BusinessUnit was successfully delete",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getAllBusinessUnit: async (req, res) => {
    try {
      const businessUnit = await module.exports.functionGetBusinessUnit()
      if (businessUnit === null) {
        return res.status(404).send({
          message: "BusinessUnit was not found",
        });
      }
      return res.status(200).send({
        message: "BusinessUnit was successfully get",
        data: businessUnit,
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getBusinessUnit: async (req, res) => {
    try {
      const { id } = req.params;
      const businessUnit = await BusinessUnit.findOne({ where: { id: id } });
      if (businessUnit === null) {
        return res.status(404).send({
          message: "BusinessUnit is not found",
        });
      }
      return res.status(200).send({
        message: "BusinessUnit was successfully get",
        data: businessUnit,
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
};