const Grade = require("../models/emp_cf_plan_d_grade")
const {io} = require('../../config/socketapi');
const { Op } = require("sequelize");
const { getAttributeEmployeeFullName } = require('../../function/getIncludeAtributes')
const { getModelEmployeeRegister } = require('../../function/getIncludeModels')

module.exports = {
  functionGetGrade: async () => {
    const results = await Grade.findAll({
      order: [
        ['grade_code', 'ASC']
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

  postGrade: async (req, res) => {
    try {
      const { grade_code, grade, grade_degree,	grade_description, status, reg_by } = req.body;
      const getGrade = await Grade.findOne({where: { grade_code: grade_code }})
      if(getGrade !== null) {
        return res.status(409).send({
          message: "Grade code already exists.",
        });
      }

      await Grade.create({
        grade_code, grade, grade_degree,	grade_description, reg_by, status
      });

      io.emit('change-grade-data', await module.exports.functionGetGrade())

      return res.status(200).send({
        message: "Successfully added grade.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  postBatchGrade: async (req, res) => {
    try {
      const array = req.body; // Array of objects

      // Check for duplicate codes in the input array
      const codes = array.map(row => row.grade_code);
      const uniqueCodes = [...new Set(codes)];
      if (codes.length !== uniqueCodes.length) {
        return res.status(409).send({
          message: "Duplicate codes found in the input array.",
        });
      }

      const existingRows = await Grade.findAll({ where: { grade_code: { [Op.in]: codes } } });

      // Check for redundancy
      const existingCodes = existingRows.map(row => row.grade_code);
      const duplicateCodes = array.filter(row => existingCodes.includes(row.grade_code));

      if (duplicateCodes.length > 0) {
        return res.status(409).send({
          message: `Codes already exist: ${duplicateCodes.map(row => row.grade_code).join(', ')}`,
        });
      }

      // If no duplicates, create data
      await Grade.bulkCreate(array.map(row => ({
        grade_code: row.grade_code,
        grade: row.grade,
        grade_degree: row.grade_degree,
        grade_description: row.grade_description,
        reg_by: row.reg_by,
        status: row.status,
        remarks: row.remarks,
        status_date: new Date(),
      })));

      // Included socket for batch creating data
      io.emit('change-grade-data', await module.exports.functionGetGrade())

      return res.status(200).send({
        message: "Successfully created data.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateGrade: async (req, res) => {
    try {
      const { grade_code, grade, grade_degree,	grade_description, reg_by } = req.body;
      const { id } = req.params;

      const getExistGradeCode = await Grade.findOne({where: { grade_code: grade_code, [Op.not]: {id} }})
      if(getExistGradeCode !== null) {
        return res.status(409).send({
          message: "Grade code already exists.",
        });
      }

      const findGrade = await Grade.findOne({
        where: { id: id },
      });
      
      if(findGrade === null) {
        return res.status(404).send({
          message: "Cannot find item.",
        });
      }

      await Grade.update({
        grade_code, grade, grade_degree, grade_description, reg_by
      },{ where: { id: id } });

      io.emit('change-grade-data', await module.exports.functionGetGrade())

      return res.status(201).send({
        message: "Successfully updated item.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateStatusGrade: async (req, res) => {
    try {
      const { reg_by, status, remarks } = req.body;
      const { id } = req.params;
      const findGrade = await Grade.findOne({
        where: { id: id },
      });

      if(findGrade === null) {
        return res.status(404).send({
          message: "Cannot find item.",
        });
      }

      function handleStatus () {
        if(status != findGrade._previousDataValues.status ) {
          return new Date()
        }
      }

      await Grade.update({
        reg_by, status, status_date: handleStatus(), remarks
      }, { where: { id: id } });

      io.emit('change-grade-data', await module.exports.functionGetGrade())
      return res.status(200).send({
        message: "Successfully updated item status.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getAllGrade: async (req, res) => {
    try {
      const grade = await module.exports.functionGetGrade()
      if(grade === null) {
        return res.status(404).send({
          message: "Cannot find function data.",
        });
      }
      return res.status(200).send({
       message: "Successfully fetched function data.",
       data: grade
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getGrade: async (req, res) => {
    try {
      const { id } = req.params
      const grade = await Grade.findOne({ where: { id: id } });
      if(grade === null) {
        return res.status(404).send({
          message: "Cannot find item",
        });
      }

      return res.status(200).send({
       message: "Successfully fetched item.",
       data: grade
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
};