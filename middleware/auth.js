const jwt = require('jsonwebtoken');

function verifyToken(req) {
  const token = req.cookies?.token;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

function requireAuth(req, res, next) {
  const user = verifyToken(req);
  if (!user) {
    if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
      return res.status(401).json({ loginRequired: true });
    }
    return res.redirect('/auth/login');
  }
  req.user = user;
  next();
}

function requireAdmin(req, res, next) {
  const user = verifyToken(req);
  if (!user) return res.redirect('/auth/login');
  if (user.role !== 'admin') return res.status(403).render('errors/403');
  req.user = user;
  next();
}

// Soft auth — attaches user if token present but never blocks
function attachUser(req, res, next) {
  req.user = verifyToken(req) || null;
  next();
}

module.exports = { requireAuth, requireAdmin, attachUser };
