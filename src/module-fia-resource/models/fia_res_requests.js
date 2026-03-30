// model untuk tabel adm_fia_online_req sudah dibuat oleh Meilyan
const { Model, DataTypes } = require("sequelize");
class fia_res_requests extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

        document_no: { type: DataTypes.STRING, field: "ref_request_no" },
        request_type: { type: DataTypes.STRING, field: "request_type" },
        created: { type: DataTypes.DATE, field: "request_date" },
        raised_by: { type: DataTypes.STRING, field: "request_by" },

        request_purpose: { type: DataTypes.STRING, field: "request_purpose" },
        project_desc: { type: DataTypes.STRING, field: "request_description" },
        department: { type: DataTypes.STRING, field: "department" },
        priority: { type: DataTypes.STRING, field: "priority" },

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

module.exports = fia_res_requests;
