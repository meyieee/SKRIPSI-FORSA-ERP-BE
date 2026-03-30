const { Model, DataTypes } = require('sequelize');

class adm_cf_21_officers extends Model {
    static init(sequelize) {
        super.init({
              id_number: DataTypes.STRING,
              officer_qualification: DataTypes.STRING,
              officer_type: DataTypes.STRING,
              remarks: DataTypes.STRING,
              reg_by: DataTypes.STRING,
              status: DataTypes.BOOLEAN,
              status_date: DataTypes.DATE,
        }, {
            sequelize
        })
    }

    static associate(models) {
        adm_cf_21_officers.belongsTo(models.tbl_emp_regs, {
            foreignKey: 'id_number', // Foreign key di model adm_cf_21_officers
            targetKey: 'id_number',  // Primary key di model tbl_emp_regs
            as: 'officer_detail' // alias
          });
          
        adm_cf_21_officers.belongsTo(models.tbl_emp_regs, { 
            foreignKey: 'reg_by', // Foreign key di model adm_cf_21_officers
            targetKey: 'id_number', // Primary key di model tbl_emp_regs
            as : 'reg_by_detail'
        });
    }
}

module.exports = adm_cf_21_officers;