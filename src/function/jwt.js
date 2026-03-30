const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_REFRESH_SECRET } = require('../constants');

const JwtToken = (name, _id, roleId) => {
    return jwt.sign({ name, _id, roleId, isRefreshToken: false }, JWT_SECRET, { expiresIn: "3h" });
};

const JwtRefreshToken = (name, _id, roleId) => {
    return jwt.sign({ name, _id, roleId, isRefreshToken: true }, JWT_REFRESH_SECRET, { expiresIn: "20d" });
};

const verifyToken = (token, isRefreshToken) => {
        /*
           isRefreshToken dari paramater dan decoded harus bernilai sama supaya mencegah refresh token digunakan untuk masuk kedalam web alih-alih akses token.
           refresh token hanya digunakan dalam api /users/specific sedangkan, akses token digunakan dalam api selain itu
         */

    if (!token) {
        throw new Error();
    }
    
    const decoded = jwt.decode(token);
    if (!decoded) {
        throw new Error();
    }

    if (isRefreshToken !== decoded.isRefreshToken) {
        throw new Error();
    }

    const secret = isRefreshToken ? JWT_REFRESH_SECRET : JWT_SECRET;
    return jwt.verify(token, secret);
};
  
module.exports = { JwtToken, JwtRefreshToken, verifyToken };

/*
Keterangan:
    JwtToken: 
        - Bertindak sebagai **access token**, digunakan dalam setiap request ke API yang membutuhkan autentikasi.
        - Berlaku selama 3 jam ("3h").
    
    JwtRefreshToken: 
        - Bertindak sebagai **refresh token**, digunakan untuk mendapatkan access token baru ketika yang lama sudah kedaluwarsa.
        - Berlaku selama 20 hari ("20d").
*/