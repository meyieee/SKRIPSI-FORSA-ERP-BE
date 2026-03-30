// src/module-fia-resource/models/fia_res_online_feeds_tasks_messages.js
const { Model, DataTypes } = require("sequelize");

class fia_res_online_feeds_tasks_messages extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },

        task_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },

        sender_id: {
          type: DataTypes.STRING(15),
          allowNull: false,
        },

        sender_name: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },

        text: {
          type: DataTypes.TEXT,
          allowNull: true,
        },

        attachments_json: {
          type: DataTypes.TEXT, // simpan JSON string
          allowNull: true,
        },

        deleted_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "fia_res_online_feeds_tasks_messages",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        paranoid: false, // kalau mau pakai deleted_at otomatis, bisa pakai paranoid: true + renamed
      }
    );
  }

  static associate(models) {
    // nanti kalau mau relasi ke tabel tasks / users, bisa ditaruh di sini
  }
}

module.exports = fia_res_online_feeds_tasks_messages;
