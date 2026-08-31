const { extractBearerToken, verifyAccessToken } = require('../utils/token');

function requireAuth(req, res, next) {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Authentication required',
        errors: null,
      });
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Invalid or expired token',
      errors: null,
    });
  }
}

module.exports = {
  requireAuth,
};