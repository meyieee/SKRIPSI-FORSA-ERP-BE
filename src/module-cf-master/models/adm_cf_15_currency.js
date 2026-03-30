const { Model, DataTypes } = require('sequelize');

class adm_cf_15_currency extends Model {
    static init(sequelize) {
        super.init({
            currency: DataTypes.STRING,
            currency_name: DataTypes.STRING,
            used_in: DataTypes.STRING,
            reg_by: DataTypes.STRING,
            is_default: DataTypes.BOOLEAN,
            status: DataTypes.BOOLEAN,
            status_date: DataTypes.DATE,
            remarks: DataTypes.STRING,
        }, {
            sequelize
        })
    }

    static associate(models) {
        adm_cf_15_currency.belongsTo(models.tbl_emp_regs, {
            foreignKey: 'reg_by', //dari table ini
            targetKey: 'id_number',  // dari table parent (emp_regs)
            as : 'reg_by_detail'// alias
          });
    }
}

module.exports = adm_cf_15_currency;
