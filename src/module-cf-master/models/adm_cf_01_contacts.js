const { Model, DataTypes } = require('sequelize');

class adm_cf_01_contacts extends Model {
    static init(sequelize) {
        super.init({
            com_code: DataTypes.STRING,
            id_number: DataTypes.STRING,
            first_name: DataTypes.STRING,
            last_name: DataTypes.STRING,
            contact_title: DataTypes.STRING,
            contact_qualification: DataTypes.STRING,
            is_prefer: DataTypes.BOOLEAN,
            full_address: DataTypes.STRING,
            office_phone: DataTypes.STRING,
            mobile: DataTypes.STRING,
            wa: DataTypes.STRING,
            email: DataTypes.STRING,
            fax_number: DataTypes.STRING,
            photo: DataTypes.STRING,
            reg_by: DataTypes.STRING,
            status: DataTypes.BOOLEAN,
            status_date: DataTypes.DATE,
            remarks: DataTypes.STRING,
        }, {
            sequelize
        })
    }

    static associate(models) {
    this.belongsTo(models.adm_cf_00_coms, { foreignKey: 'com_code', as: 'adm_cf_00_coms' });
  
    this.belongsTo(models.tbl_emp_regs, {
        foreignKey: 'reg_by', //dari table ini
        targetKey: 'id_number',  // dari table parent (emp_regs)
        as : 'reg_by_detail'// alias
      });
}
}

module.exports = adm_cf_01_contacts;