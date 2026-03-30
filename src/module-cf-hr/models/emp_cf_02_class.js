const { Model, DataTypes } = require('sequelize');

class emp_cf_02_classes extends Model {
  static init(sequelize) {
    super.init({
      emp_class: DataTypes.STRING,
      emp_class_des: DataTypes.STRING,
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

module.exports = emp_cf_02_classes;