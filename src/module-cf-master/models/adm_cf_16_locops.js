const { Model, DataTypes } = require('sequelize');

class adm_cf_16_locops extends Model {
  static init(sequelize) {
      super.init({
        locops_code: DataTypes.STRING,
        locops_des: DataTypes.STRING,
        locwork_code: DataTypes.STRING,
        reg_by: DataTypes.STRING,
        status: DataTypes.BOOLEAN,
        remarks: DataTypes.STRING,
      }, {
        sequelize
      })
  }

  static associate(models) {
    adm_cf_16_locops.belongsTo(models.tbl_emp_regs, {
      foreignKey: 'reg_by', //dari table ini
      targetKey: 'id_number',  // dari table parent (emp_regs)
      as : 'reg_by_detail'// alias
    });
  }
}

module.exports = adm_cf_16_locops;