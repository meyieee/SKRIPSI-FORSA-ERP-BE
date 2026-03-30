const EmployeeRegister = require("../models/tbl_emp_regs");

const getModelEmployeeRegister = (alias) => {
  const fieldAlias = alias || 'reg_by_detail';
    return {
      model: EmployeeRegister,
      as:  fieldAlias,
      attributes: [],
    };
  };


module.exports = { getModelEmployeeRegister };