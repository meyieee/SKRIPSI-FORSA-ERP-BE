const { Model, DataTypes } = require('sequelize');

class emp_cf_plan_posttitle extends Model {
  static init(sequelize) {
    super.init({
      title: DataTypes.STRING,
      title_des: DataTypes.STRING,
      work_group: DataTypes.STRING,
      work_group_des: DataTypes.STRING,
      level_code: DataTypes.STRING,
      level_des: DataTypes.STRING,
      level: DataTypes.STRING,
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

module.exports = emp_cf_plan_posttitle;