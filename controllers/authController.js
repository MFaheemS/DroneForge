const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../utils/mailer');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;

function signToken(user, rememberMe = false) {
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: rememberMe ? '30d' : '7d' }
  );
}

function setTokenCookie(res, token, rememberMe = false) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000
  });
}

exports.getRegister = (req, res) => {
  if (req.user) return res.redirect('/');
  res.render('auth/register', { errors: [], old: {} });
};

exports.postRegister = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('auth/register', { errors: errors.array(), old: req.body });
  }

  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.render('auth/register', {
        errors: [{ msg: 'Email already registered.' }],
        old: req.body
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ name, email, passwordHash });

    const token = signToken(user);
    setTokenCookie(res, token);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('auth/register', { errors: [{ msg: 'Server error. Try again.' }], old: req.body });
  }
};

// Refresh JWT to extend inactivity window — requires a valid existing token
exports.refreshToken = (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ ok: false });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const rememberMe = payload.exp - payload.iat > 7 * 24 * 60 * 60; // >7d means rememberMe
    const newToken = signToken({ _id: payload.id, name: payload.name, email: payload.email, role: payload.role }, rememberMe);
    setTokenCookie(res, newToken, rememberMe);
    return res.json({ ok: true });
  } catch {
    return res.status(401).json({ ok: false });
  }
};

exports.getLogin = (req, res) => {
  if (req.user) return res.redirect('/');
  res.render('auth/login', { errors: [], old: {}, query: req.query });
};

exports.postLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('auth/login', { errors: errors.array(), old: req.body });
  }

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.render('auth/login', {
        errors: [{ msg: 'Invalid email or password.' }],
        old: req.body
      });
    }

    if (!user.isActive) {
      return res.render('auth/login', {
        errors: [{ msg: 'Your account has been deactivated. Contact support.' }],
        old: req.body
      });
    }

    const rememberMe = req.body.rememberMe === '1';
    const token = signToken(user, rememberMe);
    setTokenCookie(res, token, rememberMe);

    if (user.role === 'admin') return res.redirect('/admin');
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('auth/login', { errors: [{ msg: 'Server error. Try again.' }], old: req.body });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
};

exports.getForgotPassword = (req, res) => {
  res.render('auth/forgot-password', { errors: [], success: null });
};

exports.postForgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('auth/forgot-password', { errors: errors.array(), success: null });
  }

  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.render('auth/forgot-password', {
        errors: [],
        success: 'If that email is registered, a reset link has been sent.'
      });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetToken = hashedToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetUrl = `${req.protocol}://${req.get('host')}/auth/reset-password/${rawToken}`;
    await sendPasswordResetEmail(user.email, user.name, resetUrl);

    res.render('auth/forgot-password', {
      errors: [],
      success: 'If that email is registered, a reset link has been sent.'
    });
  } catch (err) {
    console.error(err);
    res.render('auth/forgot-password', { errors: [{ msg: 'Server error. Try again.' }], success: null });
  }
};

exports.getResetPassword = async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetToken: hashedToken,
    resetTokenExpiry: { $gt: Date.now() }
  });

  if (!user) {
    return res.render('auth/reset-password', { errors: [{ msg: 'Token is invalid or has expired.' }], token: null });
  }

  res.render('auth/reset-password', { errors: [], token: req.params.token });
};

exports.postResetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('auth/reset-password', { errors: errors.array(), token: req.params.token });
  }

  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.render('auth/reset-password', { errors: [{ msg: 'Token is invalid or has expired.' }], token: null });
    }

    user.passwordHash = await bcrypt.hash(req.body.password, SALT_ROUNDS);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.redirect('/auth/login?reset=success');
  } catch (err) {
    console.error(err);
    res.render('auth/reset-password', { errors: [{ msg: 'Server error. Try again.' }], token: req.params.token });
  }
};
