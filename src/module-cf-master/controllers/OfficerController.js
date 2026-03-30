const Officer = require("../models/adm_cf_21_officers");
const EmployeeRegister = require("../../module-hr/models/tbl_emp_regs");
const { Op, literal } = require("sequelize");
const { functionHandleStatusDate } = require('../../function/updateStatusDateItem')
const { getAttributeEmployeeFullName } = require('../../function/getIncludeAtributes')
const { getModelEmployeeRegister } = require('../../function/getIncludeModels')
const { socketEmitGlobal } = require('../../function/socketEmit')

module.exports = {
  functionGetOfficer: async () => {
    const results = await Officer.findAll({
      order: [
        ['id_number', 'DESC']
      ],
      include: [
        {
          model: EmployeeRegister,
          as: 'officer_detail'
        },
        getModelEmployeeRegister()
    ],
      attributes: {
        include: [
          [
            literal(
              `CONCAT(
                COALESCE(\`officer_detail\`.\`first_name\`, ''),
                ' ',
                COALESCE(\`officer_detail\`.\`middle_name\`, ''),
                ' ',
                COALESCE(\`officer_detail\`.\`last_name\`, '')
              )`
            ),
            'full_name'//alias
          ],
          [
            literal(
              `CONCAT(
                COALESCE(\`officer_detail\`.\`address\`, ''),
                ' ',
                COALESCE(\`officer_detail\`.\`city\`, ''),
                ' ',
                COALESCE(\`officer_detail\`.\`sub_district\`, ''),
                ' ',
                COALESCE(\`officer_detail\`.\`district\`, ''),
                ' ',
                COALESCE(\`officer_detail\`.\`region\`, ''),
                ' ',
                COALESCE(\`officer_detail\`.\`province\`, ''),
                ' ',
                COALESCE(\`officer_detail\`.\`country\`, ''),
                ' ',
                COALESCE(\`officer_detail\`.\`post_code\`, ''),
                ' '
              )`
            ),
            'full_address'//alias
          ],
          [literal('`officer_detail`.`job_title`'), 'officer_title'],
          [literal('`officer_detail`.`work_function`'), 'officer_qualification'],
          [literal('`officer_detail`.`work_phone`'), 'office_phone'],
          [literal('`officer_detail`.`mobile`'), 'mobile'],
          [literal('`officer_detail`.`wa`'), 'wa'],
          [literal('`officer_detail`.`email_company`'), 'email'],
          [literal('`officer_detail`.`photo`'), 'photo'],
          [getAttributeEmployeeFullName(), 'reg_by'],
        ],
      }
    });
    return results;
  },

  postOfficer: async (req, res) => {
    try {
      const { id_number, officer_type, status, remarks, reg_by} = req.body;

      const idNumber = await Officer.findOne({where: {id_number}});
      if (idNumber) {
        return res.status(409).send({
          message: "Officer already exists.",
        });
      }

      await Officer.create({id_number, officer_type, status, remarks, reg_by,  status_date: new Date()});

      socketEmitGlobal("change-officers-data", await module.exports.functionGetOfficer());
      return res.status(201).send({
          message: "Successfully added officer item.",
        });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  postBatchOfficer: async (req, res) => {
    try {
      const array = req.body; // Array of objects

      // Check for duplicate codes in the input array
      const codes = array.map(row => row.id_number);
      const uniqueCodes = [...new Set(codes)];
      if (codes.length !== uniqueCodes.length) {
        return res.status(409).send({
          message: "Duplicate codes found in the input array.",
        });
      }

      const existingRows = await Officer.findAll({ where: { id_number: { [Op.in]: codes } } });

      // Check for redundancy
      const existingCodes = existingRows.map(row => row.id_number);
      const duplicateCodes = array.filter(row => existingCodes.includes(row.id_number));

      if (duplicateCodes.length > 0) {
        return res.status(409).send({
          message: `Codes already exist: ${duplicateCodes.map(row => row.id_number).join(', ')}`,
        });
      }

      // If no duplicates, create data
      await Officer.bulkCreate(array.map(row => ({
        id_number: row.id_number,
        officer_type: row.officer_type,
        reg_by: row.reg_by,
        status: row.status,
        remarks: row.remarks,
        status_date: new Date(),
      })));

      // Included socket for batch creating data
      socketEmitGlobal("change-officers-data", await module.exports.functionGetOfficer());

      return res.status(200).send({
        message: "Successfully created data.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateOfficer: async (req, res) => {
    try {
      const { id } = req.params;
      const { id_number, officer_type, status, remarks, reg_by} = req.body;

      const idNumber = await Officer.findOne({
        where: {
          id_number,
          id: {
            [Op.not]: id,
          }
        }
      });

      if (idNumber) {
        return res.status(409).send({
          message: "Officer already exists.",
        });
      }

      const findOfficer = await Officer.findOne({ where: { id } });
      if (!findOfficer) {
        return res.status(404).send({
          message: "Officer does not exist.",
        });
      }

      await Officer.update({id_number, officer_type, status, remarks, reg_by},{ where: {id} });

      const oneOfficer_SocketIo = await Officer.findOne({where: { id: id },});

      socketEmitGlobal("change-one-officer-data",oneOfficer_SocketIo);
      socketEmitGlobal("change-officers-data", await module.exports.functionGetOfficer());

      return res.status(201).send({
        message: "Officer is successfully updated.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateStatusOfficer: async (req, res) => {
    try {
      const { id } = req.params;
      const { remarks, reg_by, status } = req.body;

      const findOfficer = await Officer.findOne({ where: { id } });
      if (!findOfficer) {
        return res.status(404).send({
          message: "Officer item doesn't exist.",
        });
      }

      await Officer.update({ remarks, reg_by, status, status_date: functionHandleStatusDate(status,findOfficer)},{ where: { id } });

      const oneOfficer_SocketIo = await Officer.findOne({where: { id }});
      socketEmitGlobal("change-one-officer-data",oneOfficer_SocketIo);
      socketEmitGlobal("change-officers-data", await module.exports.functionGetOfficer());

      return res.status(200).send({
        message: "Officer Status was successfully updated.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getAllOfficer: async (req, res) => {
    try {
      const findOfficers = await module.exports.functionGetOfficer()
      if (findOfficers===null) {
        return res.status(404).send({
          message: "Officer list is empty.",
        });
      }
     return res.status(200).send({
        message: "Successfully fetched officer data.",
        data: findOfficers,
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getOfficer: async (req, res) => {
    try {
      const { id } = req.params;
      const findOfficer = await Officer.findOne({ where: { id: id } });
      if (findOfficer===null) {
        return res.status(404).send({
          message: "Officer is not found.",
        });
      }
     return res.status(200).send({
        message: "Successfully fetched officer item.",
        data: findOfficer,
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
};