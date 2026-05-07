function requireAuth(req, res, next) {
  if (!req.session.user) {
    // JSON / fetch requests get a 401 instead of an HTML redirect
    if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
      return res.status(401).json({ loginRequired: true });
    }
    return res.redirect('/auth/login');
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  if (req.session.user.role !== 'admin') {
    return res.status(403).render('errors/403');
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
