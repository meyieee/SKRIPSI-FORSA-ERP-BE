const EmployeeType = require("../models/emp_cf_01_types")
const EmployeeClass = require("../models/emp_cf_02_class")
const EmploymentType = require("../models/emp_cf_03_employtypes")
const PostTitle = require("../models/emp_cf_plan_posttitle")

const getModelEmployeeType = (alias, atts) =>{
  const fieldAttributes = atts || ['emp_type_des']
  return {
    model: EmployeeType,
    as:  alias,
    attributes: fieldAttributes
  };
}

const getModelEmployeeClass = (alias, atts) =>{
  const fieldAttributes = atts || ['emp_class_des']
  return {
    model: EmployeeClass,
    as:  alias,
    attributes: fieldAttributes
  };
}

const getModelEmploymentType = (alias, atts) =>{
  const fieldAttributes = atts || ['employ_type_des']
  return {
    model: EmploymentType,
    as:  alias,
    attributes: fieldAttributes
  };
}

const getModelPostTitle = (alias, atts) =>{
  const fieldAttributes = atts || ['title_des']
  return {
    model: PostTitle,
    as:  alias,
    attributes: fieldAttributes
  };
}

module.exports = { getModelEmployeeClass, getModelEmployeeType, getModelEmploymentType, getModelPostTitle };