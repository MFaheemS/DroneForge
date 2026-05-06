const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { body } = require('express-validator');
const orderController = require('../controllers/orderController');

const checkoutValidation = [
  body('buildName').trim().notEmpty().withMessage('Build name is required.').isLength({ max: 80 }),
  body('fullName').trim().notEmpty().withMessage('Full name is required.'),
  body('email').trim().isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('address').trim().notEmpty().withMessage('Address is required.'),
  body('city').trim().notEmpty().withMessage('City is required.'),
  body('state').trim().notEmpty().withMessage('State/Province is required.'),
  body('zip').trim().notEmpty().withMessage('ZIP/Postal code is required.')
    .matches(/^[A-Za-z0-9\s\-]{3,10}$/).withMessage('Invalid ZIP/postal code.'),
  body('cardNumber').trim().notEmpty().withMessage('Card number is required.')
    .matches(/^\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}$/).withMessage('Invalid card number format.'),
  body('cardExpiry').trim().notEmpty().withMessage('Expiry is required.')
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/).withMessage('Expiry must be MM/YY format.'),
  body('cardCvc').trim().notEmpty().withMessage('CVC is required.')
    .matches(/^\d{3,4}$/).withMessage('CVC must be 3–4 digits.')
];

router.get('/checkout', requireAuth, orderController.getCheckout);
router.post('/checkout', requireAuth, checkoutValidation, orderController.postCheckout);
router.get('/confirmation/:id', requireAuth, orderController.getConfirmation);
router.get('/', requireAuth, orderController.getOrders);

module.exports = router;
