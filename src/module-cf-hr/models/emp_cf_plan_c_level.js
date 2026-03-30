const { Model, DataTypes } = require('sequelize');

class emp_cf_plan_c_level extends Model {
  static init(sequelize) {
    super.init({
      level_code: DataTypes.STRING,
      level: DataTypes.STRING,
      level_description: DataTypes.STRING,
      management_type: DataTypes.STRING,
      level_short_des: DataTypes.STRING,
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

module.exports = emp_cf_plan_c_level;