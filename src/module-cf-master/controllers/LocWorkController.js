const LocWork = require("../models/adm_cf_18_locwork")
const { Op } = require("sequelize");
const { getAttributeEmployeeFullName } = require('../../function/getIncludeAtributes')
const { getModelEmployeeRegister } = require('../../function/getIncludeModels')
const { socketEmitGlobal } = require('../../function/socketEmit')

module.exports = {
  functionGetLocWork: async () => {
    const results = await LocWork.findAll({
      order: [
        ['locwork_code', 'ASC']
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
  postLocWork: async (req, res) => {
    try {
        const {  locwork_code,	locwork_des,reg_by,	status,	remarks	  } = req.body;

        const getLocWork = await LocWork.findOne({where: {locwork_code: locwork_code}})
        if(getLocWork){
          return res.status(409).send({
            message: "locwork already exist",
          });
        }

       await LocWork.create({
        locwork_code,	locwork_des, reg_by,	status,	remarks, status_date : new Date()
        });
        
        // set up socket io
       socketEmitGlobal('change-locwork-data', await module.exports.functionGetLocWork())
        // end set up socket 

        return res.status(200).send({
          message: "LocWork is successfully added",
        });
    } catch (error) {
     return res.status(500).send({ message: error.message })
    }
  },
  postBatchLocWork: async (req, res) => {
    try {
      const array = req.body; // Array of objects

      // Check for duplicate codes in the input array
      const codes = array.map(row => row.locwork_code);
      const uniqueCodes = [...new Set(codes)];
      if (codes.length !== uniqueCodes.length) {
        return res.status(409).send({
          message: "Duplicate codes found in the input array.",
        });
      }

      const existingRows = await LocWork.findAll({ where: { locwork_code: { [Op.in]: codes } } });

      // Check for redundancy
      const existingCodes = existingRows.map(row => row.locwork_code);
      const duplicateCodes = array.filter(row => existingCodes.includes(row.locwork_code));

      if (duplicateCodes.length > 0) {
        return res.status(409).send({
          message: `Codes already exist: ${duplicateCodes.map(row => row.locwork_code).join(', ')}`,
        });
      }

      // If no duplicates, create data
      await LocWork.bulkCreate(array.map(row => ({
        locwork_code: row.locwork_code,
        lockwork_des: row.lockwork_des,
        reg_by: row.reg_by,
        status: row.status,
        remarks: row.remarks,
        status_date: new Date(),
      })));

      // Included socket for batch creating data
     socketEmitGlobal('change-locwork-data', await module.exports.functionGetLocWork())

      return res.status(200).send({
        message: "Successfully created data.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
  updateLocWork: async (req, res) => {
    try {
        const {  locwork_code,	locwork_des, reg_by,	status,	remarks	  } = req.body;
        const { id } = req.params;
        
        const findLocWorkbyCode = await LocWork.findOne({
          where: { 
            locwork_code: locwork_code,
            [Op.not]: { id:id}
           },
        });

        if(findLocWorkbyCode){
          return res.status(404).send({
            message: "Lock work code already exist",
          });
        }

        const findLocWork = await LocWork.findOne({
          where: { id: id },
        });
        
        if(findLocWork){
          await LocWork.update({
                 locwork_code,	locwork_des, reg_by, status, remarks
          },{ where: { id: id } });
             
        // set up socket io
       socketEmitGlobal('change-locwork-data', await module.exports.functionGetLocWork())
        // end set up socket 

          return res.status(201).send({
            message: "LocWork is successfully update",
          });
        }
        else if(!findLocWork){
          return res.status(404).send({
            message: "LocWork is not defined",
          });
        }
    } catch (error) {
     return res.status(500).send({ message: error.message })
    }
  },
  updateStatusLocWork: async (req, res) => {
    try {
      const { reg_by, status, remarks } = req.body;
        const { id } = req.params;
        
        const findLocWork = await LocWork.findOne({
          where: { id: id },
        });
        
        if(findLocWork){
          function handleStatus () {
            if(status != findLocWork._previousDataValues.status ){
              return new Date()
            }
          }
  
          await LocWork.update({
            reg_by, status, status_date: handleStatus(), remarks
          },{ where: { id: id } });
             
        // set up socket io
       socketEmitGlobal('change-locwork-data', await module.exports.functionGetLocWork())
        // end set up socket 
  
          return res.status(200).send({
            message: "LocWork Status is successfully update",
          });
        }

        else if(!findLocWork){
          return res.status(404).send({
            message: "LocWork  is not defined",
          });
        }
    } catch (error) {
     return res.status(500).send({ message: error.message })
    }
  },
  getAllLocWork: async (req, res) => {
        try {
        const locwork = await module.exports.functionGetLocWork()

        if(locwork.length != 0){
            return res.status(200).send({
            message: "LocWork is successfully get",
            data: locwork
            });
        }
        else if(locwork.length == 0){
        return res.status(200).send({
            message: "LocWork is not found",
            });
        }
    } catch (error) {
   return res.status(500).send({ message: error.message })
    }
  },
  getLocWork: async (req, res) => {
    try {
      const { id } = req.params
          const locwork = await LocWork.findOne({ where: { id: id}});
          if(locwork){
            return res.status(200).send({
             message: "LocWork is successfully get",
             data: locwork
           });
          }
          else{
            return res.status(404).send({
              message: "LocWork is not found",
            });
          }
    } catch (error) {
     return res.status(500).send({ message: error.message })
    }
  },
};