const { Model, DataTypes } = require('sequelize');

class adm_fia_control_feature extends Model {
    static init(sequelize) {
        super.init({
            parent_feature_id: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            feature_name: {
                type: DataTypes.STRING(150),
                allowNull: false
            },
            code: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true
            },
            description: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            route_path: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            icon: {
                type: DataTypes.STRING(50),
                allowNull: true
            },
            display_order: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 0
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: true
            }
        }, {
            sequelize,
            tableName: 'adm_fia_control_feature',
            underscored: true,
            timestamps: true
        })
    }

    static associate(models) {
        // Self-referencing untuk hierarki (parent)
        adm_fia_control_feature.belongsTo(models.adm_fia_control_feature, { 
            foreignKey: 'parent_feature_id', 
            targetKey: 'id', 
            as: 'parent' 
        });
        
        // Self-referencing untuk hierarki (children)
        adm_fia_control_feature.hasMany(models.adm_fia_control_feature, { 
            foreignKey: 'parent_feature_id', 
            sourceKey: 'id', 
            as: 'children' 
        });
        
        // Feature has many RolePrivileges
        adm_fia_control_feature.hasMany(models.adm_fia_control_role_privilege, { 
            foreignKey: 'feature_id', 
            sourceKey: 'id', 
            as: 'rolePrivileges' 
        });
    }
}

module.exports = adm_fia_control_feature;

