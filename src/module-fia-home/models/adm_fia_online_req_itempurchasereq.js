const { Model, DataTypes } = require('sequelize');

class adm_fia_online_req_itempurchasereq extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      ref_request_no: DataTypes.STRING,
      stockcode: DataTypes.STRING,
      stock_description: DataTypes.STRING,
      item_type: DataTypes.STRING,
      quantity: DataTypes.INTEGER,
      unit_price: DataTypes.DECIMAL(24, 9)
    }, {
      sequelize,
      tableName: 'adm_fia_online_req_itempurchasereq',
      timestamps: true,
      underscored: true,
      indexes: [
        // INDEX - ref_request_no
        {
          name: 'idx_ref_itempurchase',
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

module.exports = adm_fia_online_req_itempurchasereq;




