const connection = require('../../database');

const Feature = connection.models.adm_fia_control_feature;
const RolePrivilege = connection.models.adm_fia_control_role_privilege;
const Role = connection.models.adm_fia_control_user_role;
const Privilege = connection.models.adm_fia_control_user_privilege;

const RBAC_MANAGEMENT_ROUTE = '/controls/rbac-features';
const SUPER_ADMIN_ROLE_NAME = 'super_admin';

const getSuperAdminRoleId = async (transaction) => {
  const r = await Role.findOne({
    where: { role_name: SUPER_ADMIN_ROLE_NAME },
    attributes: ['id'],
    raw: true,
    transaction,
  });
  return r?.id ?? null;
};

/**
 * Prevent locking out super_admin from managing RBAC UI (Read + Update required).
 */
const assertSuperAdminManagementAccess = async (featureId, transaction) => {
  const feature = await Feature.findByPk(featureId, { transaction });
  if (!feature || String(feature.route_path || '').trim() !== RBAC_MANAGEMENT_ROUTE) {
    return;
  }

  const superId = await getSuperAdminRoleId(transaction);
  if (!superId) {
    const err = new Error('super_admin role is missing');
    err.statusCode = 500;
    throw err;
  }

  const readPriv = await Privilege.findOne({
    where: { privilege_r: 'Read' },
    attributes: ['id'],
    raw: true,
    transaction,
  });
  const updatePriv = await Privilege.findOne({
    where: { privilege_r: 'Update' },
    attributes: ['id'],
    raw: true,
    transaction,
  });
  if (!readPriv || !updatePriv) {
    const err = new Error('Privilege catalog is missing Read or Update');
    err.statusCode = 500;
    throw err;
  }

  const hasRead = await RolePrivilege.findOne({
    where: {
      role_id: superId,
      feature_id: featureId,
      privilege_id: readPriv.id,
      is_active: true,
    },
    transaction,
  });
  const hasUpdate = await RolePrivilege.findOne({
    where: {
      role_id: superId,
      feature_id: featureId,
      privilege_id: updatePriv.id,
      is_active: true,
    },
    transaction,
  });

  if (!hasRead || !hasUpdate) {
    const err = new Error(
      'Cannot remove super_admin Read and Update access to RBAC feature management'
    );
    err.statusCode = 400;
    throw err;
  }
};

module.exports = {
  RBAC_MANAGEMENT_ROUTE,
  SUPER_ADMIN_ROLE_NAME,

  listFeatures: async ({ includeInactive = true } = {}) => {
    const where = includeInactive ? {} : { is_active: true };
    return Feature.findAll({
      where,
      order: [
        ['display_order', 'ASC'],
        ['feature_name', 'ASC'],
      ],
      raw: true,
    });
  },

  getFeatureById: async (id) => {
    return Feature.findByPk(id, { raw: true });
  },

  listPrivileges: async () => {
    return Privilege.findAll({
      attributes: ['id', 'privilege_r', 'description'],
      order: [['id', 'ASC']],
      raw: true,
    });
  },

  getRolePrivilegesForFeature: async (featureId) => {
    const rows = await RolePrivilege.findAll({
      where: { feature_id: featureId },
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'role_name', 'description'],
          required: true,
        },
        {
          model: Privilege,
          as: 'privilege',
          attributes: ['id', 'privilege_r', 'description'],
          required: true,
        },
      ],
      order: [['id', 'ASC']],
    });

    return rows.map((rp) => ({
      rolePrivilegeId: rp.id,
      roleId: rp.role_id,
      roleName: rp.role?.role_name ?? null,
      privilegeId: rp.privilege_id,
      privilegeCode: rp.privilege?.privilege_r ?? null,
      isActive: Boolean(rp.is_active),
    }));
  },

  createFeature: async (payload) => {
    const row = await Feature.create({
      parent_feature_id: payload.parent_feature_id ?? null,
      feature_name: payload.feature_name,
      code: payload.code,
      description: payload.description ?? null,
      route_path: payload.route_path ?? null,
      icon: payload.icon ?? null,
      display_order: payload.display_order ?? 0,
      is_active: payload.is_active !== undefined ? Boolean(payload.is_active) : true,
    });
    return row.get({ plain: true });
  },

  updateFeature: async (id, payload) => {
    const feature = await Feature.findByPk(id);
    if (!feature) {
      const err = new Error('Feature not found');
      err.statusCode = 404;
      throw err;
    }
    const allowed = [
      'parent_feature_id',
      'feature_name',
      'code',
      'description',
      'route_path',
      'icon',
      'display_order',
      'is_active',
    ];
    const patch = {};
    for (const k of allowed) {
      if (Object.prototype.hasOwnProperty.call(payload, k)) {
        patch[k] = payload[k];
      }
    }
    await feature.update(patch);
    return feature.get({ plain: true });
  },

  /**
   * @param {number} featureId
   * @param {Array<{ roleId: number, privilegeIds: number[] }>} matrix
   */
  setRolePrivilegesForFeature: async (featureId, matrix) => {
    await connection.transaction(async (t) => {
      const feature = await Feature.findByPk(featureId, { transaction: t });
      if (!feature) {
        const err = new Error('Feature not found');
        err.statusCode = 404;
        throw err;
      }

      const desired = new Set();
      for (const row of matrix || []) {
        const rid = Number(row.roleId);
        if (!Number.isFinite(rid)) continue;
        const ids = Array.isArray(row.privilegeIds) ? row.privilegeIds : [];
        for (const p of ids) {
          const pid = Number(p);
          if (Number.isFinite(pid)) desired.add(`${rid}:${pid}`);
        }
      }

      const existing = await RolePrivilege.findAll({
        where: { feature_id: featureId },
        transaction: t,
      });

      const existingMap = new Map();
      for (const rp of existing) {
        existingMap.set(`${rp.role_id}:${rp.privilege_id}`, rp);
      }

      for (const rp of existing) {
        const key = `${rp.role_id}:${rp.privilege_id}`;
        const nextActive = desired.has(key);
        if (Boolean(rp.is_active) !== nextActive) {
          await rp.update({ is_active: nextActive }, { transaction: t });
        }
      }

      for (const key of desired) {
        if (!existingMap.has(key)) {
          const [rid, pid] = key.split(':').map(Number);
          await RolePrivilege.create(
            {
              role_id: rid,
              privilege_id: pid,
              feature_id: featureId,
              is_active: true,
            },
            { transaction: t }
          );
        }
      }

      await assertSuperAdminManagementAccess(featureId, t);
    });
  },
};
