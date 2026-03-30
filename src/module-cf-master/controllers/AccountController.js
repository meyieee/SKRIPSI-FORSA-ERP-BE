const Account = require("../models/adm_cf_14_account")
const { Op } = require('sequelize')
const { getAttributeEmployeeFullName } = require('../../function/getIncludeAtributes')
const { getModelEmployeeRegister } = require('../../function/getIncludeModels')
const { socketEmitGlobal } = require('../../function/socketEmit')

function handleStatus (status,itemToFind) {
  if(status != itemToFind._previousDataValues.status) {
    return new Date()
  }
}

module.exports = {
  functionGetAccount: async () => {
    const results = await Account.findAll({
      order: [
        ['account_no', 'ASC']
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

  postAccount: async (req, res) => {
    try {
      const {  account_no,	account_name,	account_type,	account_group,	normally,	status,	reg_by  } = req.body;
      const getAccount = await Account.findOne({ where: { account_no: account_no } })
      
      if(getAccount !== null) {
        return res.status(409).send({
          message: "Code already exists.",
        });
      }

      await Account.create({
        account_no,	account_name,	account_type,	account_group, normally,	status,	reg_by, status_date: new Date()
      });

      socketEmitGlobal('change-account-data', await module.exports.functionGetAccount())

      return res.status(200).send({
        message: "Successfully created item.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  postBatchAccount: async (req, res) => {
    try {
      const array = req.body; // Array of objects

      // Check for duplicate codes in the input array
      const codes = array.map(row => row.account_no);
      const uniqueCodes = [...new Set(codes)];
      if (codes.length !== uniqueCodes.length) {
        return res.status(409).send({
          message: "Duplicate codes found in the input array.",
        });
      }

      const existingRows = await Account.findAll({ where: { account_no: { [Op.in]: codes } } });

      // Check for redundancy
      const existingCodes = existingRows.map(row => row.account_no);
      const duplicateCodes = array.filter(row => existingCodes.includes(row.account_no));

      if (duplicateCodes.length > 0) {
        return res.status(409).send({
          message: `Codes already exist: ${duplicateCodes.map(row => row.account_no).join(', ')}`,
        });
      }

      // If no duplicates, create data
      await Account.bulkCreate(array.map(row => ({
        account_no: row.account_no,
        account_name: row.account_name,
        account_type: row.account_type,
        account_group: row.account_group,
        normally: row.normally,
        reg_by: row.reg_by,
        status: row.status,
        remarks: row.remarks,
        status_date: new Date(),
      })));

      // Included socket for batch creating data
      socketEmitGlobal('change-account-data', await module.exports.functionGetAccount())

      return res.status(200).send({
        message: "Successfully created data.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateAccount: async (req, res) => {
    try {
      const { account_no,	account_name,	account_type,	account_group,	normally,	status,	reg_by } = req.body;
      const { id } = req.params;

      const getExist = await Account.findOne({ where: { account_no, [Op.not]: { id } } })
      if(getExist) {
        return res.status(409).send({
          message: "account number already exist",
        });
      }

      const findAccount = await Account.findOne({
        where: { id: id },
      });

      if(findAccount === null) {
        return res.status(404).send({
          message: "Account is not found",
        });
      }

      await Account.update({
        account_no,	account_name,	account_type,	account_group,	normally,	status,	reg_by, status_date: handleStatus(status, findAccount)
      }, { where: { id: id } });

      socketEmitGlobal('change-account-data', await module.exports.functionGetAccount())

      return res.status(200).send({
        message: "Account is successfully update",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateStatusAccount: async (req, res) => {
    try {
      const { reg_by, status, remarks } = req.body;
      const { id } = req.params;

      const findAccount = await Account.findOne({
        where: { id: id },
      });

      if(findAccount === null) {
        return res.status(404).send({
          message: "Account is not defined",
        });
      }

      await Account.update({
        reg_by, remarks, status, status_date: handleStatus(status, findAccount)
      }, { where: { id: id } });

      socketEmitGlobal('change-account-data', await module.exports.functionGetAccount())

      return res.status(200).send({
        message: "Account Status is successfully update",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getAllAccount: async (req, res) => {
    try {
      const account = await module.exports.functionGetAccount()

      if(account === null) {
        return res.status(404).send({
          message: "Account is not found",
        });
      }

      return res.status(200).send({
        message: "Account is successfully get",
        data: account
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
  
  getAccount: async (req, res) => {
    try {
      const { id } = req.params
      const account = await Account.findOne({ where: { id: id } });
    
      if(account===null) {
        return res.status(404).send({
          message: "Account is not found",
        });
      }

      return res.status(200).send({
        message: "Account is successfully get",
        data: account
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
};