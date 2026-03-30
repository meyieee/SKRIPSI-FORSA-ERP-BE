const { Model, DataTypes } = require('sequelize');

class adm_cf_13_costcenter extends Model {
    static init(sequelize) {
        super.init({
            c_code: DataTypes.STRING,
            c_des: DataTypes.STRING,
            reg_by: DataTypes.STRING,
            status: DataTypes.BOOLEAN,
            status_date: DataTypes.DATE,
            remarks: DataTypes.STRING,
        }, {
            sequelize
        })
    }

    static associate(models) {
        adm_cf_13_costcenter.belongsTo(models.tbl_emp_regs, {
            foreignKey: 'reg_by', //dari table ini
            targetKey: 'id_number',  // dari table parent (emp_regs)
            as : 'reg_by_detail'// alias
          });
    }
}

module.exports = adm_cf_13_costcenter;