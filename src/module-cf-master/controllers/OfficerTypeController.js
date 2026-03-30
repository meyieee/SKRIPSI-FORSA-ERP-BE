const OfficerType = require("../models/adm_cf_21_officertypes");
const { Op } = require("sequelize");
const { getAttributeEmployeeFullName } = require('../../function/getIncludeAtributes')
const { getModelEmployeeRegister } = require('../../function/getIncludeModels')
const { socketEmitGlobal } = require('../../function/socketEmit')

module.exports = {
  functionGetOfficerType: async () => {
    const results = await OfficerType.findAll({
      include: [getModelEmployeeRegister()],
      attributes: {
        include: [
          [getAttributeEmployeeFullName(), 'reg_by'],
        ],
      }
    });

    return results;
  },

  postOfficerType: async (req, res) => {
    try {
      const { officer_type, officer_type_name, remarks, reg_by, status } = req.body;
      
      const checkOfficerType = await OfficerType.findOne({
        where: {
          [Op.or]: [
            { officer_type: officer_type },
            { officer_type_name: officer_type_name },
          ],
        },
      });

      if (checkOfficerType) {
        return res.status(409).send({
          message: "officer type code or name already exists.",
        });
      }

      await OfficerType.create({ officer_type, officer_type_name, remarks, status, reg_by });

      // set up socket io
      socketEmitGlobal("change-officer-type-data", await module.exports.functionGetOfficerType());
      // end set up socket io

      return res.status(201).send({
        message: "officer type is successfully add",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  postBatchOfficerType: async (req, res) => {
    try {
      const array = req.body; // Array of objects

      // Check for duplicate codes in the input array
      const codes = array.map(row => row.officer_type);
      const uniqueCodes = [...new Set(codes)];
      if (codes.length !== uniqueCodes.length) {
        return res.status(409).send({
          message: "Duplicate codes found in the input array.",
        });
      }

      const existingRows = await OfficerType.findAll({ where: { officer_type: { [Op.in]: codes } } });

      // Check for redundancy
      const existingCodes = existingRows.map(row => row.officer_type);
      const duplicateCodes = array.filter(row => existingCodes.includes(row.officer_type));

      if (duplicateCodes.length > 0) {
        return res.status(409).send({
          message: `Codes already exist: ${duplicateCodes.map(row => row.officer_type).join(', ')}`,
        });
      }

      // If no duplicates, create data
      await OfficerType.bulkCreate(array.map(row => ({
        officer_type: row.officer_type,
        reg_by: row.reg_by,
        status: row.status,
        remarks: row.remarks,
        status_date: new Date(),
      })));

      // Included socket for batch creating data
      socketEmitGlobal("change-officer-type-data", await module.exports.functionGetOfficerType());

      return res.status(200).send({
        message: "Successfully created data.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateOfficerType: async (req, res) => {
    try {
      const { id } = req.params;
      const { officer_type_name, reg_by } = req.body;
      const checkExistOfficerType = await OfficerType.findOne({
        where: {
          id: id,
        },
      });

      if (!checkExistOfficerType) {
        return res.status(404).send({
          message: "ID is not defined.",
        });
      }

      const checkDuplicateOfficerType = await OfficerType.findOne({
        where: {
          officer_type_name,
          id: {
            [Op.not]: id,
          },
        },
      });

      if (checkDuplicateOfficerType) {
        return res.status(409).send({
          message: "Item already exists.",
        });
      }

      const updateTypeOfficer = await OfficerType.update({ officer_type_name, reg_by },{ where: { id: id } });

      if (updateTypeOfficer[0] == 1) {
        // set up socket io
        socketEmitGlobal("change-officer-type-data", await module.exports.functionGetOfficerType());
        // end set up socket io
        return res.status(201).send({
          message: "Successfully updated item.",
        });
      } else {
        return res.status(404).send({
          message: "Item doesn't exist.",
        });
      }
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateStatusOfficerType: async (req, res) => {
    try {
      const { id } = req.params;
      const { remarks, reg_by, status } = req.body;
      const findOfficerType = await OfficerType.findOne({ where: { id } });

      if(findOfficerType) {
        function handleStatusDate() {
          if (status != findOfficerType._previousDataValues.status.toString()) {
            return new Date();
          }
        }

        await OfficerType.update(
          { remarks, reg_by, status, status_date: handleStatusDate() },
          { where: { id: id } }
        );

        // set up socket io
        const result = await OfficerType.findOne({where: { id }});

        socketEmitGlobal("change-one-officer-type-data", result);
        socketEmitGlobal("change-officer-type-data", await module.exports.functionGetOfficerType());
        // end set up socket io

        return res.status(201).send({
          message: "Successfully updated item status.",
        });
      } else if (!findOfficer) {
        return res.status(404).send({
          message: "Item doesn't exist.",
        });
      }
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getAllOfficerType: async (req, res) => {
    try {
      const data = await module.exports.functionGetOfficerType()
      
      if (!data) {
        return res.status(404).send({
          message: "Data not found.",
        });
      }
 
      return res.status(201).send({
        message: "Successfully fetched data.",
        data,
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
}