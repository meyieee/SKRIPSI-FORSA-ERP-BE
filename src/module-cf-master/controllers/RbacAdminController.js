const {
  listFeatures,
  getFeatureById,
  listPrivileges,
  getRolePrivilegesForFeature,
  createFeature,
  updateFeature,
  setRolePrivilegesForFeature,
} = require('../repositories/RbacAdminRepository');

const parseId = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};

const handleError = (res, err) => {
  const status = err.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500;
  return res.status(status).send({ message: err.message || 'Server error' });
};

module.exports = {
  getFeatures: async (req, res) => {
    try {
      const includeInactive = String(req.query.includeInactive || 'true') !== 'false';
      const data = await listFeatures({ includeInactive });
      return res.status(200).send({
        message: 'OK',
        data,
      });
    } catch (err) {
      return handleError(res, err);
    }
  },

  getFeature: async (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).send({ message: 'Invalid feature id' });
      const data = await getFeatureById(id);
      if (!data) return res.status(404).send({ message: 'Feature not found' });
      return res.status(200).send({ message: 'OK', data });
    } catch (err) {
      return handleError(res, err);
    }
  },

  getPrivilegesCatalog: async (req, res) => {
    try {
      const data = await listPrivileges();
      return res.status(200).send({ message: 'OK', data });
    } catch (err) {
      return handleError(res, err);
    }
  },

  getFeatureRolePrivileges: async (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).send({ message: 'Invalid feature id' });
      const feature = await getFeatureById(id);
      if (!feature) return res.status(404).send({ message: 'Feature not found' });
      const data = await getRolePrivilegesForFeature(id);
      return res.status(200).send({ message: 'OK', data });
    } catch (err) {
      return handleError(res, err);
    }
  },

  postFeature: async (req, res) => {
    try {
      const { feature_name, code, route_path } = req.body || {};
      if (!feature_name || !String(feature_name).trim()) {
        return res.status(400).send({ message: 'feature_name is required' });
      }
      if (!code || !String(code).trim()) {
        return res.status(400).send({ message: 'code is required' });
      }
      const data = await createFeature(req.body);
      return res.status(201).send({ message: 'Created', data });
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).send({ message: 'Duplicate feature code or constraint violation' });
      }
      return handleError(res, err);
    }
  },

  putFeature: async (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).send({ message: 'Invalid feature id' });
      const data = await updateFeature(id, req.body || {});
      return res.status(200).send({ message: 'Updated', data });
    } catch (err) {
      if (err.statusCode === 404) return handleError(res, err);
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).send({ message: 'Duplicate feature code or constraint violation' });
      }
      return handleError(res, err);
    }
  },

  putFeatureRolePrivileges: async (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).send({ message: 'Invalid feature id' });
      const matrix = req.body?.matrix;
      if (!Array.isArray(matrix)) {
        return res.status(400).send({ message: 'Body must include matrix: [{ roleId, privilegeIds: number[] }]' });
      }
      await setRolePrivilegesForFeature(id, matrix);
      const data = await getRolePrivilegesForFeature(id);
      return res.status(200).send({ message: 'Updated', data });
    } catch (err) {
      return handleError(res, err);
    }
  },
};
