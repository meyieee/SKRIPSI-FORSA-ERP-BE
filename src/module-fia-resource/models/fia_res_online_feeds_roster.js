// src/module-fia-resource/models/fia_res_roster_notes.js
const { Model, DataTypes } = require("sequelize");

class fia_res_online_feeds_roster extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },

        emp_id: {
          type: DataTypes.STRING(15),
          allowNull: false,
        },

        note_date: {
          type: DataTypes.DATEONLY, // YYYY-MM-DD
          allowNull: false,
        },

        note_text: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },

        deleted_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "fia_res_online_feeds_roster",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );
  }

  static associate(models) {
    // nanti kalau mau relasi ke tabel employee bisa taruh di sini
  }
}

module.exports = fia_res_online_feeds_roster;
