const Com = require('../models/adm_cf_00_coms');
const ComDetail = require('../models/adm_cf_00_com_dets')
const ComContact = require('../models/adm_cf_01_contacts')
const { Op } = require('sequelize')
const { deleteFileWhenFailedPostOrUpdate, deleteFile } = require('../../function/deleteFiles')
const { functionHandleStatusDate } = require('../../function/updateStatusDateItem')
const COM_TYPE = require('../../constants');
const { getAttributeEmployeeFullName } = require('../../function/getIncludeAtributes')
const { getModelEmployeeRegister } = require('../../function/getIncludeModels')
const { socketEmitGlobal } = require('../../function/socketEmit')

module.exports = {
  functionGetComs: async (com_type) => {
    const results = await Com.findAndCountAll({
      where: { com_type },
      order: [['id', 'DESC']],
      include: [
        {
          model: ComDetail,
          as: 'detail'
        },
        {
          model: ComContact,
          as: 'contact'
        },
        getModelEmployeeRegister()
      ],
      attributes: {
        include: [
          [getAttributeEmployeeFullName(), 'reg_by'],
        ],
      }
    })

    results.rows.forEach(com => {
      com.contact?.sort((a, b) => {
        // Untuk mengurutkan boolean, true (is_prefer) harus di atas false (non-is_prefer)
        if (a.is_prefer && !b.is_prefer) return -1; // a di atas b (true di atas false)
        if (!a.is_prefer && b.is_prefer) return 1; // b di atas a (false di bawah true)
        return 0; // Keduanya sama atau keduanya false
      });
    });

    return results;
  },

  functionGetCom: async (com_type, id) => {
    let com = await Com.findOne({
      where: {
       com_type: com_type === COM_TYPE.branch ? [COM_TYPE.branch, COM_TYPE.company] : com_type,
       [Op.or] :[ {com_code: id},{id: id}]
     },
     order: [['com_code', 'DESC']],
     include: [getModelEmployeeRegister()],
      attributes: {
        include: [
          [getAttributeEmployeeFullName(), 'reg_by'],
        ],
      }
   });

    const comDetail = await ComDetail.findOne({
      where:{
          com_code: com.com_code
      }
    })

    const comContact = await ComContact.findOne({
      where: {
        [Op.or]: [
            { is_prefer: true, com_code: com.com_code, status: true },
            { is_prefer: false, com_code: com.com_code, status: true }
              ]
      },
      order: [['is_prefer', 'DESC']]
      })

    if(comContact){
      com.dataValues.contact = comContact.dataValues
    }

    if(comDetail){
      com.dataValues.detail = comDetail.dataValues
    }
   return com;
  },
  
  postCom: async (req, res) => {
    try {
      const {
        com_code, com_name, com_short_name, com_des, com_type, address, city, province, postal_code,
        country, region, phone_no, contact_no, contact_name, npwp, logo, email, web_address, reg_by, 
        status,bill_to, bill_to_address, bill_to_contact, ship_to, ship_to_address, ship_to_contact,
        bill_to_attention, ship_to_attention
      } = req.body;

      if(com_type === COM_TYPE.company){
        const getHO = await Com.findOne({where: {com_type}})
        if(getHO){
          deleteFileWhenFailedPostOrUpdate(req.file, 'images')
          return res.status(409).send({
            message: `${COM_TYPE.company} already registered`,
          });
        }
      }

      const getCom = await Com.findOne({where: {com_code, com_type}})
      if(getCom){
        deleteFileWhenFailedPostOrUpdate(req.file, 'images')
        return res.status(409).send({
          message: `${com_type} code already exist`,
        });
      }

      await Com.create({
        com_code, com_name, com_short_name, com_des,
        com_type, address, city, province, postal_code,
        country, region, phone_no, contact_no, contact_name,
        npwp, logo, email, web_address, reg_by, status,
        status_date: new Date(),
        logo: req.file ? `images/${req.file.filename}` : null,
      });

      if(com_type === COM_TYPE.supplier || com_type === COM_TYPE.customer){
        await ComDetail.create({
          com_code, bill_to, bill_to_address, bill_to_contact, bill_to_attention, ship_to_attention,
          ship_to, ship_to_address, ship_to_contact, reg_by
        })
      }

      // set up socket
      if(com_type !== COM_TYPE.company){
      socketEmitGlobal(`change-${com_type === COM_TYPE.company ? "company" : com_type}-data`, await module.exports.functionGetComs(com_type))
      }
      // end set up socket
      
      return res.status(201).send({
          message: `${com_type} is successfully added`,
        });
      } catch (error) {
        deleteFileWhenFailedPostOrUpdate(req.file, 'images')
        return res.status(500).send({ message: error.message })
      }
  },

  postBatchCom: async (req, res) => {
    try {
      const array = req.body; // Array of objects

      // Check for duplicate codes in the input array
      const codes = array.map(row => row.com_code);
      const uniqueCodes = [...new Set(codes)];
      if (codes.length !== uniqueCodes.length) {
        return res.status(409).send({
          message: `Duplicate codes found in the file input.`,
        });
      }

      // Check for redundancy
      const existingRows = await Com.findAll({ where: { com_code: { [Op.in]: codes } } });
      const existingCodes = existingRows.map(row => row.com_code);
      const duplicateCodes = array.filter(row => existingCodes.includes(row.com_code));

      if (duplicateCodes.length > 0) {
        return res.status(409).send({
          message: `Codes already exist: ${duplicateCodes.map(row => row.com_code).join(', ')}`,
        });
      }

      // If no duplicates, create data
      await Com.bulkCreate(array.map(row => ({
        com_code: row.com_code,
        com_name: row.com_name,
        com_short_name: row.com_short_name,
        com_des: row.com_des,
        com_type: row.com_type,
        address: row.address,
        city: row.city,
        province: row.province,
        postal_code: row.postal_code,
        country: row.country,
        region: row.region,
        phone_no: row.phone_no,
        contact_no: row.contact_no,
        contact_name: row.contact_name,
        npwp: row.npwp,
        logo: row.logo,
        email: row.email,
        web_address: row.web_address,
        reg_by: row.reg_by,
        reg_by: row.reg_by,
        status: row.status,
        remarks: row.remarks,
        status_date: new Date(),
      })));

      await ComDetail.bulkCreate(array.map(row => ({
        com_code: row.com_code,
        bill_to: row.bill_to,
        bill_to_address: row.bill_to_address,
        bill_to_attention: row.bill_to_attention, 
        ship_to_attention: row.ship_to_attention,
        bill_to_contact: row.bill_to_contact,
        ship_to: row.ship_to,
        ship_to_address: row.ship_to_address,
        ship_to_contact: row.ship_to_contact,
        reg_by: row.reg_by
      })));

      return res.status(200).send({
        message: `Successfully created data.`,
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
  
  updateCom: async (req, res) => {
    try {
      const {
        com_code, com_name, com_short_name, com_des, com_type, address, city, province, postal_code, country, 
        region, phone_no, contact_no, contact_name, npwp, logo, email, web_address, reg_by, image, status,
        bill_to, bill_to_address, bill_to_contact,  bill_to_attention, ship_to, ship_to_address, ship_to_contact, ship_to_attention,
      } = req.body;
      const { id } = req.params;
      // untuk mencari comcode yang sudah ada
      const findExistComCode = await Com.findOne({where: { com_type, com_code, [Op.not]: {id} }})
      if(findExistComCode){
        deleteFileWhenFailedPostOrUpdate(req.file, 'images')
        return res.status(409).send({
          message: `${com_type} code already exist`,
        });
      }

      // untuk menghapus logo lama jika sudah ada logo yang baru
      if(req.file || image === 'null'){
        const com = await Com.findOne({where: { com_type, id }});
        deleteFile(com.logo)
      }
      await Com.update({
          com_code, com_name, com_short_name, com_des,
          com_type, address, city, province, postal_code,
          country, region, phone_no, contact_no, contact_name,
          npwp, logo, email, web_address, reg_by,status,
          logo: req.file ? `images/${req.file.filename}` : image === 'null' ? null: image,
        },
        { where: { com_type, id }}
      );

      if(com_type === COM_TYPE.supplier || com_type === COM_TYPE.customer){
        const update = await ComDetail.update({
          com_code, bill_to, bill_to_address, bill_to_contact, bill_to_attention, ship_to_attention,
          ship_to, ship_to_address, ship_to_contact, reg_by
        },{ where: { com_code }})

      // jika com detail belum ada
       if(update[0] === 0){
        await ComDetail.create({com_code, bill_to, bill_to_address, bill_to_contact, bill_to_attention, ship_to_attention, ship_to, ship_to_address, ship_to_contact, reg_by})
       }
      }

      // set up socket
      if(com_type !== COM_TYPE.company){
       socketEmitGlobal(`change-${com_type}-${id}-data`, await module.exports.functionGetCom(com_type, id))
       socketEmitGlobal(`change-${com_type === COM_TYPE.company ? "company" : com_type}-data`, await module.exports.functionGetComs(com_type))
      }else{
       socketEmitGlobal(`change-${com_type === COM_TYPE.company ? "company" : com_type}-data`, await module.exports.functionGetCom(com_type, id))
      }
      // end set up socket

      return res.status(201).send({
        message: `${com_type} is successfully update`,
      });
    } catch (error) {
      deleteFileWhenFailedPostOrUpdate(req.file, 'images')
      return res.status(500).send({ message: error.message })
    }
  },
  
  updateStatusCom: async (req, res) => {
    try {
      const { status, reg_by, remarks } = req.body;
      const { id } = req.params;
      const com = await Com.findOne({
        where: { com_type: req.com_type, id },
      });

      if (!com) {
        return res.status(404).send({
          message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} does not exist`,
        });
      }

      await Com.update({reg_by, status, remarks, status_date: functionHandleStatusDate(status,com)},{ where: {com_type: req.com_type, id }});

      // set up socket io
     socketEmitGlobal(`change-${req.com_type === COM_TYPE.company ? "company" : req.com_type}-${id}-data`, await module.exports.functionGetCom(req.com_type, id))
      if(req.com_type !== COM_TYPE.company){
       socketEmitGlobal(`change-${req.com_type === COM_TYPE.company ? "company" : req.com_type}-data`, await module.exports.functionGetComs(req.com_type))
      }
      // end set up socket io

    return res.status(201).send({
      message: `successfully update status`,
    });
    } catch (error) {
      return res.status(500).send({ message: error.message })
    }
  },
  
  getCom: async (req, res) => {
    try {
      const { id } = req.params;
      
      const com = await module.exports.functionGetCom(req.com_type, id)
      if(!com){
        return res.status(404).send({
          message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} does not exist`,
        });
      }

      return res.status(200).send({
        message: `succesfully get ${req.com_type === COM_TYPE.company ? "company" : req.com_type}`,
        data: com
      });
    } catch (error) {
      return res.status(500).send({ message: error.message })
    }
  },

  getComByCode: async (req, res) => {
    try {
      const { code } = req.params;
      
      const com = await Com.findOne({
        where: { com_code: code },
        attributes: ['com_name'],
        include: [getModelEmployeeRegister()],
        attributes: {
          include: [
            [getAttributeEmployeeFullName(), 'reg_by'],
          ],
        }
      });

      if(!com) {
        return res.status(404).send({
          message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} does not exist`,
        });
      }

      return res.status(200).send({
        message: `succesfully get ${req.com_type === COM_TYPE.company ? "company" : req.com_type}`,
        data: com
      });
    } catch (error) {
      return res.status(500).send({ message: error.message })
    }
  },

  getAllComs: async (req, res) => {
    try {
      const coms = await module.exports.functionGetComs(req.com_type)
      if(!coms){
        return res.status(200).send({
          message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} does not exist`,
          data:coms,
        });  
      }
      return res.status(200).send({
        message: `succesfully get all ${req.com_type === COM_TYPE.company ? "company" : req.com_type}`,
        data:coms,
      });
    } catch (error) {
     return res.status(500).send({ message: error.message })
    }
  },

  getHoAndbranches: async (req, res) => {
    try {
      const branch = await Com.findAndCountAll({
        where: { com_type: [COM_TYPE.branch, COM_TYPE.company] },
        order: [['id', 'DESC']],
        include: [
          {
            model: ComContact,
            as: 'contact',
            required: false,
            where: {
              status: true
            },
          },
          getModelEmployeeRegister()
        ],
        attributes: {
          include: [
            [getAttributeEmployeeFullName(), 'reg_by'],
          ],
        }
      });

      branch.rows.forEach(com => {
        com.contact?.sort((a, b) => {
          // Untuk mengurutkan boolean, true (is_prefer) harus di atas false (non-is_prefer)
          if (a.is_prefer && !b.is_prefer) return -1; // a di atas b (true di atas false)
          if (!a.is_prefer && b.is_prefer) return 1; // b di atas a (false di bawah true)
          return 0; // Keduanya sama atau keduanya false
        });
      });
      
      return res.status(200).send({
        message: `Succesfully fetched all branches.`,
        data: branch,
      });
    } catch (error) {
      return res.status(500).send({ message: error.message })
    }
  },
  getAllActiveComs: async (req, res) => {
    try {
      const coms = await Com.findAndCountAll({
        order: [['id', 'DESC']],
        where:{status:true},
        include: [getModelEmployeeRegister()],
        attributes: {
          include: [
            [getAttributeEmployeeFullName(), 'reg_by'],
          ],
        }
      })
      return res.status(200).send({
        message: `Succesfully fetched all branches.`,
        data: coms,
      });
    } catch (error) {
      return res.status(500).send({ message: error.message })
    }
  },
  getHOProfile: async (req, res) => {
    try {
      let company = await Com.findOne({
        where: { com_type: COM_TYPE.company },
        include: [getModelEmployeeRegister()],
        attributes: {
          include: [
            [getAttributeEmployeeFullName(), 'reg_by'],
          ],
        }
      });

      if (!company) {
        return res.status(404).send({
          message: "Company has not registered yet",
        });
      }
      return res.status(200).send({
        message: "Succesfully fetched item.",
        data: company,
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
};