const { Model, DataTypes } = require("sequelize");

class adm_fia_online_req_approver_master extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

        app_master_code: { type: DataTypes.STRING, field: "app_master_code" },

        request_type: { type: DataTypes.STRING, field: "request_type" }, // -> approval_no.request_type
        com_code: { type: DataTypes.STRING, field: "com_code" }, // -> adm_cf_00_coms.com_code
        section_code: { type: DataTypes.STRING, field: "section_code" }, // -> adm_cf_11_depts_section.section_code

        approver_type: { type: DataTypes.STRING, field: "approver_type" }, // -> approver_type.approver_type
        routine: { type: DataTypes.STRING, field: "routine" },

        approver_id: { type: DataTypes.STRING, field: "approver_id" }, // -> tbl_emp_regs.id_number
        comments: { type: DataTypes.STRING, field: "comments" },

        update_by: { type: DataTypes.STRING, field: "update_by" }, // -> tbl_emp_regs.id_number
      },
      {
        sequelize,
        tableName: "adm_fia_online_req_approver_master",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );
  }

  static associate(models) {
    /**
     * belongsTo:
     *  foreignKey: kolom di tabel ini
     *  targetKey: kolom unik/logical key di tabel tujuan
     */
    // request_type -> approval no master
    adm_fia_online_req_approver_master.belongsTo(
      models.adm_fia_online_approval_no,
      {
        foreignKey: "request_type",
        targetKey: "request_type",
        as: "request_type_detail",
      }
    );

    // com_code -> company/branch master
    adm_fia_online_req_approver_master.belongsTo(models.adm_cf_00_coms, {
      foreignKey: "com_code",
      targetKey: "com_code",
      as: "company_detail",
    });

    // section_code -> section master
    adm_fia_online_req_approver_master.belongsTo(
      models.adm_cf_11_depts_section,
      {
        foreignKey: "section_code",
        targetKey: "section_code",
        as: "section_detail",
      }
    );

    // approver_type -> approver type master
    adm_fia_online_req_approver_master.belongsTo(
      models.adm_fia_online_req_approver_type,
      {
        foreignKey: "approver_type",
        targetKey: "approver_type",
        as: "approver_type_detail",
      }
    );

    // approver_id -> employee (id_number)
    adm_fia_online_req_approver_master.belongsTo(models.tbl_emp_regs, {
      foreignKey: "approver_id",
      targetKey: "id_number",
      as: "approver_employee",
    });

    // update_by -> employee (id_number)
    adm_fia_online_req_approver_master.belongsTo(models.tbl_emp_regs, {
      foreignKey: "update_by",
      targetKey: "id_number",
      as: "updated_by_employee",
    });
  }
}

module.exports = adm_fia_online_req_approver_master;
