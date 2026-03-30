const Com = require('../models/adm_cf_00_coms');
const ComContract = require('../models/adm_cf_03_contracts')
const ComContractFiles = require('../models/adm_cf_03_contracts_files')
const { Op } = require('sequelize');
const { deleteFilesWhenFailedPostOrUpdate, deleteContractFiles } = require('../../function/deleteFiles')
const { functionHandleStatusDate } = require('../../function/updateStatusDateItem')
const COM_TYPE = require('../../constants');
const { socketEmitGlobal } = require('../../function/socketEmit')

module.exports = {
  functionGetComContracts: async(com_code)=>{
    const comContract = await ComContract.findAll({ where: { com_code } });
    let newArrayContract = []
    // looping contract, dan data yang didapatkan dimasukan kedalam new array contract
    for(let i = 0; i < comContract.length; i++){
     const newComContract = comContract[i].dataValues;
     const comContractFiles = await ComContractFiles.findAll({where:{ contract_id:comContract[i].dataValues.id}})
      let newArrayContractFiles = []
    // looping contract files, dan data yang didapatkan dimasukan kedalam new array contract
      for(let i = 0; i < comContractFiles.length; i++){
            newArrayContractFiles.push(comContractFiles[i].dataValues)
        }
        newComContract.files = newArrayContractFiles;
        newArrayContract.push(newComContract)
    }
    return newArrayContract;
  },

  postComContracts: async (req, res) => {
    try {
      const { com_code, contracts, reg_by } = req.body

      const findComCode = await Com.findOne({where:{com_code, com_type: req.com_type}})
      if(!findComCode){
        deleteFilesWhenFailedPostOrUpdate(req.files, 'documents')
        return res.status(404).send({
          message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} code does not exist`
        });
      }

      let objContracts = JSON.parse(contracts)
      if(objContracts.length > 0){
        const contractsCode = objContracts.map(row => row.contract_code);
        const uniqueContractsCode = [...new Set(contractsCode)];
        if (contractsCode.length !== uniqueContractsCode.length) {
          deleteFilesWhenFailedPostOrUpdate(req.files, 'documents')
          return res.status(409).send({
            message: `duplicate contract code.`,
          });
        }

        const tempContracts = objContracts.map((item)=>{
          return ({ ...item, com_code, reg_by, status_date : new Date()})
        })

        const comContracts = await ComContract.bulkCreate(tempContracts)
        const simplifiedContracts = comContracts.map(doc => doc.toJSON()); // simplified contract datas
        
        const matchingKey = simplifiedContracts.map((doc) => {
          const parserObj = objContracts.find(obj => obj.contract_code === doc.contract_code);
          return {
            id: doc.id,
            contract_code: doc.contract_code,
            key: parserObj ? parserObj.key : null
          };
        });

        const tempDataFiles = req.files.map((file) => {
              const findContract =  matchingKey.find(contract => contract.key === file.originalname[0].toString() + file.originalname[1].toString());
            return {
            contract_id:findContract? findContract.id : 'no_id',
            file_url: file ? `documents/${file.filename}` : null,
          };
        })
        await ComContractFiles.bulkCreate(tempDataFiles)
      }
    return res.status(201).send({
      message: `contract is successfully add`,
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
 }
},
  postComContract: async (req, res) => {
      try {
        const {com_code, contract_des, status, reg_by, contract_code} = req.body

        const findContractCode = await ComContract.findOne({where:{contract_code, com_code}})
        if(findContractCode){
          deleteFilesWhenFailedPostOrUpdate(req.files, 'documents')
          return res.status(409).send({
            message: `contract code already exist`,
          });
        }
        
        // mengecek apakah ada com code
        const findComCode = await Com.findOne({where:{com_code, com_type : req.com_type}})
        if(!findComCode){
          deleteFilesWhenFailedPostOrUpdate(req.files, 'documents')
          return res.status(404).send({
            message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} code does not exist`,
          });
        }

        const comContract = await ComContract.create({
          com_code, contract_des, status, reg_by,contract_code,
          status_date: new Date(),
        });

        // Gunakan map untuk membuat array objek baru
        const tempFiles = req.files.map(file => ({
          contract_id: comContract.id,
          file_url: file ? `documents/${file.filename}` : null,
        }));

        await ComContractFiles.bulkCreate(tempFiles);

        // set up socket io
        const socketUpdate = await module.exports.functionGetComContracts(com_code)
        socketEmitGlobal(`change-${req.com_type === COM_TYPE.company ? "company" : req.com_type}-${com_code}-contract-data`, socketUpdate)
        // end set up socket io

        return res.status(201).send({
          message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} contract is successfully add`,
        });
    } catch (error) {
      deleteFilesWhenFailedPostOrUpdate(req.files, 'documents')
      return res.status(500).send({ message: error.message });
    }
  },

  updateComContract: async (req, res) => {
    try {
      const { comcode, id } = req.params
      const { com_code, contract_des, status,reg_by, deleteContractsFile, contract_code} = req.body;
    
      const findContractCode = await ComContract.findOne({where:{contract_code, com_code, id: {[Op.not]: id}}})
      if(findContractCode!==null){
        deleteFilesWhenFailedPostOrUpdate(req.files, 'documents')
        return res.status(409).send({
          message: `contract code already exist`,
        });
      }

      const checkComType = await Com.findOne({
        where:{
          com_code :comcode,
          com_type : req.com_type
        }
      })

      if (!checkComType){
        deleteFilesWhenFailedPostOrUpdate(req.files, 'documents')
        return res.status(404).send({
          message: `company code does not exist`,
        });
      }

      const hasComContract = await ComContract.findOne( {where:{com_code : comcode, id:id}});

      if (!hasComContract) {
        deleteFilesWhenFailedPostOrUpdate(req.files, 'documents')
        return res.status(404).send({
          message: `contract does not exist`,
        });
      }

      // update detail contract
      await ComContract.update(
      {com_code, contract_des,status,reg_by, contract_code},
      { where: { com_code : comcode, id: id } }
      );

      //delete contract url (string)
      const newDeleteContractFile = JSON.parse(deleteContractsFile)
      if(newDeleteContractFile.length > 0){
        deleteContractFiles(newDeleteContractFile)
        const idArray = newDeleteContractFile.map(item => item.id);
        await ComContractFiles.destroy({ 
          where: {  
            contract_id : hasComContract.id,
            id: { [Op.in]: idArray }
          } 
        });
      }

      //tambah contract
      if(req.files.length > 0){
        const tempFiles = req.files.map(file => ({
          contract_id: hasComContract.id,
          file_url: file ? `documents/${file.filename}` : null,
        }));
        await ComContractFiles.bulkCreate(tempFiles);
      }
      
      // set up socket io
      const socketUpdate = await module.exports.functionGetComContracts(comcode)
      socketEmitGlobal(`change-${req.com_type === COM_TYPE.company ? "company" : req.com_type}-${com_code}-contract-data`, socketUpdate)
      // end set up socket io
      return res.status(201).send({
        message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} contract is successfully update`,
      });
    } catch (error) {
      deleteFilesWhenFailedPostOrUpdate(req.files, 'documents')
      return res.status(500).send({ message: error.message });
    }
  },

  updateStatusComContract: async (req, res) => {
    try {
      const { comcode, id } = req.params
      const { status, reg_by, remarks } = req.body;

      const checkComType = await Com.findOne({where:{com_code :comcode,com_type : req.com_type}})
      if (!checkComType){
        return res.status(404).send({
          message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} does not exist`,
        });
      }

      const hasComContract = await ComContract.findOne( {where:{com_code : comcode, id:id}});
      if (!hasComContract) {
        return res.status(404).send({
          message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} contract doesn't exist`,
        });
      }

      // update detail contract
      await ComContract.update({ status, reg_by, remarks, status_date: functionHandleStatusDate(status, hasComContract)},{ where: { com_code : comcode, id: id }});

      // set up socket io
      const socketUpdate = await module.exports.functionGetComContracts(comcode)
      socketEmitGlobal(`change-${req.com_type === COM_TYPE.company ? "company" : req.com_type}-${comcode}-contract-data`, socketUpdate)
      // end set up socket io

      return res.status(201).send({
        message: `Status ${req.com_type === COM_TYPE.company ? "company" : req.com_type} contract is successfully update`,
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getAllComContracts: async (req, res) => {
    try {
      const { comcode } = req.params;
        const findComCode = await Com.findOne({where:{com_code: comcode, com_type:req.com_type}})
        if(!findComCode){
          return res.status(404).send({
            message: `${req.com_type === COM_TYPE.company ? "company" : req.com_type} does not exist`,
          });
        }
        const result = await module.exports.functionGetComContracts(comcode)
        if(!result){
          return res.status(404).send({
            message: `contract is not found`,
          });
        }
        return res.status(200).send({
          message: `succesfully get all contract`,
          data: result,
        });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  getComContract: async (req, res) => {
    try {
      const { comcode, id } = req.params;

      const findComCode = await Com.findOne({where:{com_code: comcode, com_type: req.com_type}})
      if(!findComCode){
        return res.status(404).send({
          message: `company does not exist`,
        });
      }

      const comContract = await ComContract.findOne({ where: { com_code: comcode, id:id } });
      if(!comContract){
        return res.status(404).send({
          message: `contract does not exist`,
        });
      }

      const comContractFiles = await ComContractFiles.findAll( { where:{contract_id:comContract.id }})
      const newComContract = comContract.dataValues;
      let newArray = []
      for(let i = 0; i < comContractFiles.length; i++){
        newArray.push(comContractFiles[i].dataValues)
      }
      newComContract.files = newArray
      return res.status(200).send({
        message: `succesfully get ${req.com_type === COM_TYPE.company ? "company" : req.com_type} contract`,
        data: newComContract
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
};