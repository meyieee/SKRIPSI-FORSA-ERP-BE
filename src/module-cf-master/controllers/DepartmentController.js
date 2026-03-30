const Department = require("../models/adm_cf_11_dept");
const { Op } = require("sequelize");
const { getAttributeEmployeeFullName } = require('../../function/getIncludeAtributes')
const { getModelEmployeeRegister } = require('../../function/getIncludeModels')
const { socketEmitGlobal } = require('../../function/socketEmit')

module.exports = {
  functionGetDepartment: async () => {
    const results = await Department.findAll({
      order: [["dept_code", "ASC"]],
      include: [getModelEmployeeRegister()],
      attributes: {
        include: [
          [getAttributeEmployeeFullName(), 'reg_by'],
        ],
      }
    });

    return results;
  },
  postDepartment: async (req, res) => {
    try {
      const { dept_code, dept_des, reg_by, status } = req.body;

      const getDepartment = await Department.findOne({
        where: { dept_code: dept_code },
      });

      if (getDepartment) {
        return res.status(409).send({
          message: "Code already exists.",
        });
      }

      await Department.create({ dept_code, dept_des, reg_by, status, status_date: new Date() });

      // Set up socket
      socketEmitGlobal("change-department-data", await module.exports.functionGetDepartment());
      
      return res.status(201).send({
        message: "Department was created successfully",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
  postBatchDepartment: async (req, res) => {
    try {
      const array = req.body; // Array of objects

      // Check for duplicate codes in the input array
      const codes = array.map(row => row.dept_code);
      const uniqueCodes = [...new Set(codes)];
      if (codes.length !== uniqueCodes.length) {
        return res.status(409).send({
          message: "Duplicate codes found in the input array.",
        });
      }

      const existingRows = await Department.findAll({ where: { dept_code: { [Op.in]: codes } } });

      // Check for redundancy
      const existingCodes = existingRows.map(row => row.dept_code);
      const duplicateCodes = array.filter(row => existingCodes.includes(row.dept_code));

      if (duplicateCodes.length > 0) {
        return res.status(409).send({
          message: `Codes already exist: ${duplicateCodes.map(row => row.dept_code).join(', ')}`,
        });
      }

      // If no duplicates, create data
      await Department.bulkCreate(array.map(row => ({
        dept_code: row.dept_code,
        dept_des: row.dept_des,
        reg_by: row.reg_by,
        status: row.status,
        remarks: row.remarks,
        status_date: new Date(),
      })));

      // Included socket for batch creating data
      socketEmitGlobal("change-department-data", await module.exports.functionGetDepartment());

      return res.status(200).send({
        message: "Successfully created data.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
  updateDepartment: async (req, res) => {
    try {
      const { dept_code, dept_des, reg_by, status } = req.body;

      const { id } = req.params;

      const getExist = await Department.findOne({
        where: {
          dept_code: dept_code,
          id: { [Op.not]: id },
        },
      });

      if (getExist) {
        return res.status(409).send({
          message: "Department code already exists.",
        });
      }

      const findDepartment = await Department.findOne({
        where: { id: id },
      });

      if (findDepartment) {
        function handleStatus() {
          if (status != findDepartment._previousDataValues.status) {
            return new Date();
          }
        }

        await Department.update({ dept_code, dept_des, reg_by, status, status_date: handleStatus(), }, { where: { id: id } });

        // Set up socket
        socketEmitGlobal("change-department-data", await module.exports.functionGetDepartment());
        
        return res.status(201).send({
          message: "Department was successfully update",
        });
      } else if (!findDepartment) {
        return res.status(204).send({
          message: "Department is not found",
        });
      }
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
  updateStatusDepartment: async (req, res) => {
    try {
      const { reg_by, status, remarks } = req.body;
      const { id } = req.params;

      const findDepartment = await Department.findOne({
        where: { id: id },
      });

      if (findDepartment) {
        function handleStatus() {
          if (status != findDepartment._previousDataValues.status) {
            return new Date();
          }
        }

        await Department.update({ reg_by, status, status_date: handleStatus(), remarks, }, { where: { id: id } });

        // Set up socket
        socketEmitGlobal("change-department-data", await module.exports.functionGetDepartment());
        
        return res.status(201).send({
          message: "Successfully updated item.",
        });
      } else if (!findDepartment) {
        return res.status(204).send({
          message: "Department is not found",
        });
      }
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
  getAllDepartment: async (req, res) => {
    try {
      const department = await module.exports.functionGetDepartment()

      if (!department || department.length === 0) {
        return res.status(404).send({
          message: "Data is empty.",
        });
      }
      
      return res.status(200).send({
        message: "Successfully fetched data.",
        data: department,
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
  getDepartment: async (req, res) => {
    try {
      const { id } = req.params;
      const department = await Department.findOne({ where: { id: id } });

      if (department) {
        return res.status(200).send({
          message: "Department was successfully get",
          data: department,
        });
      } else {
        return res.status(200).send({
          message: "Department is not found",
        });
      }
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
  getDepartmentByCode: async (req, res) => {
    try {
      const { code } = req.params;
      const department = await Department.findOne({ 
        where: { dept_code: code },
        attributes: ['dept_des'],
      });

      if (!department) {
        return res.status(404).send({
          message: "Department is not found",
        });
      }
      
      return res.status(200).send({
        message: "Department was successfully get",
        data: department,
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
};