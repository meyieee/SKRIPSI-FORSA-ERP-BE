const { getUserByNameRepository, getTokenByTokenRepository } = require('../module-cf-master/repositories/UserRepository');
const { verifyToken } = require('../function/jwt');
const { company } = require('../constants');

const validSession = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const refreshToken = req.cookies.refreshToken;

    if(!token || !refreshToken) {
      return res.status(401).send({ message: 'Session is required, please sign in again' });
    }

    const blacklistedToken = await getTokenByTokenRepository(refreshToken)
    if(blacklistedToken) {
      return res.status(401).json({ message: 'Session is not active, please sign in again' });
    }

    // jika endpoint APInya itu spesific, maka token yang diambil ada refresh token supaya dapat membuat akses token yang baru
    const isRefreshToken = req.originalUrl.includes('specific') ? true : false; 
    const accessToken = req.originalUrl.includes('specific') ? refreshToken : token;

    let user;
    try {
      user = verifyToken(accessToken, isRefreshToken);
    } catch (err) {
      if (err?.name === 'TokenExpiredError') {
        const message = isRefreshToken
          ? 'Session expired, please sign in again'
          : 'Session expired';
        return res.status(403).send({ message });
      }

      return res.status(401).send({ message: 'Invalid Session' });
    }

    const currentUser = await getUserByNameRepository(user.name);
    if (!currentUser) {
      return res.status(404).send({ message: 'User does not exist' });
    }

    if ((currentUser.status === 0 || currentUser['employees.status'] !== 'Active') && currentUser.id_number !== company) {
      return res.status(400).send({
        message: 'Your status has been inactive, please log out.'
      });
    }

    user.branch_code =
      currentUser['employees.branch_detail.com_code'] ||
      currentUser.branch_code ||
      currentUser['employees.branch_detail.branch_code'];
    user.com_type = currentUser['employees.branch_detail.com_type'];
    user.id_number = currentUser.id_number || currentUser['employees.id_number'];
    user.roleId = user.roleId || user.role_id || currentUser.role_id; // Attach roleId for RBAC
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

module.exports = validSession;
