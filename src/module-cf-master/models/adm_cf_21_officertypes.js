const { Model, DataTypes } = require('sequelize');

class adm_cf_21_officertypes extends Model {
    static init(sequelize) {
        super.init({
              officer_type: DataTypes.STRING,
              officer_type_name: DataTypes.STRING,
              remarks: DataTypes.STRING,
              status: DataTypes.BOOLEAN,
              status_date: DataTypes.DATE,
              reg_by: DataTypes.STRING,
        }, {
            sequelize
        })
    }

    static associate(models) {
        adm_cf_21_officertypes.belongsTo(models.tbl_emp_regs, {
            foreignKey: 'reg_by', //dari table ini
            targetKey: 'id_number',  // dari table parent (emp_regs)
            as : 'reg_by_detail'// alias
          });
    }
}

module.exports = adm_cf_21_officertypes;
