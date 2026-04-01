// src/module-fia-resource/models/fia_res_online_feeds_tasks.js
const { Model, DataTypes } = require("sequelize");

class fia_res_online_feeds_tasks extends Model {
  static init(sequelize) {
    super.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

        task_no: { type: DataTypes.STRING(20), allowNull: false, unique: true },

        assigned_by_id: { type: DataTypes.STRING(15), allowNull: false },
        assigned_by_name: { type: DataTypes.STRING(100), allowNull: false },

        assigned_to_id: { type: DataTypes.STRING(15), allowNull: false },
        assigned_to_name: { type: DataTypes.STRING(100), allowNull: false },

        image_key: { type: DataTypes.STRING(150), allowNull: true }, // sekarang boleh simpan path juga

        subject: { type: DataTypes.STRING(255), allowNull: false },
        short_description: { type: DataTypes.TEXT, allowNull: true },

        tasks_datetime: { type: DataTypes.DATE, allowNull: false },
        due_datetime: { type: DataTypes.DATE, allowNull: true },

        priority: { type: DataTypes.STRING(5), allowNull: false },

        status: {
          type: DataTypes.STRING(20),
          allowNull: false,
          defaultValue: "Outstanding",
        },

        complete_datetime: { type: DataTypes.DATE, allowNull: true },

        post_date: { type: DataTypes.DATEONLY, allowNull: true },
        task_owner: { type: DataTypes.STRING(100), allowNull: true },

        deleted_at: { type: DataTypes.DATE, allowNull: true },
      },
      {
        sequelize,
        tableName: "fia_res_online_feeds_tasks",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );
  }

  static associate(models) {
    // JOIN ke tbl_emp_regs via id_number (15 digit)
    // as harus sama dengan yang dipakai di controller (assignedBy / assignedTo)
    this.belongsTo(models.tbl_emp_regs, {
      foreignKey: "assigned_by_id",
      targetKey: "id_number",
      as: "assignedBy",
    });

    this.belongsTo(models.tbl_emp_regs, {
      foreignKey: "assigned_to_id",
      targetKey: "id_number",
      as: "assignedTo",
    });

    this.hasMany(models.fia_res_online_feeds_tasks_messages, {
      foreignKey: "task_id",
      sourceKey: "id",
      as: "messages",
    });
  }
}

module.exports = fia_res_online_feeds_tasks;
