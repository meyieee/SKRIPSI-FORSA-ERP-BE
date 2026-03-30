const { Model, DataTypes } = require('sequelize');

class adm_fia_online_req_inspect extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      ref_request_no: DataTypes.STRING,
      defect_description: DataTypes.TEXT,
      condition_status: DataTypes.STRING,
      category: DataTypes.STRING,
      recommended_action: DataTypes.TEXT,
      assigned_to: DataTypes.STRING,
      due_date: DataTypes.DATE,
      action_taken: DataTypes.TEXT,
      result: DataTypes.TEXT,
      status: DataTypes.STRING
    }, {
      sequelize,
      tableName: 'adm_fia_online_req_inspect',
      timestamps: true,
      underscored: true,
      indexes: [
        // INDEX - ref_request_no
        {
          name: 'idx_ref_inspect',
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

module.exports = adm_fia_online_req_inspect;




