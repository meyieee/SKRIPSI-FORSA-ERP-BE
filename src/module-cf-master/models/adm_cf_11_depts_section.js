const { Model, DataTypes } = require("sequelize");

class adm_cf_11_depts_section extends Model {
  static init(sequelize) {
    super.init(
      {
        section_code: DataTypes.STRING,
        section_description: DataTypes.STRING,
        dept_code: DataTypes.STRING,
        remarks: DataTypes.STRING,
        update_by: DataTypes.STRING,
      },
      {
        sequelize,
        tableName: "adm_cf_11_depts_section",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );
  }

  static associate(models) {
    adm_cf_11_depts_section.belongsTo(models.adm_cf_11_dept, {
      foreignKey: "dept_code",
      targetKey: "dept_code",
      as: "department_detail",
    });

    adm_cf_11_depts_section.belongsTo(models.tbl_emp_regs, {
      foreignKey: "update_by",
      targetKey: "id_number",
      as: "updated_by_employee",
    });
  }
}

module.exports = adm_cf_11_depts_section;
