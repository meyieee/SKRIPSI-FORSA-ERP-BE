const { Model, DataTypes } = require('sequelize');

class adm_cf_00_coms extends Model {
    static init(sequelize) {
        super.init({
            com_code: DataTypes.STRING,
            com_name: DataTypes.STRING,
            com_short_name: DataTypes.STRING,
            com_des: DataTypes.STRING,
            com_type: DataTypes.STRING,
            address: DataTypes.STRING,
            city: DataTypes.STRING,
            province: DataTypes.STRING,
            postal_code: DataTypes.STRING,
            country: DataTypes.STRING,
            region: DataTypes.STRING,
            phone_no: DataTypes.STRING,
            contact_no: DataTypes.STRING,
            contact_name: DataTypes.STRING,
            npwp: DataTypes.STRING,
            logo: DataTypes.STRING,
            email: DataTypes.STRING,
            web_address: DataTypes.STRING,
            reg_by: DataTypes.STRING,
            status: DataTypes.BOOLEAN,
            status_date: DataTypes.DATE,
            remarks: DataTypes.STRING,
        }, {
            sequelize
        })
    }

    static associate(models) {
        adm_cf_00_coms.hasMany(models.adm_cf_00_com_dets, { foreignKey: 'com_code', sourceKey: 'com_code', as : 'detail'}); // foreignKey : dari table satunya, sourceKey: dari table ini
        adm_cf_00_coms.hasMany(models.adm_cf_01_contacts, { foreignKey: 'com_code', sourceKey: 'com_code', as : 'contact'}); // foreignKey : dari table satunya, sourceKey: dari table ini
        adm_cf_00_coms.belongsTo(models.tbl_emp_regs, {
            foreignKey: 'reg_by', //dari table ini
            targetKey: 'id_number',  // dari table parent (emp_regs)
            as : 'reg_by_detail'// alias
          });
    }
}

module.exports = adm_cf_00_coms;