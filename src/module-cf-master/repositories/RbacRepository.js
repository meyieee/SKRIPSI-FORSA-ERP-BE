// Menggunakan model dari database connection yang sudah diinisialisasi
const connection = require('../../database');
const adm_fia_control_user_role = connection.models.adm_fia_control_user_role;
const adm_fia_control_user_privilege = connection.models.adm_fia_control_user_privilege;
const adm_fia_control_feature = connection.models.adm_fia_control_feature;
const adm_fia_control_role_privilege = connection.models.adm_fia_control_role_privilege;

module.exports = {
  /**
   * Get all permissions for a role (for login response)
   * @param {number} roleId - Role ID
   * @returns {Promise<Array>} Array of permissions with route_path, featureName, privilege
   */
  getAllRolePermissions: async (roleId) => {
    try {
      const permissions = await adm_fia_control_role_privilege.findAll({
        where: { 
          role_id: roleId,
          is_active: true  // Hanya ambil yang aktif
        },
        include: [
          {
            model: adm_fia_control_user_privilege,
            as: 'privilege',
            attributes: ['id', 'privilege_r', 'description'],
            required: true  // INNER JOIN - hanya ambil yang punya privilege
          },
          {
            model: adm_fia_control_feature,
            as: 'feature',
            attributes: ['id', 'feature_name', 'code', 'route_path'],
            required: true  // INNER JOIN - hanya ambil yang punya feature
          }
        ],
        raw: false
      });

      // Format untuk frontend dengan null check
      return permissions
        .filter(perm => perm.feature && perm.privilege)  // Filter null values
        .map(perm => ({
          routePath: perm.feature?.route_path || null,
          featureName: perm.feature?.feature_name || null,
          featureCode: perm.feature?.code || null,
          privilege: perm.privilege?.privilege_r || null,
          privilegeDescription: perm.privilege?.description || null
        }));
    } catch (error) {
      console.error('Error in getAllRolePermissions:', error);
      throw error;
    }
  },

  /**
   * Check if user has specific permission by route_path
   * @param {number} roleId - Role ID
   * @param {string} routePath - Route path (e.g., '/home/overview')
   * @param {string} privilegeCode - Privilege code (e.g., 'Read', 'Create', 'Update', 'Delete', 'UpdateA')
   * @returns {Promise<boolean>} True if user has permission, false otherwise
   */
  checkUserPermissionByRoute: async (roleId, routePath, privilegeCode) => {
    try {
      const permission = await adm_fia_control_role_privilege.findOne({
        where: { 
          role_id: roleId,
          is_active: true  // Hanya check yang aktif
        },
        include: [
          {
            model: adm_fia_control_user_privilege,
            as: 'privilege',
            where: { privilege_r: privilegeCode },
            attributes: ['id', 'privilege_r'],
            required: true  // INNER JOIN
          },
          {
            model: adm_fia_control_feature,
            as: 'feature',
            where: { route_path: routePath },
            attributes: ['id', 'route_path'],
            required: true  // INNER JOIN
          }
        ],
        raw: false
      });
      return permission !== null && permission.feature !== null && permission.privilege !== null;
    } catch (error) {
      console.error('Error in checkUserPermissionByRoute:', error);
      return false;  // Return false jika error, lebih safe
    }
  },

  /**
   * Get user permissions by route_path (all privileges for a route)
   * @param {number} roleId - Role ID
   * @param {string} routePath - Route path
   * @returns {Promise<Array>} Array of privileges for the route
   */
  getUserPermissionsByRoutePath: async (roleId, routePath) => {
    try {
      const permissions = await adm_fia_control_role_privilege.findAll({
        where: { 
          role_id: roleId,
          is_active: true  // Hanya ambil yang aktif
        },
        include: [
          {
            model: adm_fia_control_user_privilege,
            as: 'privilege',
            attributes: ['id', 'privilege_r', 'description'],
            required: true  // INNER JOIN
          },
          {
            model: adm_fia_control_feature,
            as: 'feature',
            where: { route_path: routePath },
            attributes: ['id', 'feature_name', 'code', 'route_path'],
            required: true  // INNER JOIN
          }
        ],
        raw: false
      });
      
      // Filter null values
      return permissions.filter(perm => perm.feature && perm.privilege);
    } catch (error) {
      console.error('Error in getUserPermissionsByRoutePath:', error);
      return [];  // Return empty array jika error
    }
  }
};

