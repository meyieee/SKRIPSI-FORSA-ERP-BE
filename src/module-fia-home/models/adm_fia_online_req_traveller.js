const { Model, DataTypes } = require('sequelize');

class adm_fia_online_req_traveller extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      ref_request_no: DataTypes.STRING,
      last_name: DataTypes.STRING,
      first_name: DataTypes.STRING,
      category: DataTypes.STRING,
      comments: DataTypes.STRING
    }, {
      sequelize,
      tableName: 'adm_fia_online_req_traveller',
      timestamps: true,
      underscored: true,
      indexes: [
        // INDEX - ref_request_no
        {
          name: 'idx_ref_traveler',
          fields: ['ref_request_no']
        }
      ]
    })
  }

  static associate(models) {
    // Association dengan adm_fia_online_req
    this.belongsTo(models.adm_fia_online_req, {
      foreignKey: 'ref_request_no',
      targetKey: 'ref_request_no',
      as: 'request'
    });
  }
}

module.exports = adm_fia_online_req_traveller;




