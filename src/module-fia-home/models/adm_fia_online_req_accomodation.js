const { Model, DataTypes } = require('sequelize');

class adm_fia_online_req_accomodation extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      ref_request_no: DataTypes.STRING,
      check_in: DataTypes.DATE,
      check_out: DataTypes.DATE,
      hotel: DataTypes.STRING,
      rate: DataTypes.STRING,
      transf_req: DataTypes.STRING,
      personal: DataTypes.STRING,
      cost: DataTypes.DECIMAL(24, 9)
    }, {
      sequelize,
      tableName: 'adm_fia_online_req_accomodation',
      timestamps: true,
      underscored: true,
      indexes: [
        // INDEX - ref_request_no
        {
          name: 'idx_ref_accomodation',
          fields: ['ref_request_no']
        }
      ]
    })
  }

  static associate(models) {
    // Associations can be added here if needed
    // Example relation to adm_fia_online_req:
    // this.belongsTo(models.adm_fia_online_req, {
    //   foreignKey: 'ref_request_no',
    //   targetKey: 'ref_request_no',
    //   as: 'request_detail'
    // });
  }
}

module.exports = adm_fia_online_req_accomodation;

