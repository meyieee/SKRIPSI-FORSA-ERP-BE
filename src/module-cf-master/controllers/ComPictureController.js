const Com = require('../models/adm_cf_00_coms');
const ComPicture = require('../models/adm_cf_04_pictures')
const { Op } = require('sequelize');
const { deleteFileWhenFailedPostOrUpdate, deleteFilesWhenFailedPostOrUpdate, deleteFile } = require('../../function/deleteFiles')
const { functionHandleStatusDate } = require('../../function/updateStatusDateItem')
const COM_TYPE = require('../../constants');
const { socketEmitGlobal } = require('../../function/socketEmit')

module.exports = {
  functionGetComPicture: async (com_code)=>{
    const companyProfilePicture = await ComPicture.findAll({ where: { com_code } });
    return companyProfilePicture
  },

  postComPictures: async (req, res) => {
    try {
      const { com_code, reg_by, pictures } = req.body

      const findComCode = await Com.findOne({where:{com_code, com_type:req.com_type}})
      if(!findComCode){
        deleteFilesWhenFailedPostOrUpdate(req.files, 'images')
        return res.status(404).send({
          message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} code does not exist`,
        });
      }

      let arrayPictures = JSON.parse(pictures)
      if(arrayPictures.length > 0){
        const imageId = arrayPictures.map(row => row.pic_code);
        const uniqueImageId = [...new Set(imageId)];
        if (imageId.length !== uniqueImageId.length) {
          deleteFilesWhenFailedPostOrUpdate(req.files, 'images')
          return res.status(409).send({
            message: "duplicate image code.",
          });
        }

        const tempImages = await Promise.all(arrayPictures.map(async (item, i) => {
          const findPhoto = await req.files.find((e) => e.originalname[0].toString() + e.originalname[1].toString() === arrayPictures[i].key);
            return ({ 
                ...item, com_code,reg_by,
                photo: findPhoto ? `images/${findPhoto.filename}` : null,
            });
          }));
          ComPicture.bulkCreate(tempImages)
      }

      return res.status(201).send({
        message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} image is successfully add`,
      });
    } catch (error) {
      deleteFilesWhenFailedPostOrUpdate(req.files, 'images')
      return res.status(500).send({ message: error.message });
    }
  },

  postComPicture: async (req, res) => {
    try {
      const { com_code, pic_code, pic_des, status, reg_by} = req.body
      const findComCode = await Com.findOne({where:{com_code, com_type : req.com_type}})
      if(!findComCode){
        deleteFileWhenFailedPostOrUpdate(req.file, 'images')
        return res.status(404).send({
          message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} code does not exist`,
        });
      }

      const findPicCode = await ComPicture.findOne({where:{pic_code, com_code}})
      if(findPicCode){
        deleteFileWhenFailedPostOrUpdate(req.file, 'images')
        return res.status(409).send({
          message: `image code already exist`,
        });
      }

      await ComPicture.create({com_code,pic_code, pic_des, status, reg_by, status_date: new Date(),photo : `images/${req.file.filename}`});

      socketEmitGlobal(`change-${req.com_type === COM_TYPE.company ? "company" : req.com_type}-${com_code}-picture-data`, await module.exports.functionGetComPicture(com_code))
      return res.status(201).send({
        message: `image is successfully add`,
      });
    } catch (error) {
      deleteFileWhenFailedPostOrUpdate(req.file, 'images')
      return res.status(500).send({ message: error.message });
    }
  },

  updateComPicture: async (req, res) => {
    try {
      const { comcode, id } = req.params
      const { com_code, pic_code, pic_des, status, reg_by, image} = req.body

      const checkComType = await Com.findOne({where:{com_code :comcode,com_type : req.com_type}})
      if (!checkComType){
        deleteFileWhenFailedPostOrUpdate(req.file, 'images')
        return res.status(404).send({
          message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} code does not exist`,
        });
      }

      const findPicCode = await ComPicture.findOne({where:{pic_code, com_code, id: {[Op.not]: id}}})
      if(findPicCode){
        deleteFileWhenFailedPostOrUpdate(req.file, 'images')
        return res.status(409).send({
          message: `image code already exist`,
        });
      }

      const hasComPicture = await ComPicture.findOne( {where:{com_code : comcode, id:id}});
      if (!hasComPicture) {
        deleteFileWhenFailedPostOrUpdate(req.file, 'images')
        return res.status(404).send({
          message: `image does not exist`,
        });
      }

      if(req.file || image == 'deleted'){
        deleteFile(hasComPicture.photo)
      }

      await ComPicture.update(
        {com_code,pic_code, pic_des, status, reg_by,photo: req.file ? `images/${req.file.filename}` : image},
        { where: { com_code : comcode, id: id } }
      );

      socketEmitGlobal(`change-${req.com_type === COM_TYPE.company ? "company" : req.com_type}-${com_code}-picture-data`, await module.exports.functionGetComPicture(com_code))

      return res.status(201).send({
        message: `image is successfully update`,
      });
    } catch (error) {
      deleteFileWhenFailedPostOrUpdate(req.file, 'images')
      return res.status(500).send({ message: error.message });
    }
  },

  updateStatusComPicture: async (req, res) => {
    try {
      const { comcode, id } = req.params
      const { status, reg_by, remarks } = req.body
      const checkComType = await Com.findOne({where:{com_code :comcode,com_type : req.com_type}})

      if (!checkComType){
        return res.status(404).send({
          message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} code does not exist`,
        });
      }

      const hasComPicture = await ComPicture.findOne( {where:{com_code : comcode, id:id}});
      if (!hasComPicture) {
        return res.status(404).send({
          message: `image does not exist`,
        });
      }

      await ComPicture.update({status,reg_by, remarks, status_date: functionHandleStatusDate(status,hasComPicture)},{ where: { com_code : comcode, id: id }});

      socketEmitGlobal(`change-${req.com_type === COM_TYPE.company ? "company" : req.com_type}-${comcode}-picture-data`, await module.exports.functionGetComPicture(comcode))
      return res.status(201).send({
        message: `image status is successfully update`,
      });
    } catch (error) {
      return res.status(500).send({ message: error.message })
    }
  },

  getAllComPictures: async (req, res) => {
    try {
      const { comcode } = req.params;
      const findComCode = await Com.findOne({where:{com_code: comcode, com_type:req.com_type}})
      if(!findComCode){
        return res.status(404).send({
          message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} code does not exist`,
        });
      }
     
      const result = await module.exports.functionGetComPicture(comcode)
      if(!result){
        return res.status(404).send({
          message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} pictures is not found`,
        });
      }

      return res.status(200).send({
        message: `succesfully get all company images`,
        data: result,
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getComPicture: async (req, res) => {
    try {
      const { comcode, id } = req.params;
      const findComCode = await Com.findOne({where:{com_code: comcode, com_type : req.com_type }})
      if(!findComCode){
        return res.status(404).send({
          message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} does not exist`,
        });
      }

      const companyProfilePicture = await ComPicture.findOne({ where: { com_code: comcode, id:id } });
      if(!companyProfilePicture){
        return res.status(404).send({
          message: `image does not exist`,
        });
      }
      
      return res.status(200).send({
        message: `succesfully get company image`,
        data: companyProfilePicture
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
};