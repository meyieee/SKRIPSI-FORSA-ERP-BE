const Com = require('../models/adm_cf_00_coms');
const ComDocument = require('../models/adm_cf_02_documents')
const { Op } = require('sequelize');
const { deleteFilesWhenFailedPostOrUpdate, deleteFile, deleteFileWhenFailedPostOrUpdate } = require('../../function/deleteFiles')
const { functionHandleStatusDate } = require('../../function/updateStatusDateItem')
const COM_TYPE = require('../../constants');
const { socketEmitGlobal } = require('../../function/socketEmit')

module.exports = {
  functionGetComDocument : async(com_code) =>{
    const comDocument = await ComDocument.findAll({ where: { com_code } });
    return comDocument;
  },

  postComDocuments: async (req, res) => {

    // masih ada bug disini, krna tbl document_files telah dihapus
      return res.status(201).send({
        message: "Dummy Message",
      });
      
    // try {
    //   const { com_code, reg_by,  document } = req.body

    //   const findComCode = await Com.findOne({where:{com_code, com_type : req.com_type}})
    //   if(!findComCode){
    //     deleteFilesWhenFailedPostOrUpdate(req.files, 'documents')
    //     return res.status(404).send({
    //       message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} code does not exist`,
    //     });
    //   }

    //   const parserDocumentToObj = JSON.parse(document)
    //   if(parserDocumentToObj.length > 0){
    //     const documentCode = parserDocumentToObj.map(row => row.doc_code);
    //     const uniqueDocumentCode = [...new Set(documentCode)];
    //     if (documentCode.length !== uniqueDocumentCode.length) {
    //       deleteFilesWhenFailedPostOrUpdate(req.files, 'documents')
    //       return res.status(409).send({
    //         message: "duplicate document code.",
    //       });
    //     }

    //     const tempDocument = parserDocumentToObj.map((item)=>{
    //       return ({ ...item, com_code, reg_by, status_date : new Date()})
    //     })
    //     const comDocument = await ComDocument.bulkCreate(tempDocument)
    //     const simplifiedDocuments = comDocument.map(doc => doc.toJSON()); // simplified document datas
        
    //     const matchingKey = simplifiedDocuments.map((doc) => {
    //       const parserObj = parserDocumentToObj.find(obj => obj.doc_code === doc.doc_code);
    //       return {
    //         id: doc.id,
    //         doc_code: doc.doc_code,
    //         key: parserObj ? parserObj.key : null
    //       };
    //     });

    //     const tempDataFiles = await Promise.all(matchingKey.map(async(doc) => {
    //       const findDocuments = await req.files.find(obj => doc.key === obj.originalname[0].toString() + obj.originalname[1].toString());
    //       return {
    //         document_id: doc.id,
    //         file_url: findDocuments ? `documents/${findDocuments.filename}` : null,
    //       };
    //     }))
        
    //     await ComDocumentFiles.bulkCreate(tempDataFiles)
    //   }

    //   return res.status(201).send({
    //     message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} document is successfully add`,
    //   });
    // } catch (error) {
    //   console.log("error:",error)
    //   deleteFilesWhenFailedPostOrUpdate(req.files, 'documents')
    //   return res.status(500).send({ message: error.message })
    // }
  },

  postComDocument: async (req, res) => {
    try {
      const {com_code, doc_code, doc_name, status,reg_by} = req.body

      const findComCode = await Com.findOne({where:{com_code, com_type: req.com_type}})
      if(!findComCode){
        deleteFileWhenFailedPostOrUpdate(req.file, 'documents')
        return res.status(404).send({
          message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} does not exist`,
        });
      }

      const findDocCode = await ComDocument.findOne({where:{doc_code, com_code}})
      if(findDocCode){
        deleteFileWhenFailedPostOrUpdate(req.file, 'documents')
        return res.status(409).send({
          message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} document Code already exist`,
        });
      }

      await ComDocument.create({
        com_code, doc_code, doc_name, status,reg_by,
        file_url: req.file ? `documents/${req.file.filename}` : null,
        status_date: new Date(),
      });

      socketEmitGlobal(`change-${req.com_type === COM_TYPE.company ? "company" : req.com_type}-${com_code}-document-data`, await module.exports.functionGetComDocument(com_code))
      return res.status(201).send({
        message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} document is successfully add`,
      });
    } catch (error) {
      deleteFileWhenFailedPostOrUpdate(req.file, 'documents')
      return res.status(500).send({ message: error.message })
    }
  },

  updateComDocument: async (req, res) => {
    try {
      const { comcode, id } = req.params
      const { com_code, doc_code, doc_name, status,reg_by } = req.body;

      const findDocCode = await ComDocument.findOne({where:{doc_code, com_code, id: {[Op.not]: id}}})
      if(findDocCode){
        deleteFileWhenFailedPostOrUpdate(req.file, 'documents')
        return res.status(409).send({
          message: `document code already exist`,
        });
      }
      
      const checkComType = await Com.findOne({ where:{com_code :comcode,com_type : req.com_type}})
      if (!checkComType){
        deleteFileWhenFailedPostOrUpdate(req.file, 'documents')
        return res.status(404).send({
          message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} Code does not exist`,
        });
      }

      const hasComDocument = await ComDocument.findOne( {where:{com_code : comcode, id:id}});
      if (!hasComDocument) {
        deleteFileWhenFailedPostOrUpdate(req.file, 'documents')
        return res.status(404).send({
          message: `document does not exist`,
        });
      }

      const [updatedCount] =   await ComDocument.update(
        {
          com_code, doc_code, doc_name, status,reg_by,
          file_url: req.file ? `documents/${req.file.filename}` :hasComDocument.file_url,
        },
        { where: { com_code : comcode, id } }
      );
      
      if (updatedCount === 0) {
        return res.status(401).send({
          message: 'Failed to update',
        });
      }
      else if (updatedCount > 0 && req.file) {
        deleteFile(hasComDocument.file_url);
      }

      socketEmitGlobal(`change-${req.com_type === COM_TYPE.company ? "company" : req.com_type}-${com_code}-document-data`, await module.exports.functionGetComDocument(com_code))
      return res.status(201).send({
        message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} document is successfully update`,
      });
    } catch (error) {
      deleteFileWhenFailedPostOrUpdate(req.file, 'documents')
      return res.status(500).send({ message: error.message })
    }
  },

  updateStatusComDocument: async (req, res) => {
    try {
      const { comcode, id } = req.params
      const { status, reg_by, remarks } = req.body;

      const checkComType = await Com.findOne({where:{com_code :comcode,com_type : req.com_type}})
      if (!checkComType){
        return res.status(404).send({
          message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} code does not exist`,
        });
      }

      const hasComDocument = await ComDocument.findOne( {where:{com_code : comcode, id:id}});
      if (!hasComDocument) {
        return res.status(404).send({
          message: `document does not exist`,
        });
      }

      await ComDocument.update({ status, remarks, reg_by, status_date: functionHandleStatusDate(status,hasComDocument)},{ where: { com_code : comcode, id }});

      socketEmitGlobal(`change-${req.com_type === COM_TYPE.company ? "company" : req.com_type}-${comcode}-document-data`, await module.exports.functionGetComDocument(comcode))
      return res.status(201).send({
          message: `Status ${req.com_type === COM_TYPE.company ? "company" : req.com_type} document status is successfully update`,
      });
    } catch (error) {
      return res.status(500).send({ message: error.message })
    }
  },

  getAllComDocuments: async (req, res) => {
    try {
      const { comcode } = req.params;
        // mengecek com code apakah termasuk di company
        if(comcode){
          const findComCode = await Com.findOne({where:{com_code: comcode, com_type:req.com_type}})
          if(!findComCode){
            return res.status(404).send({
              message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} code does not exist`,
            });
          }

          const result = await module.exports.functionGetComDocument(comcode)
          if(!result){
            return res.status(404).send({
              message: `document is not found`,
            });
          }

          return res.status(200).send({
            message: `succesfully get documents`,
            data: result,
          });
        }
    } catch (error) {
      return res.status(500).send({ message: error.message })
    }
  },

  getComDocument: async (req, res) => {
    try {
      const { comcode, id } = req.params;

      const findComCode = await Com.findOne({where:{com_code: comcode,com_type: req.com_type}})
      if(!findComCode.com_type){
        return res.status(404).send({
          message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} code does not exist`,
        });
      }

      const comDocument = await ComDocument.findOne({ where: { com_code: comcode, id:id } });
      if(!comDocument){
        return res.status(404).send({
          message: `document does not exist`,
        });
      }

      return res.status(200).send({
        message: `succesfully get document`,
        data: comDocument
      });
    } catch (error) {
      return res.status(500).send({ message: error.message })
    }
  },
};