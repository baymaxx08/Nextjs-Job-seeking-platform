const jwt = require('jsonwebtoken');

const accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'dev_jwt_access_secret_change_in_production';
const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_change_in_production';
const accessTokenExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '7d';
const refreshTokenExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

function buildTokenPayload(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}

function generateAccessToken(user) {
  return jwt.sign(buildTokenPayload(user), accessTokenSecret, {
    expiresIn: accessTokenExpiresIn,
  });
}

function generateRefreshToken(user) {
  return jwt.sign(buildTokenPayload(user), refreshTokenSecret, {
    expiresIn: refreshTokenExpiresIn,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, accessTokenSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, refreshTokenSecret);
}

function extractBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization || '';

  if (header.startsWith('Bearer ')) {
    return header.slice(7).trim();
  }

  return req.cookies?.access_token || req.headers['x-access-token'] || null;
}

function setRefreshTokenCookie(res, token) {
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

function clearRefreshTokenCookie(res) {
  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  extractBearerToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
};