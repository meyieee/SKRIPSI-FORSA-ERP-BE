const { Model, DataTypes } = require('sequelize');

class adm_fia_control_user_role extends Model {
    static init(sequelize) {
        super.init({
            role_name: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true
            },
            description: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            role_category: {
                type: DataTypes.STRING(50),
                allowNull: false
            },
            remarks: {
                type: DataTypes.TEXT,
                allowNull: false
            }
        }, {
            sequelize,
            tableName: 'adm_fia_control_user_role',
            underscored: true,
            timestamps: true
        })
    }

    static associate(models) {
        // Role has many Users
        adm_fia_control_user_role.hasMany(models.User, { 
            foreignKey: 'role_id', 
            sourceKey: 'id', 
            as: 'users' 
        });
        
        // Role has many RolePrivileges
        adm_fia_control_user_role.hasMany(models.adm_fia_control_role_privilege, { 
            foreignKey: 'role_id', 
            sourceKey: 'id', 
            as: 'rolePrivileges' 
        });
    }
}

module.exports = adm_fia_control_user_role;

