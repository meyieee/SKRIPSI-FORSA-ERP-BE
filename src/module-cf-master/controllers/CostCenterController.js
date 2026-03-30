const CostCenter = require("../models/adm_cf_13_costcenter");
const { Op } = require('sequelize')
const { getAttributeEmployeeFullName } = require('../../function/getIncludeAtributes')
const { getModelEmployeeRegister } = require('../../function/getIncludeModels')
const { socketEmitGlobal } = require('../../function/socketEmit')

module.exports = {
  functionGetCostCenter: async () => {
    const results = await CostCenter.findAll({
      order: [
        ['c_code', 'ASC'],
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

  postCostCenter: async (req, res) => {
    try {
      const { c_code,	c_des,	reg_by,	status,	remarks } = req.body;

      const getCostCenter = await CostCenter.findOne({
        where: { c_code: c_code }
      })

      if(getCostCenter) {
        return res.status(409).send({
          message: "Code already exists.",
        });
      }
        
      await CostCenter.create({
        c_code,	c_des,	reg_by,	status,	remarks, status_date: new Date()
      });
        
      // Set up socket
      socketEmitGlobal('change-costcenter-data', await module.exports.functionGetCostCenter())
      
      return res.status(200).send({
        message: "Successfully created cost center.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  postBatchCostCenter: async (req, res) => {
    try {
      const array = req.body; // Array of objects

      // Check for duplicate codes in the input array
      const codes = array.map(row => row.c_code);
      const uniqueCodes = [...new Set(codes)];
      if (codes.length !== uniqueCodes.length) {
        return res.status(409).send({
          message: "Duplicate codes found in the input array.",
        });
      }

      const existingRows = await CostCenter.findAll({ where: { c_code: { [Op.in]: codes } } });

      // Check for redundancy
      const existingCodes = existingRows.map(row => row.c_code);
      const duplicateCodes = array.filter(row => existingCodes.includes(row.c_code));

      if (duplicateCodes.length > 0) {
        return res.status(409).send({
          message: `Codes already exist: ${duplicateCodes.map(row => row.c_code).join(', ')}`,
        });
      }

      // If no duplicates, create data
      await CostCenter.bulkCreate(array.map(row => ({
        c_code: row.c_code,
        c_des: row.c_des,
        reg_by: row.reg_by,
        status: row.status,
        remarks: row.remarks,
        status_date: new Date(),
      })));

      // Included socket for batch creating data
      socketEmitGlobal('change-costcenter-data', await module.exports.functionGetCostCenter())

      return res.status(200).send({
        message: "Successfully created data.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateCostCenter: async (req, res) => {
    try {
      const { c_code,	c_des,	reg_by,	status,	remarks } = req.body;

      const { id } = req.params;
              
      const getExist = await CostCenter.findOne({
        where: { c_code, [Op.not]: {id} }
      })

      if(getExist) {
        return res.status(409).send({
          message: "Item already exists.",
        });
      }
      
      const findCostCenter = await CostCenter.findOne({
        where: { id: id },
      });

      if(findCostCenter) {
        function handleStatus () {
          if(status != findCostCenter._previousDataValues.status) {
            return new Date()
          }
        }
        
        await CostCenter.update({
          c_code,	c_des,	reg_by,	status,	remarks, status_date: handleStatus()
        }, { where: { id: id } });

        // Set up socket
        socketEmitGlobal('change-costcenter-data', await module.exports.functionGetCostCenter())

        return res.status(201).send({
          message: "Successfully updated item.",
        });
      }
      else if(!findCostCenter) {
        return res.status(404).send({
          message: "Cannot find item.",
        });
      }
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateStatusCostCenter: async (req, res) => {
    try {
      const { status, reg_by, remarks } = req.body;
      const { id } = req.params;
        
      const findCostCenter = await CostCenter.findOne({
        where: { id: id },
      });

      if(findCostCenter) {
        function handleStatus() {
          if(status != findCostCenter._previousDataValues.status) {
            return new Date()
          }
        }

        await CostCenter.update({
          status, reg_by, status_date: handleStatus(), remarks
        }, { where: { id: id } });

        // Set up socket io
        socketEmitGlobal('change-costcenter-data', await module.exports.functionGetCostCenter())

        return res.status(200).send({
          message: "Successfully updated item status.",
        });
      }
      else if(!findCostCenter) {
        return res.status(404).send({
          message: "Cannot find item.",
        });
      }
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  }, 

  getAllCostCenter: async (req, res) => {
    try {
      const costCenter = await module.exports.functionGetCostCenter()
      
      if(costCenter.length === 0 || !costCenter) {
        return res.status(404).send({
          message: "Data is empty.",
        });
      }

      return res.status(200).send({
        message: "Successfully fetched data.",
        data: costCenter
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getCostCenter: async (req, res) => {
    try {
      const { id } = req.params
      const costCenter = await CostCenter.findOne({ where: { id: id } });
      if(!costCenter) {
        return res.status(404).send({
          message: "Item doesn't exist.",
        });
      }
      
      return res.status(200).send({
        message: "Successfully fetched item.",
        data: costCenter
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
};