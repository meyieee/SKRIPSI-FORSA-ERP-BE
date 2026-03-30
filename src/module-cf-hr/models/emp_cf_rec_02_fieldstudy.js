const { Model, DataTypes } = require('sequelize');

class emp_cf_rec_02_fieldstudy extends Model {
  static init(sequelize) {
    super.init({
      field_study: DataTypes.STRING,
      field_study_description: DataTypes.STRING,
      discipline: DataTypes.STRING,
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

module.exports = emp_cf_rec_02_fieldstudy;