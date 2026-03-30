const Com = require('../models/adm_cf_00_coms');
const ComContact = require('../models/adm_cf_01_contacts')
const { Op } = require('sequelize');
const { deleteFilesWhenFailedPostOrUpdate, deleteFileWhenFailedPostOrUpdate, deleteFile } = require('../../function/deleteFiles')
const { functionHandleStatusDate } = require('../../function/updateStatusDateItem')
const COM_TYPE = require('../../constants');
const { getAttributeEmployeeFullName } = require('../../function/getIncludeAtributes')
const { getModelEmployeeRegister } = require('../../function/getIncludeModels')
const { socketEmitGlobal } = require('../../function/socketEmit')

module.exports = {
  functionGetComContact : async(com_code) =>{
    const comContact = await ComContact.findAll({ 
      where: {com_code},
      include: [getModelEmployeeRegister()],
      attributes: {
        include: [
          [getAttributeEmployeeFullName(), 'reg_by'],
        ],
      }
    });
    return comContact;
  },

  postComContacts: async (req, res) => {
    try {
      const {com_code, reg_by, contacts} = req.body

      // mengecek apakah ada com code  di com
      const findComCode = await Com.findOne({where:{com_code, com_type: req.com_type}})
      if(!findComCode){
        deleteFilesWhenFailedPostOrUpdate(req.files, 'images')
        return res.status(404).send({
          message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} code does not exist`,
        });
      }

      let arrayContacts = JSON.parse(contacts)
      if(arrayContacts.length > 0){
        const contactId = arrayContacts.map(row => row.id_number);
        const uniqueContactId = [...new Set(contactId)];
        if (contactId.length !== uniqueContactId.length) {
          deleteFilesWhenFailedPostOrUpdate(req.files, 'images')
          return res.status(409).send({
            message: "duplicate contact id number.",
          });
        }

        const tempContacts = await Promise.all(arrayContacts.map(async (item, i) => {
            const findPhoto = await req.files.find((e) => e.originalname[0].toString() + e.originalname[1].toString() === arrayContacts[i].key);
            return ({ 
              ...item, com_code, reg_by, is_prefer: item.is_preferred, 
              photo: findPhoto ? `images/${findPhoto.filename}` : null
            });
        }));
        await ComContact.bulkCreate(tempContacts)
      }

      return res.status(201).send({
        message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} contact is successfully add`,
      });
    } catch (error) {
      deleteFilesWhenFailedPostOrUpdate(req.files, 'images')
      return res.status(500).send({ message: error.message })
    }
  },

  postComContact: async (req, res) => {
    try {
      const {
        com_code, id_number, first_name, last_name,
        contact_title, contact_qualification, is_prefer,
        full_address, office_phone, mobile, wa, fax_number,
        reg_by, status, status_date, email
      } = req.body

      const findComCode = await Com.findOne({where:{com_code, com_type: req.com_type}})
      if(!findComCode){
        deleteFileWhenFailedPostOrUpdate(req.file)
        return res.status(404).send({
          message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} does not exist`,
        });
      }
      
      const checkIdNumber  = await ComContact.findOne({where:{id_number,com_code}})
      if(checkIdNumber){
        deleteFileWhenFailedPostOrUpdate(req.file)
        return res.status(409).send({
          message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} contact already exist`,
        });
      }

      //mengecek is_prefer
      if(is_prefer === 'true'){
        const findIsPrefer  = await ComContact.findOne({
          where:{is_prefer: true, com_code}
        })
        if(findIsPrefer !== null){
        deleteFileWhenFailedPostOrUpdate(req.file)
        return res.status(409).send({
          message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} contact is prefer already exist`,
        });
        }
      }

      await ComContact.create({
        com_code, id_number, first_name, last_name,
        contact_title, contact_qualification, is_prefer,
        full_address, office_phone, mobile, wa, fax_number,
        reg_by, status, status_date,  email,
        status_date: new Date(),
        photo: req.file ? `images/${req.file.filename}` : null,
      });

      // set up socket io
      socketEmitGlobal(`change-${req.com_type === COM_TYPE.company ? "company" : req.com_type}-${com_code}-contact-data`, await module.exports.functionGetComContact(com_code))

      return res.status(201).send({
        message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} contact is successfully add`,
      });
    } catch (error) {
      deleteFileWhenFailedPostOrUpdate(req.file)
      return res.status(500).send({ message: error.message });
    }
  },

  updateComContact: async (req, res) => {
    try {
      const { comcode, id } = req.params
      const {
        com_code, id_number, first_name, last_name,
        contact_title, contact_qualification, is_prefer,
        full_address, office_phone, mobile, wa, fax_number,
        reg_by, status, email,  image
      } = req.body;

      const checkComType = await Com.findOne({
        where:{com_code:comcode, com_type: req.com_type}
      })
      if (!checkComType){
        deleteFileWhenFailedPostOrUpdate(req.file)
        return res.status(404).send({
          message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} code does not exist`,
        });
      }

      const checkIdNumber = await ComContact.findOne({
        where:{ id_number, com_code, id: {[Op.not]: id}}
      })
      if(checkIdNumber){
        deleteFileWhenFailedPostOrUpdate(req.file)
        return res.status(409).send({
          message: `id number in contact already exist`,
        });
      }

      //mengecek is_prefer
      if(is_prefer === 'true'){
      const findIsPrefer  = await ComContact.findOne({where:{ is_prefer: true, com_code: com_code,id: {[Op.not]: id}}})
      if(findIsPrefer !== null){
          deleteFileWhenFailedPostOrUpdate(req.file)
          return res.status(409).send({
            message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} contact is prefer already exist`,
          });
        }
      }

      const hasComContact = await ComContact.findOne( {where:{com_code : comcode, id:id}});
      if (!hasComContact) {
          deleteFileWhenFailedPostOrUpdate(req.file)
          return res.status(404).send({
            message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} contact does not exist`,
          });
      }

      if((req.file || image == 'null')){
        deleteFile(hasComContact.photo)
      } 

      await ComContact.update(
          {
            com_code, id_number, first_name, last_name,
            contact_title, contact_qualification, is_prefer,
            full_address, office_phone, mobile, wa, fax_number,
            reg_by, status: status == 'true' ? true : is_prefer == 'true' ? true : false, 
            email,photo: req.file ? `images/${req.file.filename}` : image == 'null' ? null : image ,
          },
          { where: { com_code : comcode, id: id } }
        );

        socketEmitGlobal(`change-${req.com_type === COM_TYPE.company ? "company" : req.com_type}-${com_code}-contact-data`, await module.exports.functionGetComContact(comcode))
        // end set up socket io

        return res.status(201).send({
          message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} contact is successfully update`,
        });
    } catch (error) {
      deleteFileWhenFailedPostOrUpdate(req.file)
      return res.status(500).send({ message: error.message });
    }
  },

  updateStatusComContact: async (req, res) => {
    try {
      const { comcode, id } = req.params
      const { status, reg_by, remarks } = req.body;

      const checkComType = await Com.findOne({where:{com_code :comcode,com_type : req.com_type}})
      if (!checkComType){
        return res.status(404).send({
          message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} code does not exist`,
        });
      }

      const hasComContact = await ComContact.findOne( {where:{com_code : comcode, id:id}});
      if (!hasComContact) {
        return res.status(404).send({
          message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} contact does not exist`,
        });
      }

      await ComContact.update({status, remarks, is_prefer:false, reg_by, status_date: functionHandleStatusDate(status,hasComContact)},{ where: { com_code : comcode, id: id }});

      socketEmitGlobal(`change-${req.com_type === COM_TYPE.company ? "company" : req.com_type}-${comcode}-contact-data`, await module.exports.functionGetComContact(comcode))

      return res.status(201).send({
        message: `Status ${req.com_type === COM_TYPE.company ? "company" : req.com_type} contact is successfully update`,
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
  getAllComContacts: async (req, res) => {
    try {
      const { comcode } = req.params;
      const findComCode = await Com.findOne({where:{com_code: comcode, com_type : req.com_type}})

      if(!findComCode){
        return res.status(404).send({
          message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} code does not exist`,
        });
      }

      const contacts = await module.exports.functionGetComContact(comcode)
      if(!contacts){
        return res.status(404).send({
          message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} contacts is not found`,
        });
      }

      return res.status(200).send({
        message: `succesfully get all ${req.com_type === COM_TYPE.company ? "company" : req.com_type} Contacts`,
        data:contacts,
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getComContact: async (req, res) => {
    try {
      const { comcode, id } = req.params;

      const findComCode = await Com.findOne({where:{com_code: comcode, com_type : req.com_type}})
      if(!findComCode.com_type){
        return res.status(404).send({
          message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} does not exist`,
        });
      }

      const comContact = await ComContact.findOne({ where: { com_code: comcode, id:id } });
      if(!comContact){
        return res.status(404).send({
          message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} contact is not found`,
        });
      }

      return res.status(200).send({
        message: `succesfully get ${req.com_type === COM_TYPE.company ? "company" : req.com_type} Contact`,
        data:comContact,
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
};