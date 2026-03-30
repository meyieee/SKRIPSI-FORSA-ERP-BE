const { Model, DataTypes } = require('sequelize');

class adm_fia_control_role_privilege extends Model {
    static init(sequelize) {
        super.init({
            role_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            privilege_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            feature_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            }
        }, {
            sequelize,
            tableName: 'adm_fia_control_role_privilege',
            underscored: true,
            timestamps: true
        })
    }

    static associate(models) {
        // RolePrivilege belongsTo Role
        adm_fia_control_role_privilege.belongsTo(models.adm_fia_control_user_role, { 
            foreignKey: 'role_id', 
            targetKey: 'id', 
            as: 'role' 
        });
        
        // RolePrivilege belongsTo Privilege
        adm_fia_control_role_privilege.belongsTo(models.adm_fia_control_user_privilege, { 
            foreignKey: 'privilege_id', 
            targetKey: 'id', 
            as: 'privilege' 
        });
        
        // RolePrivilege belongsTo Feature
        adm_fia_control_role_privilege.belongsTo(models.adm_fia_control_feature, { 
            foreignKey: 'feature_id', 
            targetKey: 'id', 
            as: 'feature' 
        });
    }
}

module.exports = adm_fia_control_role_privilege;

