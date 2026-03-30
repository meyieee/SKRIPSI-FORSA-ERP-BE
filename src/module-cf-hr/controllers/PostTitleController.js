const PostTitle = require("../models/emp_cf_plan_posttitle")
const {io} = require('../../config/socketapi');
const { Op } = require("sequelize");
const { getAttributeEmployeeFullName } = require('../../function/getIncludeAtributes')
const { getModelEmployeeRegister } = require('../../function/getIncludeModels')

module.exports = {
  functionGetPostTitle: async () => {
    const results = await PostTitle.findAll({
      order: [
        ['title', 'ASC']
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

  postPostTitle: async (req, res) => {
    try {
      const { title,	title_des, work_group, work_group_des, level_code, level_des, level, status, reg_by } = req.body;
      const getPostTitle = await PostTitle.findOne({where: { title: title }})
      if(getPostTitle !== null) {
        return res.status(409).send({
          message: "Post title code already exists.",
        });
      }

      await PostTitle.create({
        title,	title_des, work_group, work_group_des, level_code, level_des, level, reg_by, status
      });

      io.emit('change-posttitle-data', await module.exports.functionGetPostTitle())

      return res.status(200).send({
        message: "Successfully added post title.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  postBatchPostTitle: async (req, res) => {
    try {
      const array = req.body; // Array of objects

      // Check for duplicate codes in the input array
      const codes = array.map(row => row.title);
      const uniqueCodes = [...new Set(codes)];
      if (codes.length !== uniqueCodes.length) {
        return res.status(409).send({
          message: "Duplicate codes found in the input array.",
        });
      }

      const existingRows = await PostTitle.findAll({ where: { title: { [Op.in]: codes } } });

      // Check for redundancy
      const existingCodes = existingRows.map(row => row.title);
      const duplicateCodes = array.filter(row => existingCodes.includes(row.title));

      if (duplicateCodes.length > 0) {
        return res.status(409).send({
          message: `Codes already exist: ${duplicateCodes.map(row => row.title).join(', ')}`,
        });
      }

      // If no duplicates, create data
      await PostTitle.bulkCreate(array.map(row => ({
        title: row.title,
        title_des: row.title_des,
        work_group: row.work_group,
        work_group_des: row.work_group_des,
        level_code: row.level_code,
        level_des: row.level_des,
        level: row.level,
        reg_by: row.reg_by,
        status: row.status,
        remarks: row.remarks,
        status_date: new Date(),
      })));

      // Included socket for batch creating data
      io.emit('change-posttitle-data', await module.exports.functionGetPostTitle())

      return res.status(200).send({
        message: "Successfully created data.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updatePostTitle: async (req, res) => {
    try {
      const { title,	title_des, work_group, work_group_des, level_code, level_des, level, reg_by } = req.body;
      const { id } = req.params;

      const getExistPostTitleCode = await PostTitle.findOne({where: { title: title, [Op.not]: {id} }})
      if(getExistPostTitleCode !== null) {
        return res.status(409).send({
          message: "Post title code already exists.",
        });
      }

      const findPostTitle = await PostTitle.findOne({
        where: { id: id },
      });
      
      if(findPostTitle === null) {
        return res.status(404).send({
          message: "Cannot find item.",
        });
      }

      await PostTitle.update({
        title, title_des, work_group, work_group_des, level_code, level_des, level, reg_by
      },{ where: { id: id } });

      io.emit('change-posttitle-data', await module.exports.functionGetPostTitle())

      return res.status(201).send({
        message: "Successfully updated item.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  updateStatusPostTitle: async (req, res) => {
    try {
      const { reg_by, status, remarks } = req.body;
      const { id } = req.params;
      const findPostTitle = await PostTitle.findOne({
        where: { id: id },
      });

      if(findPostTitle === null) {
        return res.status(404).send({
          message: "Cannot find item.",
        });
      }

      function handleStatus () {
        if(status != findPostTitle._previousDataValues.status ) {
          return new Date()
        }
      }

      await PostTitle.update({
        reg_by, status, status_date: handleStatus(), remarks
      }, { where: { id: id } });

      io.emit('change-posttitle-data', await module.exports.functionGetPostTitle())
      return res.status(200).send({
        message: "Successfully updated item status.",
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getAllPostTitle: async (req, res) => {
    try {
      const posttitle = await module.exports.functionGetPostTitle()
      if(posttitle === null) {
        return res.status(404).send({
          message: "Cannot find function data.",
        });
      }
      return res.status(200).send({
       message: "Successfully fetched function data.",
       data: posttitle
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getPostTitle: async (req, res) => {
    try {
      const { id } = req.params
      const posttitle = await PostTitle.findOne({ where: { id: id } });
      if(posttitle === null) {
        return res.status(404).send({
          message: "Cannot find item",
        });
      }

      return res.status(200).send({
       message: "Successfully fetched item.",
       data: posttitle
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
};