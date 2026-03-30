const { Model, DataTypes } = require("sequelize");

class fia_res_approvals extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

        document_no: { type: DataTypes.STRING, field: "ref_request_no" },
        request_type: { type: DataTypes.STRING, field: "request_type" },
        created: { type: DataTypes.DATE, field: "request_date" },
        raised_by: { type: DataTypes.STRING, field: "request_by" },

        approval_status: { type: DataTypes.STRING, field: "approval_status" },

        // reviewer / precheck
        check_by: { type: DataTypes.STRING, field: "check_by" },
        check_comments: { type: DataTypes.STRING, field: "check_comments" },
        check_date: { type: DataTypes.DATE, field: "check_date" },

        // approver level
        approve_one: { type: DataTypes.STRING, field: "approve_one" },
        approve_one_date: { type: DataTypes.DATE, field: "approve_one_date" },
        approve_second_by: {
          type: DataTypes.STRING,
          field: "approve_second_by",
        },
        approve_second_date: {
          type: DataTypes.DATE,
          field: "approve_second_date",
        },
        approve_third_by: { type: DataTypes.STRING, field: "approve_third_by" },
        approve_third_date: {
          type: DataTypes.DATE,
          field: "approve_third_date",
        },

        is_draft: { type: DataTypes.BOOLEAN, field: "is_draft" },
        comments: { type: DataTypes.STRING, field: "comments" },
        add_comments: { type: DataTypes.STRING, field: "add_comments" },
      },
      {
        sequelize,
        tableName: "adm_fia_online_req",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );
  }
  static associate(models) {
    // belum ada relasi, biarin kosong
  }
}

module.exports = fia_res_approvals;
