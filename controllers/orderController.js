const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const Part = require('../models/Part');
const Cart = require('../models/Cart');

async function getCartItems(userId) {
  const cart = await Cart.findOne({ userId }).lean();
  return cart?.items || [];
}

exports.getCheckout = async (req, res) => {
  try {
    const cart = await getCartItems(req.user.id);
    if (!cart.length) return res.redirect('/cart');
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const cartDoc = await Cart.findOne({ userId: req.user.id }).lean();
    const pendingBuildName = cartDoc?.pendingBuildName || '';
    res.render('checkout', { title: 'Secure Checkout — DroneForge', cart, subtotal, errors: [], pendingBuildName });
  } catch (err) {
    console.error(err);
    res.redirect('/cart');
  }
};

exports.postCheckout = async (req, res) => {
  const errors = validationResult(req);
  const cart = await getCartItems(req.user.id);
  if (!cart.length) return res.redirect('/cart');

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  if (!errors.isEmpty()) {
    return res.render('checkout', {
      title: 'Secure Checkout — DroneForge',
      cart,
      subtotal,
      errors: errors.array(),
      pendingBuildName: ''
    });
  }

  try {
    const { buildName, fullName, email, address, city, state, zip, shippingMethod } = req.body;
    const shippingCost = shippingMethod === 'priority' ? 45 : 0;
    const tax = parseFloat((subtotal * 0.08).toFixed(2));
    const totalPrice = parseFloat((subtotal + shippingCost + tax).toFixed(2));

    const partIds = cart.map(i => i.partId);
    const dbParts = await Part.find({ _id: { $in: partIds } });
    const partMap = {};
    dbParts.forEach(p => { partMap[p._id.toString()] = p; });

    const orderParts = cart.map(i => {
      const dbPart = partMap[i.partId];
      return {
        partId: i.partId,
        name: i.name,
        category: i.category,
        imageUrl: i.imageUrl || '',
        quantity: i.quantity,
        priceAtOrder: dbPart ? dbPart.price : i.price
      };
    });

    for (const item of orderParts) {
      const dbPart = partMap[item.partId];
      if (dbPart && dbPart.stock >= item.quantity) {
        dbPart.stock -= item.quantity;
        if (dbPart.stock === 0) dbPart.isAvailable = false;
        await dbPart.save();
      }
    }

    const order = await Order.create({
      userId: req.user.id,
      buildName: buildName || 'Custom Drone Build',
      parts: orderParts,
      totalPrice,
      shippingMethod: shippingMethod || 'standard',
      shippingCost,
      tax,
      shippingAddress: { fullName, email, address, city, state, zip }
    });

    // Clear cart
    await Cart.findOneAndUpdate({ userId: req.user.id }, { items: [], pendingBuildName: '' });

    res.redirect(`/orders/confirmation/${order._id}`);
  } catch (err) {
    console.error(err);
    const cart = await getCartItems(req.user.id);
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    res.render('checkout', {
      title: 'Secure Checkout — DroneForge',
      cart,
      subtotal,
      errors: [{ msg: 'Server error. Please try again.' }],
      pendingBuildName: ''
    });
  }
};

exports.getConfirmation = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) return res.status(404).render('errors/404');
    res.render('orders/confirmation', { title: 'Mission Successful — DroneForge', order });
  } catch (err) {
    console.error(err);
    res.status(500).render('errors/404');
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.render('orders/list', { title: 'My Hangar — DroneForge', orders });
  } catch (err) {
    console.error(err);
    res.render('orders/list', { title: 'My Hangar — DroneForge', orders: [] });
  }
};
