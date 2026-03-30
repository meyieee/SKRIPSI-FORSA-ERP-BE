const { checkUserPermissionByRoute } = require('../module-cf-master/repositories/RbacRepository');

/**
 * Middleware untuk check permission berdasarkan route_path
 * @param {string} routePath - Route path (contoh: '/home/overview')
 * @param {string} privilegeCode - Code privilege (contoh: 'Read', 'Create', 'Update', 'Delete', 'UpdateA')
 */
const checkPermissionByRoute = (routePath, privilegeCode) => {
  return async (req, res, next) => {
    try {
      const roleId = req.user?.roleId || req.user?.role_id;
      
      if (!roleId) {
        return res.status(403).json({ 
          message: 'Access denied: No role assigned' 
        });
      }

      const hasPermission = await checkUserPermissionByRoute(roleId, routePath, privilegeCode);
      
      if (!hasPermission) {
        return res.status(403).json({ 
          message: `Access denied: You don't have ${privilegeCode} permission for ${routePath}` 
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ 
        message: 'Error checking permission', 
        error: error.message 
      });
    }
  };
};

/**
 * Middleware untuk check multiple permissions (OR logic)
 * User hanya perlu salah satu permission
 */
const checkAnyPermissionByRoute = (routePath, privilegeCodes) => {
  return async (req, res, next) => {
    try {
      const roleId = req.user?.roleId || req.user?.role_id;
      
      if (!roleId) {
        return res.status(403).json({ 
          message: 'Access denied: No role assigned' 
        });
      }

      for (const privilegeCode of privilegeCodes) {
        const hasPermission = await checkUserPermissionByRoute(roleId, routePath, privilegeCode);
        if (hasPermission) {
          return next();
        }
      }

      return res.status(403).json({ 
        message: `Access denied: You don't have required permissions for ${routePath}` 
      });
    } catch (error) {
      return res.status(500).json({ 
        message: 'Error checking permission', 
        error: error.message 
      });
    }
  };
};

module.exports = { checkPermissionByRoute, checkAnyPermissionByRoute };



