const { Model, DataTypes } = require('sequelize');

class adm_cf_14_account extends Model {
    static init(sequelize) {
        super.init({
            account_no: DataTypes.STRING,
            account_name: DataTypes.STRING,
            account_type: DataTypes.STRING,
            account_group: DataTypes.STRING,
            normally: DataTypes.STRING,
            reg_by: DataTypes.STRING,
            status: DataTypes.BOOLEAN,
            status_date: DataTypes.DATE,
            remarks: DataTypes.STRING,
        }, {
            sequelize
        })
    }

    static associate(models) {
        adm_cf_14_account.belongsTo(models.tbl_emp_regs, {
            foreignKey: 'reg_by', //dari table ini
            targetKey: 'id_number',  // dari table parent (emp_regs)
            as : 'reg_by_detail'// alias
          });
    }
}

module.exports = adm_cf_14_account;