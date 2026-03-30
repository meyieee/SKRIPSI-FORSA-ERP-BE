const Currency = require("../models/adm_cf_15_currency")
const { Op } = require('sequelize')
const { getAttributeEmployeeFullName } = require('../../function/getIncludeAtributes')
const { getModelEmployeeRegister } = require('../../function/getIncludeModels')
const { socketEmitGlobal } = require('../../function/socketEmit')

module.exports = {
  functionGetCurrency: async () => {
    const results = await Currency.findAll({
      order: [
        ['is_default', 'DESC'], 
        ['currency', 'ASC']
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
  postCurrency: async (req, res) => {
    try {
        const { currency, currency_name, used_in,	reg_by,	status,	remarks, is_default	} = req.body;

        const getCurrency = await Currency.findOne({where: {currency}})
        if(getCurrency){
          return res.status(409).send({
            message: "currency already exist",
          });
        }

        if(is_default === true){
          const findcurrencyDefault = await Currency.findOne({where:{is_default: true}})
          if(findcurrencyDefault){
            return res.status(409).send({
              message: "Default currency already exists. Please uncheck the default option.",
            });
          }
        }

        await Currency.create({currency, currency_name,used_in, reg_by,	status,	remarks, is_default, status_date : new Date()});

        // set up socket io
        socketEmitGlobal('currency', await module.exports.functionGetCurrency())
        // end set up socket io

        return res.status(200).send({
          message: "Currency is successfully added",
        });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  postBatchCurrency: async (req, res) => {
    try {
      const array = req.body; // Array of objects

      // Check for duplicate codes in the input array
      const codes = array.map(row => row.currency);
      const uniqueCodes = [...new Set(codes)];
      if (codes.length !== uniqueCodes.length) {
        return res.status(409).send({
          message: "Duplicate codes found in the input array.",
        });
      }

      const existingRows = await Currency.findAll({ where: { currency: { [Op.in]: codes } } });

      // Check for redundancy
      const existingCodes = existingRows.map(row => row.currency);
      const duplicateCodes = array.filter(row => existingCodes.includes(row.currency));

      if (duplicateCodes.length > 0) {
        return res.status(409).send({
          message: `Codes already exist: ${duplicateCodes.map(row => row.currency).join(', ')}`,
        });
      }

      // If no duplicates, create data
      await Currency.bulkCreate(array.map(row => ({
        currency: row.currency,
        currency_name: row.currency_name,
        used_in: row.used_in,
        reg_by: row.reg_by,
        status: row.status,
        remarks: row.remarks,
        status_date: new Date(),
      })));

      // Included socket for batch creating data
      socketEmitGlobal('currency', await module.exports.functionGetCurrency())

      return res.status(200).send({
        message: "Successfully created data.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
  updateCurrency: async (req, res) => {
    try {
      const {  currency,	currency_name,used_in, is_default, reg_by,	status,	remarks	  } = req.body;
      const { id } = req.params;

      //mengecek is_default
      if(is_default === true && status === true){
          const findIsdefault  = await Currency.findOne({
            where:{
              is_default: true,
              id: {[Op.not]: id},
            }
          })
        if(findIsdefault !== null){
          return res.status(409).send({
            message: "Default currency already exist",
          });
        }
      }  else if(is_default === true && status === false){
          return res.status(403).send({
            message: "Can't set a deactivate currency as a default currency"
          })
      }
      
      const getExist = await Currency.findOne({where: {currency, [Op.not]: {id}}})
      if(getExist){
        return res.status(409).send({
          message: "currency already exist",
        });
      }
      const findCurrency = await Currency.findOne({
        where: { id: id },
      });

      if(findCurrency==null){
        return res.status(404).send({
          message: "Currency is not defined",
        });
      }
      function handleStatus () {
        if(status != findCurrency._previousDataValues.status ){
          return new Date()
        }
      }

      await Currency.update({
        currency,	currency_name,used_in,	reg_by,	status,	remarks, status_date: handleStatus() , is_default
      },{ where: { id: id } });

      // set up socket io
      socketEmitGlobal('currency', await module.exports.functionGetCurrency())
      socketEmitGlobal(`currency_${id}`, await Currency.findOne({where: { id }}))
      // end set up socket io

      return res.status(200).send({
        message: "Currency is successfully update",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
  updateStatusCurrency: async (req, res) => {
    try {
      const { reg_by, status, remarks } = req.body;
        const { id } = req.params;

        const findCurrency = await Currency.findOne({
          where: { id: id },
        });

        if(findCurrency){
          function handleStatus () {
            if(status != findCurrency._previousDataValues.status ){
              return new Date()
            }
          }

          await Currency.update({
            reg_by, status, status_date: handleStatus(), remarks, is_default:false
          },{ where: { id: id } });

          // set up socket io
          socketEmitGlobal('currency', await module.exports.functionGetCurrency())
          // end set up socket io

          return res.status(200).send({
            message: "Currency Status is successfully update",
          });
        }
        else if(!findCurrency){
          return res.status(200).send({
            message: "Currency  is not defined",
          });
        }
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
  getAllCurrency: async (req, res) => {
    try {
      const currency = await module.exports.functionGetCurrency()

      if(currency.length != 0){
          return res.status(200).send({
          message: "Currency is successfully get",
          data: currency
          });
      }
      else if(currency.length == 0){
      return res.status(200).send({
          message: "Currency is not found",
          });
      }
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
  getCurrency: async (req, res) => {
    try {
      const { id } = req.params
          const currency = await Currency.findOne({ where: { id: id}});
          if(currency){
            return res.status(200).send({
             message: "Currency is successfully get",
             data: currency
           });
          }
          else{
            return res.status(200).send({
              message: "Currency is not found",
            });
          }
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
};