const Part = require('../models/Part');
const Cart = require('../models/Cart');

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ userId });
  if (!cart) cart = await Cart.create({ userId, items: [] });
  return cart;
}

exports.getCart = async (req, res) => {
  try {
    const cart = req.user ? await getOrCreateCart(req.user.id) : { items: [] };
    const items = cart.items || [];
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    res.render('cart', { title: 'My Payload — DroneForge', cart: items, total, itemCount });
  } catch (err) {
    console.error(err);
    res.render('cart', { title: 'My Payload — DroneForge', cart: [], total: 0, itemCount: 0 });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { partId, quantity = 1 } = req.body;
    const qty = Math.max(1, parseInt(quantity) || 1);
    const part = await Part.findById(partId);
    if (!part || !part.isAvailable) {
      return res.status(404).json({ success: false, message: 'Part not found.' });
    }

    const cart = await getOrCreateCart(req.user.id);
    const existing = cart.items.find(i => i.partId === partId);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + qty, part.stock || 99);
    } else {
      cart.items.push({
        partId,
        name: part.name,
        category: part.category,
        imageUrl: part.imageUrl || '',
        price: part.price,
        weight: part.weight,
        quantity: qty
      });
    }
    await cart.save();

    const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    res.json({ success: true, itemCount, message: `${part.name} added to cart.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.updateCart = async (req, res) => {
  try {
    const { partId, quantity } = req.body;
    const qty = parseInt(quantity);
    const cart = await getOrCreateCart(req.user.id);

    if (isNaN(qty) || qty < 1) {
      cart.items = cart.items.filter(i => i.partId !== partId);
    } else {
      const item = cart.items.find(i => i.partId === partId);
      if (item) item.quantity = qty;
    }
    await cart.save();

    const total = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const itemCount = cart.items.reduce((s, i) => s + i.quantity, 0);
    res.json({ success: true, total: total.toFixed(2), itemCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { partId } = req.body;
    const cart = await getOrCreateCart(req.user.id);
    cart.items = cart.items.filter(i => i.partId !== partId);
    await cart.save();

    const total = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const itemCount = cart.items.reduce((s, i) => s + i.quantity, 0);
    res.json({ success: true, total: total.toFixed(2), itemCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    cart.items = [];
    await cart.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getCartCount = async (req, res) => {
  try {
    if (!req.user) return res.json({ itemCount: 0 });
    const cart = await Cart.findOne({ userId: req.user.id }).lean();
    const itemCount = (cart?.items || []).reduce((s, i) => s + i.quantity, 0);
    res.json({ itemCount });
  } catch {
    res.json({ itemCount: 0 });
  }
};
