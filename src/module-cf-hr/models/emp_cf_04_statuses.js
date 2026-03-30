const { Model, DataTypes } = require('sequelize');

class emp_cf_04_statuses extends Model {
  static init(sequelize) {
    super.init({
      emp_status: DataTypes.STRING,
      emp_status_des: DataTypes.STRING,
      reg_by: DataTypes.STRING,
      status: DataTypes.BOOLEAN,
      // status_date: DataTypes.DATE,
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

module.exports = emp_cf_04_statuses;