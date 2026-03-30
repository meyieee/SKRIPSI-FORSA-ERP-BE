const Colour = require("../models/adm_cf_20_colour")
const { Op } = require("sequelize");
const { getAttributeEmployeeFullName } = require('../../function/getIncludeAtributes')
const { getModelEmployeeRegister } = require('../../function/getIncludeModels')
const { socketEmitGlobal } = require('../../function/socketEmit')

module.exports = {
  functionGetColour: async () => {
    const results = await Colour.findAll({
      include: [getModelEmployeeRegister()],
      attributes: {
        include: [
          [getAttributeEmployeeFullName(), 'reg_by'],
        ],
      }
    })

    return results;
  },

  postColour: async (req, res) => {
    try {
      const { colour, reg_by, status, remarks } = req.body;
      const getColour = await Colour.findOne({ where: { colour } })
      if(getColour) {
        return res.status(409).send({
          message: "Item already exists.",
        });
      }

      await Colour.create({
        colour, reg_by,	status,	remarks, status_date: new Date()
      });

      socketEmitGlobal('change-colour-data', await module.exports.functionGetColour())

      return res.status(200).send({
        message: "Colour was successfully added",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  postBatchColour: async (req, res) => {
    try {
      const array = req.body; // Array of objects

      // Check for duplicate codes in the input array
      const codes = array.map(row => row.colour);
      const uniqueCodes = [...new Set(codes)];
      if (codes.length !== uniqueCodes.length) {
        return res.status(409).send({
          message: "Duplicate codes found in the input array.",
        });
      }

      const existingRows = await Colour.findAll({ where: { colour: { [Op.in]: codes } } });

      // Check for redundancy
      const existingCodes = existingRows.map(row => row.colour);
      const duplicateCodes = array.filter(row => existingCodes.includes(row.colour));

      if (duplicateCodes.length > 0) {
        return res.status(409).send({
          message: `Codes already exist: ${duplicateCodes.map(row => row.colour).join(', ')}`,
        });
      }

      // If no duplicates, create data
      await Colour.bulkCreate(array.map(row => ({
        colour: row.colour,
        reg_by: row.reg_by,
        status: row.status,
        remarks: row.remarks,
        status_date: new Date(),
      })));

      // Included socket for batch creating data
      socketEmitGlobal('change-colour-data', await module.exports.functionGetColour())

      return res.status(200).send({
        message: "Successfully created data.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateColour: async (req, res) => {
    try {
      const { colour, reg_by, status, remarks } = req.body;
      const { id } = req.params;
      
      const findExistingColour = await Colour.findOne({
        where: { 
          colour: colour,
          [Op.not] : {
            id : id
          }
         },
      });

      if(findExistingColour) {
        return res.status(409).send({
          message: "Item already exists.",
        });
      }

      const findColour = await Colour.findOne({
        where: { id: id },
      });

      if(!findColour) {
        return res.status(404).send({
          message: "Item is not defined.",
        });
      }

      await Colour.update({
        colour, reg_by, status, remarks,
      }, { where: { id: id } });

      socketEmitGlobal('change-colour-data', await module.exports.functionGetColour())

      return res.status(200).send({
        message: "Successfully updated item.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateStatusColour: async (req, res) => {
    try {
      const { reg_by, status, remarks } = req.body;
      const { id } = req.params;
      const findColour = await Colour.findOne({
        where: { id: id },
      });

      if(!findColour) {
        return res.status(404).send({
          message: "Colour is not defined",
        });
      }

      function handleStatus() {
        if(status != findColour._previousDataValues.status) {
          return new Date()
        }
      }

      await Colour.update({
        reg_by, status, status_date: handleStatus(), remarks
      }, { where: { id: id } });

      socketEmitGlobal('change-colour-data', await module.exports.functionGetColour())

      return res.status(200).send({
        message: "Successfully updated item status.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getAllColour: async (req, res) => {
    try {
      const colour = await module.exports.functionGetColour()

      if(!colour) {
        return res.status(404).send({
          message: "Data not found.",
        });
      }

      return res.status(200).send({
        message: "Successfully fetched data.",
        data: colour
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
};