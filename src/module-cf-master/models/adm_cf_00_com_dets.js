const { Model, DataTypes } = require('sequelize');

class adm_cf_00_com_dets extends Model {
    static init(sequelize) {
        super.init({
            com_code: DataTypes.STRING,
            bill_to: DataTypes.STRING,
            bill_to_address: DataTypes.STRING,
            bill_to_contact: DataTypes.STRING,
            bill_to_attention: DataTypes.STRING,
            ship_to: DataTypes.STRING,
            ship_to_address: DataTypes.STRING,
            ship_to_contact: DataTypes.STRING,
            ship_to_attention: DataTypes.STRING,
            reg_by: DataTypes.STRING,
        }, {
            sequelize
        })
    }

    static associate(models) {
        // this.hasOne(models.User, { foreignKey: 'address_id', as: 'user' });

        // this.hasMany(models.Address, { foreignKey: 'user_id', as: 'address' });
    //   this.belongsTo(models.adm_cf_00_coms, { foreignKey: 'com_code', as: 'adm_cf_00_coms' });
    }
}

module.exports = adm_cf_00_com_dets;