const { Model, DataTypes } = require('sequelize');

class adm_cf_04_pictures extends Model {
    static init(sequelize) {
        super.init({
            com_code: DataTypes.STRING,
            pic_code: DataTypes.STRING,
            pic_des: DataTypes.STRING,
            remarks: DataTypes.STRING,
            status: DataTypes.BOOLEAN,
            status_date: DataTypes.DATE,
            reg_by: DataTypes.STRING,
            photo: DataTypes.STRING
        }, {
            sequelize
        })
    }

    static associate(models) {
        // this.hasOne(models.User, { foreignKey: 'address_id', as: 'user' });

        // this.hasMany(models.Address, { foreignKey: 'user_id', as: 'address' });
    //   this.belongsTo(models.adm_cf_com, { foreignKey: 'ComCode', as: 'adm_cf_com' });
    this.belongsTo(models.adm_cf_00_coms, { foreignKey: 'com_code', as: 'adm_cf_00_coms' });
  
}
}

module.exports = adm_cf_04_pictures;