const { Model, DataTypes } = require('sequelize');

class emp_cf_per_job_leavetype extends Model {
  static init(sequelize) {
    super.init({
      leave_type: DataTypes.STRING,
      leave_type_des: DataTypes.STRING,
      justification: DataTypes.STRING,
      reg_by: DataTypes.STRING,
      status: DataTypes.BOOLEAN,
      remarks: DataTypes.STRING,
    }, {
      sequelize
    })
  }
  static associate(models) {
    this.belongsTo(models.tbl_emp_regs, {
      foreignKey: 'reg_by', //dari table ini
      targetKey: 'id_number',  // dari table parent (emp_regs)
      as : 'reg_by_detail'// alias
    });
  }
}

module.exports = emp_cf_per_job_leavetype;