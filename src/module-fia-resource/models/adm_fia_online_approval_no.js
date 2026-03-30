const { Model, DataTypes } = require("sequelize");

class adm_fia_online_approval_no extends Model {
  static init(sequelize) {
    super.init(
      {
        request_type: DataTypes.STRING,
        request_name: DataTypes.STRING,
        no_approval_process: DataTypes.TINYINT,
        update_by: DataTypes.STRING, // <-- id_number employee
      },
      {
        sequelize,
        tableName: "adm_fia_online_approval_no",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );
  }

  static associate(models) {
    adm_fia_online_approval_no.belongsTo(models.tbl_emp_regs, {
      foreignKey: "update_by",
      targetKey: "id_number",
      as: "updated_by_employee",
    });
  }
}

module.exports = adm_fia_online_approval_no;
