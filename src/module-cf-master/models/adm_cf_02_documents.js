const { Model, DataTypes } = require('sequelize');

class adm_cf_02_documents extends Model {
    static init(sequelize) {
        super.init({
            com_code: DataTypes.STRING,
            doc_code: DataTypes.STRING,
            doc_name: DataTypes.STRING,
            file_url: DataTypes.STRING,
            remarks: DataTypes.STRING,
            status: DataTypes.BOOLEAN,
            status_date: DataTypes.DATE,
            reg_by: DataTypes.STRING,
        }, {
            sequelize
        })
    }

    static associate(models) {
      this.belongsTo(models.adm_cf_00_coms, { foreignKey: 'com_code', as: 'adm_cf_00_coms' });
    }
}

module.exports = adm_cf_02_documents;