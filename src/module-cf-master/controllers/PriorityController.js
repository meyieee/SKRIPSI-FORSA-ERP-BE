const Priority = require("../models/adm_cf_19_priority")
const {Op} = require('sequelize')
const { getAttributeEmployeeFullName } = require('../../function/getIncludeAtributes')
const { getModelEmployeeRegister } = require('../../function/getIncludeModels')
const { socketEmitGlobal } = require('../../function/socketEmit')

module.exports = {
  functionGetPriority: async () => {
    const results = await Priority.findAll({
      order: [
        ['priority_code', 'ASC']
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
  postPriority: async (req, res) => {
    try {
        const {  priority_code,	priority_des,reg_by,	status,	remarks	  } = req.body;

        const getPriority = await Priority.findOne({where: {priority_code: priority_code}})
        if(getPriority){
          return res.status(409).send({
            message: "priority already exist",
          });
        }

       await Priority.create({
        priority_code, priority_des, reg_by,	status,	remarks, status_date : new Date()
        });

        socketEmitGlobal('change-priority-data', await module.exports.functionGetPriority())

        return res.status(200).send({
          message: "Priority is successfully added",
        });
    } catch (error) {
      return res.status(500).send({ message: error.message })
    }
  },
  postBatchPriority: async (req, res) => {
    try {
      const array = req.body; // Array of objects

      // Check for duplicate codes in the input array
      const codes = array.map(row => row.priority_code);
      const uniqueCodes = [...new Set(codes)];
      if (codes.length !== uniqueCodes.length) {
        return res.status(409).send({
          message: "Duplicate codes found in the input array.",
        });
      }

      const existingRows = await Priority.findAll({ where: { priority_code: { [Op.in]: codes } } });

      // Check for redundancy
      const existingCodes = existingRows.map(row => row.priority_code);
      const duplicateCodes = array.filter(row => existingCodes.includes(row.priority_code));

      if (duplicateCodes.length > 0) {
        return res.status(409).send({
          message: `Codes already exist: ${duplicateCodes.map(row => row.priority_code).join(', ')}`,
        });
      }

      // If no duplicates, create data
      await Priority.bulkCreate(array.map(row => ({
        priority_code: row.priority_code,
        priority_des: row.priority_des,
        reg_by: row.reg_by,
        status: row.status,
        remarks: row.remarks,
        status_date: new Date(),
      })));

      // Included socket for batch creating data
      socketEmitGlobal('change-priority-data', await module.exports.functionGetPriority())

      return res.status(200).send({
        message: "Successfully created data.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
  updatePriority: async (req, res) => {
    try {
        const {  priority_code,	priority_des, reg_by,	status,	remarks	  } = req.body;
        const { id } = req.params;

        const getExist = await Priority.findOne({where: {priority_code, [Op.not]: {id}}})
        if(getExist){
          return res.status(409).send({
            message: "priority already exist",
          });
        }

        const findPriority = await Priority.findOne({
          where: { id: id },
        });

        if(findPriority){
          function handleStatus () {
            if(status != findPriority._previousDataValues.status ){
              return new Date()
            }
          }

          await Priority.update({
                 priority_code,	priority_des,  reg_by, status, remarks, status_date: handleStatus()
          },{ where: { id: id } });

        socketEmitGlobal('change-priority-data', await module.exports.functionGetPriority())

          return res.status(201).send({
            message: "Priority is successfully update",
          });
        }
        else if(!findPriority){
          return res.status(404).send({
            message: "Priority  is not defined",
          });
        }
    } catch (error) {
      return res.status(500).send({ message: error.message })
    }
  },
  updateStatusPriority: async (req, res) => {
    try {
        const { reg_by, status, remarks } = req.body;
        const { id } = req.params;

        const findPriority = await Priority.findOne({
          where: { id: id },
        });

        if(findPriority){
          function handleStatus () {
            if(status != findPriority._previousDataValues.status ){
              return new Date()
            }
          }

          await Priority.update({
            reg_by, status, status_date: handleStatus(), remarks
          },{ where: { id: id } });

        socketEmitGlobal('change-priority-data', await module.exports.functionGetPriority())

          return res.status(200).send({
            message: "Priority Status is successfully update",
          });
        }
        else if(!findPriority){
          return res.status(404).send({
            message: "Priority  is not defined",
          });
        }
    } catch (error) {
      return res.status(500).send({ message: error.message })
    }
  },
  getAllPriority: async (req, res) => {
    try {
      const priority = await module.exports.functionGetPriority()

      if(priority.length != 0){
          return res.status(200).send({
          message: "Priority is successfully get",
          data: priority
          });
      }
      else if(priority.length == 0){
      return res.status(404).send({
          message: "Data is empty.",
          });
      }
    } catch (error) {
    return res.status(500).send({ message: error.message })
    }
  },
  getPriority: async (req, res) => {
    try {
      const { id } = req.params
      const priority = await Priority.findOne({ where: { id: id}});

      if(!priority) {
        return res.status(404).send({
          message: "Priority is not found",
        });
      }
      
      return res.status(200).send({
        message: "Priority is successfully get",
        data: priority
      });
    } catch (error) {
      return res.status(500).send({ message: error.message })
    }
  },
  getPriorityByCode: async (req, res) => {
    try {
      const { code } = req.params
      const priority = await Priority.findOne({ 
        where: { priority_code: code },
        attributes: ['priority_des'],
      });

      if(!priority) {
        return res.status(404).send({
          message: "Priority is not found",
        });
      }
      
      return res.status(200).send({
        message: "Priority is successfully get",
        data: priority
      });
    } catch (error) {
      return res.status(500).send({ message: error.message })
    }
  },
};