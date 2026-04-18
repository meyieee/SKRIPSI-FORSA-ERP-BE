'use strict';

/**
 * Bootstrap super_admin role, RBAC management feature, and full privileges for that role on the feature.
 * Assign your user to super_admin via SQL: UPDATE users SET role_id = (SELECT id FROM adm_fia_control_user_role WHERE role_name = 'super_admin') WHERE ...
 */

module.exports = {
  up: async (queryInterface) => {
    const qi = queryInterface.sequelize;

    await qi.query(
      `
      INSERT INTO adm_fia_control_user_role (role_name, description, role_category, remarks, created_at, updated_at)
      SELECT 'super_admin', 'Super administrator — RBAC feature management', 'system', 'bootstrap', NOW(), NOW()
      WHERE NOT EXISTS (
        SELECT 1 FROM adm_fia_control_user_role WHERE role_name = 'super_admin'
      );
      `,
      { raw: true }
    );

    await qi.query(
      `
      INSERT INTO adm_fia_control_feature (
        parent_feature_id, feature_name, code, description, route_path, icon, display_order, is_active, created_at, updated_at
      )
      SELECT
        NULL,
        'RBAC Feature Management',
        'CONTROLS_RBAC_FEATURES',
        'Manage adm_fia_control_feature and role privileges',
        '/controls/rbac-features',
        NULL,
        999,
        1,
        NOW(),
        NOW()
      WHERE NOT EXISTS (
        SELECT 1 FROM adm_fia_control_feature WHERE route_path = '/controls/rbac-features'
      );
      `,
      { raw: true }
    );

    await qi.query(
      `
      INSERT INTO adm_fia_control_role_privilege (role_id, privilege_id, feature_id, is_active, created_at, updated_at)
      SELECT r.id, p.id, f.id, 1, NOW(), NOW()
      FROM adm_fia_control_user_role r
      CROSS JOIN adm_fia_control_user_privilege p
      CROSS JOIN adm_fia_control_feature f
      WHERE r.role_name = 'super_admin'
        AND f.route_path = '/controls/rbac-features'
        AND p.privilege_r IN ('Read', 'Create', 'Update', 'Delete', 'UpdateA')
        AND NOT EXISTS (
          SELECT 1 FROM adm_fia_control_role_privilege rp
          WHERE rp.role_id = r.id AND rp.privilege_id = p.id AND rp.feature_id = f.id
        );
      `,
      { raw: true }
    );
  },

  down: async (queryInterface) => {
    const qi = queryInterface.sequelize;
    await qi.query(
      `
      DELETE rp FROM adm_fia_control_role_privilege rp
      INNER JOIN adm_fia_control_feature f ON rp.feature_id = f.id
      WHERE f.route_path = '/controls/rbac-features';
      `,
      { raw: true }
    );
    await qi.query(
      `DELETE FROM adm_fia_control_feature WHERE route_path = '/controls/rbac-features';`,
      { raw: true }
    );
    // Intentionally keep super_admin role to avoid breaking users that were assigned to it.
  },
};
