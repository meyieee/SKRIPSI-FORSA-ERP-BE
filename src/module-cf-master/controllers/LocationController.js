const Location = require("../models/adm_cf_17_location")
const { Op } = require('sequelize')
const { getAttributeEmployeeFullName } = require('../../function/getIncludeAtributes')
const { getModelEmployeeRegister } = require('../../function/getIncludeModels')
const { socketEmitGlobal } = require('../../function/socketEmit')

module.exports = {
  functionGetLocation: async () => {
    const results = await Location.findAll({
      order: [
        ['loc_code', 'ASC']
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
  postLocation: async (req, res) => {
    try {
        const {  loc_code,	loc_des	,reg_by, status, remarks} = req.body;

        const getLocation = await Location.findOne({where: {loc_code: loc_code}})
        if(getLocation){
          return res.status(409).send({
            message: "location  already exist",
          });
        }

       await Location.create({
        loc_code,	loc_des	,	 reg_by,	status,	remarks, status_date : new Date()
        });

        // set up socket io
       socketEmitGlobal('change-location-data', await module.exports.functionGetLocation())
      // end set up socket 

        return res.status(200).send({
          message: "Location is successfully added",
        });
      
    } catch (error) {
      return res.status(500).send({ message: error.message })
    }
  },
  postBatchLocation: async (req, res) => {
    try {
      const array = req.body; // Array of objects

      // Check for duplicate codes in the input array
      const codes = array.map(row => row.loc_code);
      const uniqueCodes = [...new Set(codes)];
      if (codes.length !== uniqueCodes.length) {
        return res.status(409).send({
          message: "Duplicate codes found in the input array.",
        });
      }

      const existingRows = await Location.findAll({ where: { loc_code: { [Op.in]: codes } } });

      // Check for redundancy
      const existingCodes = existingRows.map(row => row.loc_code);
      const duplicateCodes = array.filter(row => existingCodes.includes(row.loc_code));

      if (duplicateCodes.length > 0) {
        return res.status(409).send({
          message: `Codes already exist: ${duplicateCodes.map(row => row.loc_code).join(', ')}`,
        });
      }

      // If no duplicates, create data
      await Location.bulkCreate(array.map(row => ({
        loc_code: row.loc_code,
        loc_des: row.loc_des,
        reg_by: row.reg_by,
        status: row.status,
        remarks: row.remarks,
        status_date: new Date(),
      })));

      // Included socket for batch creating data
      socketEmitGlobal('change-location-data', await module.exports.functionGetLocation())

      return res.status(200).send({
        message: "Successfully created data.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
  updateLocation: async (req, res) => {
    try {
        const {  loc_code,	loc_des	,reg_by, status, remarks	  } = req.body;
        const { id } = req.params;

        const getLocation = await Location.findOne({where: {loc_code, [Op.not]: {id}}})
        if(getLocation){
          return res.status(409).send({
            message: "location code already exist",
          });
        }

        const findLocation = await Location.findOne({
          where: { id: id },
        });
        
        if(findLocation){
          function handleStatus () {
            if(status != findLocation._previousDataValues.status ){
              return new Date()
            }
          }
  
          await Location.update({
            loc_code,	loc_des	,	 reg_by,	status,	remarks,  status_date: handleStatus()
          },{ where: { id: id } });
  
          // set up socket io
          socketEmitGlobal('change-location-data', await module.exports.functionGetLocation())
          // end set up socket 
    
          return res.status(201).send({
            message: "Location is successfully update",
          });
        }

        else if(!findLocation){
          return res.status(404).send({
            message: "Location is not defined",
          });
        }
      
    } catch (error) {
      return res.status(500).send({ message: error.message })
    }
  },
  updateStatusLocation: async (req, res) => {
    try {
      const { reg_by, status, remarks } = req.body;

        const { id } = req.params;
        const findLocation = await Location.findOne({
          where: { id: id },
        });
        
        if(findLocation){
          function handleStatus () {
            if(status != findLocation._previousDataValues.status ){
              return new Date()
            }
          }
  
          await Location.update({
           reg_by, status, status_date: handleStatus(), remarks
          },{ where: { id: id } });
  

          // set up socket io
          socketEmitGlobal('change-location-data', await module.exports.functionGetLocation())
          // end set up socket 

          return res.status(200).send({
            status: 1,
            message: "Location Status was successfully update",
          });
        }

        else if(!findLocation){
          return res.status(200).send({
            message: "Location  was not defined",
          });
        }
      
    } catch (error) {
          return res.status(500).send({ message: error.message });
    }
  },
  getAllLocation: async (req, res) => {
    try {
      const location = await module.exports.functionGetLocation()

      if(location.length != 0){
          return res.status(200).send({
          message: "Location was successfully get",
          data: location
          });
      }
      else if(location.length == 0){
      return res.status(200).send({
          message: "Location was not found",
          });
      }
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
  getLocation: async (req, res) => {
    try {
      const { id } = req.params
          const location = await Location.findOne({ where: { id: id}});
          if(location){
            return res.status(200).send({
             message: "Location was successfully get",
             data: location
           });
          }
          else{
            return res.status(200).send({
              message: "Location is not found",
            });
          }
      
    } catch (error) {
          return res.status(500).send({ message: error.message });
    }
  },
};
