const { Model, DataTypes } = require('sequelize');

class adm_cf_03_contracts_files extends Model {
    static init(sequelize) {
        super.init({
            contract_id: DataTypes.STRING,
            file_url: DataTypes.STRING,
        }, {
            sequelize
        })
    }

    static associate(models) {
    this.belongsTo(models.adm_cf_03_contracts, { foreignKey: 'contract_id', as: 'adm_cf_03_contracts' });
}
}

module.exports = adm_cf_03_contracts_files;