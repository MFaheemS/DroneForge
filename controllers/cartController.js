const Part = require('../models/Part');

function getCart(req) {
  if (!req.session.cart) req.session.cart = [];
  return req.session.cart;
}

exports.getCart = (req, res) => {
  const cart = getCart(req);
  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  res.render('cart', { title: 'My Payload — DroneForge', cart, total, itemCount });
};

exports.addToCart = async (req, res) => {
  try {
    const { partId, quantity = 1 } = req.body;
    const qty = Math.max(1, parseInt(quantity) || 1);
    const part = await Part.findById(partId);
    if (!part || !part.isAvailable) {
      return res.status(404).json({ success: false, message: 'Part not found.' });
    }

    const cart = getCart(req);
    const existing = cart.find(i => i.partId === partId);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + qty, part.stock || 99);
    } else {
      cart.push({
        partId,
        name: part.name,
        category: part.category,
        imageUrl: part.imageUrl || '',
        price: part.price,
        weight: part.weight,
        quantity: qty
      });
    }
    req.session.cart = cart;

    const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);
    res.json({ success: true, itemCount, message: `${part.name} added to cart.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.updateCart = (req, res) => {
  const { partId, quantity } = req.body;
  const qty = parseInt(quantity);
  const cart = getCart(req);

  if (isNaN(qty) || qty < 1) {
    req.session.cart = cart.filter(i => i.partId !== partId);
  } else {
    const item = cart.find(i => i.partId === partId);
    if (item) item.quantity = qty;
  }

  const total = req.session.cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemCount = req.session.cart.reduce((s, i) => s + i.quantity, 0);
  res.json({ success: true, total: total.toFixed(2), itemCount });
};

exports.removeFromCart = (req, res) => {
  const { partId } = req.body;
  req.session.cart = getCart(req).filter(i => i.partId !== partId);
  const total = req.session.cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemCount = req.session.cart.reduce((s, i) => s + i.quantity, 0);
  res.json({ success: true, total: total.toFixed(2), itemCount });
};

exports.clearCart = (req, res) => {
  req.session.cart = [];
  res.json({ success: true });
};

exports.getCartCount = (req, res) => {
  const cart = getCart(req);
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);
  res.json({ itemCount });
};
