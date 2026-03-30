const { Model, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        id_number: DataTypes.STRING,
        name: DataTypes.STRING,
        password: DataTypes.STRING,
        role: DataTypes.STRING, // Keep untuk backward compatibility
        role_id: DataTypes.INTEGER, // FK untuk integrity
        status: DataTypes.BOOLEAN,
        remarks: DataTypes.STRING,
        created_by: DataTypes.STRING
      },
      {
        sequelize,
        hooks: {
          beforeCreate: async (user) => {
            const salt = bcrypt.genSaltSync();
            user.password = bcrypt.hashSync(user.password, salt);
            
            // Sync role_name dari role_id jika role_id ada tapi role kosong
            if (user.role_id && !user.role) {
              const Role = sequelize.models.adm_fia_control_user_role;
              if (Role) {
                const role = await Role.findByPk(user.role_id);
                if (role) {
                  user.role = role.role_name;
                }
              }
            }
          },
          beforeUpdate: async (user) => {
            if (user.changed('password')) {
              const salt = bcrypt.genSaltSync();
              user.password = bcrypt.hashSync(user.password, salt);
            }
            
            // Sync role_name dari role_id jika role_id berubah
            if (user.changed('role_id') && user.role_id) {
              const Role = sequelize.models.adm_fia_control_user_role;
              if (Role) {
                const role = await Role.findByPk(user.role_id);
                if (role) {
                  user.role = role.role_name;
                }
              }
            }
          },
        },
      }
    );
  }

  static associate(models) {
    User.belongsTo(models.tbl_emp_regs, { 
      foreignKey: 'id_number', 
      targetKey: 'id_number', 
      as: 'employees' 
    });
    
    // Association ke Role menggunakan role_id
    User.belongsTo(models.adm_fia_control_user_role, { 
      foreignKey: 'role_id', 
      targetKey: 'id', 
      as: 'roleDetail' 
    });
  }
}

module.exports = User;
