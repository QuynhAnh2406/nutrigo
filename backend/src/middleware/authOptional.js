const jwt = require('jsonwebtoken');

/**
 * Optional auth: if token exists -> set req.user; else continue anonymous.
 * This keeps existing controllers working (they already fallback to userId=1).
 */
module.exports = function authOptional(req, _res, next) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || typeof header !== 'string') return next();

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    if (payload && typeof payload === 'object') {
      req.user = { id: payload.id };
    }
  } catch (_e) {
    // Ignore invalid/expired token for optional auth
  }

  next();
};

