const { Model, DataTypes } = require("sequelize");

class adm_fia_online_req_approver_type extends Model {
  static init(sequelize) {
    super.init(
      {
        approver_type: DataTypes.STRING,
        approver_description: DataTypes.STRING,
        routine: DataTypes.STRING,
        remarks: DataTypes.STRING,
        update_by: DataTypes.STRING, // id_number dari tbl_emp_regs
      },
      {
        sequelize,
        tableName: "adm_fia_online_req_approver_type",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );
  }

  static associate(models) {
    adm_fia_online_req_approver_type.belongsTo(models.tbl_emp_regs, {
      foreignKey: "update_by",
      targetKey: "id_number",
      as: "updated_by_employee",
    });
  }
}

module.exports = adm_fia_online_req_approver_type;
