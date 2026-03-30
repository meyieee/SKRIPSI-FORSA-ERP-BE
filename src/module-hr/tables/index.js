const tbl_emp_regs = require('../models/tbl_emp_regs.js');

const HRInit = (connection) =>{
    tbl_emp_regs.init(connection)
}

const HRAssociate = (models) =>{
    tbl_emp_regs.associate(models)
}

module.exports ={HRInit, HRAssociate}