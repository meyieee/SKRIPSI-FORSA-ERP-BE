const Division = require("../models/adm_cf_10_division");
const { io } = require('../../config/socketapi')
const { Op } = require('sequelize')
const { getAttributeEmployeeFullName } = require('../../function/getIncludeAtributes')
const { getModelEmployeeRegister } = require('../../function/getIncludeModels')

module.exports = {
  functionGetDivision: async () => {
    const results = await Division.findAll({ 
      order: [
        ['div_code', 'ASC'],
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
  postDivision: async (req, res) => {
    try {
      const { div_des,	remarks, div_code, reg_by, status } = req.body;

      const getDivision = await Division.findOne({where: {div_code: div_code}})
      if(getDivision) {
        return res.status(409).send({
          message: "Code already exists.",
        });
      }

      await Division.create({
        div_des, remarks, div_code, reg_by, status, status_date: new Date()
      });

      // set up socket io
      io.emit('change-division-data', await module.exports.functionGetDivision())
      // end set up socket io

      return res.status(200).send({
        message: "Successfully created item.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
  postBatchDivision: async (req, res) => {
    try {
      const array = req.body; // Array of objects

      // Check for duplicate codes in the input array
      const codes = array.map(row => row.div_code);
      const uniqueCodes = [...new Set(codes)];
      if (codes.length !== uniqueCodes.length) {
        return res.status(409).send({
          message: "Duplicate codes found in the input array.",
        });
      }

      const existingRows = await Division.findAll({ where: { div_code: { [Op.in]: codes } } });

      // Check for redundancy
      const existingCodes = existingRows.map(row => row.div_code);
      const duplicateCodes = array.filter(row => existingCodes.includes(row.div_code));

      if (duplicateCodes.length > 0) {
        return res.status(409).send({
          message: `Codes already exist: ${duplicateCodes.map(row => row.div_code).join(', ')}`,
        });
      }

      // If no duplicates, create data
      await Division.bulkCreate(array.map(row => ({
        div_code: row.div_code,
        div_des: row.div_des,
        reg_by: row.reg_by,
        status: row.status,
        remarks: row.remarks,
        status_date: new Date(),
      })));

      // Included socket for batch creating data
      io.emit('change-division-data', await module.exports.functionGetDivision())

      return res.status(200).send({
        message: "Successfully created data.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
  updateDivision: async (req, res) => {
    try {
      const { div_des,	remarks, div_code, reg_by, status } = req.body;

        const { id } = req.params;
        
        const getExist = await Division.findOne({
          where: {
            div_code: div_code,
            id: {[Op.not]: id},
          }}
        )

        if(getExist) {
          return res.status(409).send({
            message: "Code already exists.",
          });
        }

        const findDivision = await Division.findOne({
          where: { id: id },
        });
        
        if(findDivision) {
          function handleStatus() {
            if(status != findDivision._previousDataValues.status) {
              return new Date()
            }
          }
  
          await Division.update({
            div_des, remarks, div_code, reg_by, status, status_date: handleStatus()
          }, { where: { id: id } });
  

          // set up socket io
          io.emit('change-division-data', await module.exports.functionGetDivision())
          // end set up socket io

          return res.status(200).send({
            status: 1,
            message: "Successfully updated item.",
          });
        }
        else if(!findDivision) {
          return res.status(200).send({
            message: "Cannot find item.",
          });
        }
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
  updateStatusDivision: async (req, res) => {
    try {
      const { reg_by, status, remarks } = req.body;

      const { id } = req.params;

      const findDivision = await Division.findOne({
        where: { id: id },
      });
      
      if(findDivision) {
        function handleStatus() {
          if(status != findDivision._previousDataValues.status) {
            return new Date()
          }
        }

        await Division.update({
          reg_by, status, status_date: handleStatus(), remarks
        }, { where: { id: id } });

        // set up socket io
        io.emit('change-division-data', await module.exports.functionGetDivision())
        // end set up socket io
      
        return res.status(200).send({
          status: 1,
          message: "Successfully updated item status.",
        });
      }
      else if(!findDivision) {
        return res.status(200).send({
          message: "Cannot find item.",
        });
      }
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
  deleteDivision: async (req, res) => {
    try {
      const { id } = req.params;
      await Division.destroy({ where: { id } }); // hapus data dari branch dengan id spesific
      
      // set up socket io
      io.emit('change-division-data', await module.exports.functionGetDivision())
      // end set up socket io

      return res.status(200).send({
        message: "Successfully deleted item.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
  getAllDivision: async (req, res) => {
    try {
      const division = await module.exports.functionGetDivision()
    
      if(division.length != 0) {
        return res.status(200).send({
          message: "Successfully fetched data.",
          data: division
        });
      }
      else if(division.length == 0) {
        return res.status(200).send({
          message: "Cannot find data.",
        });
      }
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
  getDivision: async (req, res) => {
    try {
      const { id } = req.params
      const division = await Division.findOne({ where: { id: id } });
      if(division) {
        return res.status(200).send({
          message: "Successfully fetched item.",
          data: division
        });
      }
      else {
        return res.status(200).send({
          message: "Cannot find item.",
        });
      }
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
};