const { Model, DataTypes } = require('sequelize');

class emp_cf_per_job_workday extends Model {
  static init(sequelize) {
    super.init({
      work_day: DataTypes.STRING,
      work_day_des: DataTypes.STRING,
      work_days: DataTypes.INTEGER,
      off_days: DataTypes.INTEGER,
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

module.exports = emp_cf_per_job_workday;