const Com = require("../models/adm_cf_00_coms"); //CF - MASTER / SCM
const CostCenter = require("../models/adm_cf_13_costcenter");
const Department = require("../models/adm_cf_11_dept") 
const Account = require("../models/adm_cf_14_account")
const LocWork = require("../models/adm_cf_18_locwork") 
const Location = require("../models/adm_cf_17_location") 
const Currency = require("../models/adm_cf_15_currency")

const getModelCom = (alias, atts) =>{
  const fieldAttributes = atts || ['com_name']
  return {
    model: Com,
    as:  alias,
    attributes: fieldAttributes,
  };
}

const getModelCostCenter = (alias, atts) =>{
  const fieldAttributes = atts || ['c_des']
  return {
    model: CostCenter,
    as:  alias,
    attributes: fieldAttributes
  };
}

const getModelDepartment = (alias, atts) =>{
  const fieldAttributes = atts || ['dept_des']
  return {
    model: Department,
    as:  alias,
    attributes: fieldAttributes
  };
}

const getModelAccount = (alias, atts) =>{
  const fieldAttributes = atts || ['account_name']
  return {
    model: Account,
    as:  alias,
    attributes: fieldAttributes
  };
}

const getModelLockWork = (alias, atts) =>{
  const fieldAttributes = atts || ['locwork_des']
  return {
    model: LocWork,
    as:  alias,
    attributes: fieldAttributes
  };
}

const getModelCurrency = (alias, atts) =>{
  const fieldAttributes = atts || ['currency_name']
  return {
    model: Currency,
    as:  alias,
    attributes: fieldAttributes
  };
}

const getModelLocation = (alias, atts) =>{
  const fieldAttributes = atts || ['loc_des']
  return {
    model: Location,
    as:  alias,
    attributes: fieldAttributes
  };
}

module.exports = { getModelCom, getModelCostCenter, getModelAccount, getModelDepartment, getModelLockWork, getModelCurrency, getModelLocation };