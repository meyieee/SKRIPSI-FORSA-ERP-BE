const LocOps = require("../models/adm_cf_16_locops")
const { Op } = require("sequelize");
const { getAttributeEmployeeFullName } = require('../../function/getIncludeAtributes')
const { getModelEmployeeRegister } = require('../../function/getIncludeModels')
const { socketEmitGlobal } = require('../../function/socketEmit')

module.exports = {
  functionGetLocOps: async () => {
    const results = await LocOps.findAll({
      order: [
        ['locops_code', 'ASC']
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
  postLocOps: async (req, res) => {
    try {
      const { locops_code,	locops_des, locwork_code, reg_by,	status } = req.body;

      const getLocOps = await LocOps.findOne({where: {locops_code: locops_code}})
      if(getLocOps) {
        return res.status(409).send({
          message: "Operation location code already exists",
        });
      }

      await LocOps.create({
        locops_code,	locops_des, locwork_code, reg_by,	status
      });
      
      // set up socket io
      socketEmitGlobal('change-locops-data', await module.exports.functionGetLocOps())
      // end set up socket 

      return res.status(200).send({
        message: "Successfully added item.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message })
    }
  },
  postBatchLocOps: async (req, res) => {
    try {
      const array = req.body; // Array of objects

      // Check for duplicate codes in the input array
      const codes = array.map(row => row.locops_code);
      const uniqueCodes = [...new Set(codes)];
      if (codes.length !== uniqueCodes.length) {
        return res.status(409).send({
          message: "Duplicate codes found in the input array.",
        });
      }

      const existingRows = await LocOps.findAll({ where: { locops_code: { [Op.in]: codes } } });

      // Check for redundancy
      const existingCodes = existingRows.map(row => row.locops_code);
      const duplicateCodes = array.filter(row => existingCodes.includes(row.locops_code));

      if (duplicateCodes.length > 0) {
        return res.status(409).send({
          message: `Codes already exist: ${duplicateCodes.map(row => row.locops_code).join(', ')}`,
        });
      }

      // If no duplicates, create data
      await LocOps.bulkCreate(array.map(row => ({
        locops_code: row.locops_code,
        locops_des: row.locops_des,
        locwork_code: row.locwork_code,
        reg_by: row.reg_by,
        status: row.status,
        remarks: row.remarks,
        status_date: new Date(),
      })));

      // Included socket for batch creating data
      socketEmitGlobal('change-locops-data', await module.exports.functionGetLocOps())

      return res.status(200).send({
        message: "Successfully created data.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
  updateLocOps: async (req, res) => {
    try {
      const { locops_code,	locops_des, locwork_code, reg_by } = req.body;
      const { id } = req.params;
      
      const findLocOpsbyCode = await LocOps.findOne({
        where: { 
          locops_code: locops_code,
          [Op.not]: { id: id }
        },
      });

      if(findLocOpsbyCode) {
        return res.status(404).send({
          message: "Item already exists",
        });
      }

      const findLocOps = await LocOps.findOne({
        where: { id: id },
      });
      
      if(findLocOps) {
        await LocOps.update({
          locops_code,	locops_des, locwork_code, reg_by
        },{ where: { id: id } });
            
        // set up socket io
        socketEmitGlobal('change-locops-data', await module.exports.functionGetLocOps())
        // end set up socket 

        return res.status(201).send({
          message: "Successfully updated item.",
        });
      }
      else if(!findLocOps) {
        return res.status(404).send({
          message: "Cannot find item.",
        });
      }
    } catch (error) {
     return res.status(500).send({ message: error.message })
    }
  },
  updateStatusLocOps: async (req, res) => {
    try {
      const { reg_by, status, remarks } = req.body;
      const { id } = req.params;
      
      const findLocOps = await LocOps.findOne({
        where: { id: id },
      });
      
      if(findLocOps) {
        function handleStatus() {
          if(status != findLocOps._previousDataValues.status ) {
            return new Date()
          }
        }

        await LocOps.update({
          reg_by, status, status_date: handleStatus(), remarks
        },{ where: { id: id } });
            
        // set up socket io
        socketEmitGlobal('change-locops-data', await module.exports.functionGetLocOps())
        // end set up socket 

        return res.status(200).send({
          message: "Successfully updated item status.",
        });
      }

      else if(!findLocOps) {
        return res.status(404).send({
          message: "Cannot find item.",
        });
      }
    } catch (error) {
      return res.status(500).send({ message: error.message })
    }
  },
  getAllLocOps: async (req, res) => {
    try {
      const locops = await module.exports.functionGetLocOps()

      if(locops.length != 0) {
        return res.status(200).send({
        message: "Successfully fetched data.",
        data: locops
        });
      }
      else if(locops.length == 0) {
        return res.status(200).send({
          message: "Data is empty.",
        });
      }
    } catch (error) {
      return res.status(500).send({ message: error.message })
    }
  },
  getLocOps: async (req, res) => {
    try {
      const { id } = req.params
      const locops = await LocOps.findOne({ where: { id: id }});
      if(locops) {
        return res.status(200).send({
          message: "Successfully fetched item.",
          data: locops
        });
      }
      else{
        return res.status(404).send({
          message: "Cannot find item.",
        });
      }
    } catch (error) {
      return res.status(500).send({ message: error.message })
    }
  },
};