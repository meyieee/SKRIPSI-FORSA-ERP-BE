const { Model, DataTypes } = require('sequelize');

class adm_fia_control_user_privilege extends Model {
    static init(sequelize) {
        super.init({
            privilege_r: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: false
            }
        }, {
            sequelize,
            tableName: 'adm_fia_control_user_privilege',
            underscored: true,
            timestamps: true
        })
    }

    static associate(models) {
        // Privilege has many RolePrivileges
        adm_fia_control_user_privilege.hasMany(models.adm_fia_control_role_privilege, { 
            foreignKey: 'privilege_id', 
            sourceKey: 'id', 
            as: 'rolePrivileges' 
        });
    }
}

module.exports = adm_fia_control_user_privilege;

