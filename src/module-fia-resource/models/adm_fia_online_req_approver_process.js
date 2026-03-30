const { Model, DataTypes } = require("sequelize");

class adm_fia_online_req_approver_process extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

        request_no: { type: DataTypes.STRING, field: "request_no" }, // -> adm_fia_online_req.ref_request_no
        com_code: { type: DataTypes.STRING, field: "com_code" }, // -> adm_cf_00_coms.com_code
        section_code: { type: DataTypes.STRING, field: "section_code" }, // -> adm_cf_11_depts_section.section_code
        approver_type: { type: DataTypes.STRING, field: "approver_type" }, // -> adm_fia_online_req_approver_type.approver_type
        approver_status: { type: DataTypes.STRING, field: "approver_status" },

        approver_id: { type: DataTypes.STRING, field: "approver_id" }, // -> tbl_emp_regs.id_number
        approved_date: { type: DataTypes.DATE, field: "approved_date" },
        comments: { type: DataTypes.STRING, field: "comments" },
      },
      {
        sequelize,
        tableName: "adm_fia_online_req_approver_process",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );
  }

  static associate(models) {
    /*
      belongsTo:
        foreignKey: kolom di tabel ini
        targetKey: kolom di tabel relasi
    */

    // request_no -> request header (adm_fia_online_req)
    adm_fia_online_req_approver_process.belongsTo(models.adm_fia_online_req, {
      foreignKey: "request_no",
      targetKey: "ref_request_no",
      as: "request_detail",
    });

    adm_fia_online_req_approver_process.belongsTo(models.adm_cf_00_coms, {
      foreignKey: "com_code",
      targetKey: "com_code",
      as: "company_detail",
    });

    adm_fia_online_req_approver_process.belongsTo(
      models.adm_cf_11_depts_section,
      {
        foreignKey: "section_code",
        targetKey: "section_code",
        as: "section_detail",
      }
    );

    // approver_type -> master approver type
    adm_fia_online_req_approver_process.belongsTo(
      models.adm_fia_online_req_approver_type,
      {
        foreignKey: "approver_type",
        targetKey: "approver_type",
        as: "approver_type_detail",
      }
    );

    // approver_id -> employee (id_number)
    adm_fia_online_req_approver_process.belongsTo(models.tbl_emp_regs, {
      foreignKey: "approver_id",
      targetKey: "id_number",
      as: "approver_employee",
    });
  }
}

module.exports = adm_fia_online_req_approver_process;
