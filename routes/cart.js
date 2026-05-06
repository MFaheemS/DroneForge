const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const cartController = require('../controllers/cartController');

router.get('/', requireAuth, cartController.getCart);
router.post('/add', requireAuth, cartController.addToCart);
router.post('/update', requireAuth, cartController.updateCart);
router.post('/remove', requireAuth, cartController.removeFromCart);
router.post('/clear', requireAuth, cartController.clearCart);
router.get('/count', cartController.getCartCount);

module.exports = router;
