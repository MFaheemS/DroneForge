const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/authController');

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').isEmail().withMessage('Valid email required.').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  body('confirmPassword').custom((val, { req }) => {
    if (val !== req.body.password) throw new Error('Passwords do not match.');
    return true;
  })
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email required.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.')
];

const forgotRules = [
  body('email').isEmail().withMessage('Valid email required.').normalizeEmail()
];

const resetRules = [
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  body('confirmPassword').custom((val, { req }) => {
    if (val !== req.body.password) throw new Error('Passwords do not match.');
    return true;
  })
];

router.get('/register', ctrl.getRegister);
router.post('/register', registerRules, ctrl.postRegister);

router.get('/login', ctrl.getLogin);
router.post('/login', loginRules, ctrl.postLogin);

router.get('/logout', ctrl.logout);

router.get('/forgot-password', ctrl.getForgotPassword);
router.post('/forgot-password', forgotRules, ctrl.postForgotPassword);

router.get('/reset-password/:token', ctrl.getResetPassword);
router.post('/reset-password/:token', resetRules, ctrl.postResetPassword);

module.exports = router;
