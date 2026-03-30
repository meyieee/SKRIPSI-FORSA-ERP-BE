const { Model, DataTypes } = require('sequelize');

class emp_cf_plan_d_grade extends Model {
  static init(sequelize) {
    super.init({
      grade_code: DataTypes.STRING,
      grade: DataTypes.STRING,
      grade_degree: DataTypes.STRING,
      grade_description: DataTypes.STRING,
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

module.exports = emp_cf_plan_d_grade;