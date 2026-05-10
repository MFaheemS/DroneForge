const { validationResult } = require('express-validator');
const User = require('../models/User');
const Part = require('../models/Part');
const Order = require('../models/Order');
const PrebuiltBuild = require('../models/PrebuiltBuild');
const cloudinary = require('cloudinary').v2;

// ── DASHBOARD ──────────────────────────────────────────────────────────────────
exports.getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalOrders, revenue, lowStock, recentOrders] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
      Part.countDocuments({ stock: { $lte: 5 } }),
      Order.find().sort({ createdAt: -1 }).limit(10).populate('userId', 'name email')
    ]);
    res.render('admin/dashboard', {
      title: 'Command Hub — DroneForge Admin',
      totalUsers,
      totalOrders,
      totalRevenue: revenue[0]?.total || 0,
      lowStock,
      recentOrders
    });
  } catch (err) {
    console.error(err);
    res.render('admin/dashboard', { title: 'Command Hub', totalUsers: 0, totalOrders: 0, totalRevenue: 0, lowStock: 0, recentOrders: [] });
  }
};

// ── USERS ──────────────────────────────────────────────────────────────────────
exports.getUsers = async (req, res) => {
  try {
    const { search, role, status, page = 1 } = req.query;
    const limit = 10;
    const skip = (parseInt(page) - 1) * limit;
    const filter = {};
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
    if (role && role !== 'all') filter.role = role;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter)
    ]);
    res.render('admin/users', {
      title: 'Operator Management — DroneForge Admin',
      users,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      search: search || '',
      role: role || 'all',
      status: status || 'all',
      currentUserId: req.session.user._id || req.session.user.id || ''
    });
  } catch (err) {
    console.error(err);
    res.render('admin/users', { title: 'Operator Management', users: [], total: 0, page: 1, pages: 1, search: '', role: 'all', status: 'all' });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.id === req.session.user.id) return res.status(400).json({ success: false, message: 'Cannot deactivate yourself.' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'user'].includes(role)) return res.status(400).json({ success: false, message: 'Invalid role.' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.id === req.session.user.id) return res.status(400).json({ success: false, message: 'Cannot change your own role.' });
    user.role = role;
    await user.save();
    res.json({ success: true, role: user.role });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── PARTS ──────────────────────────────────────────────────────────────────────
exports.getParts = async (req, res) => {
  try {
    const { search, category, page = 1 } = req.query;
    const limit = 12;
    const skip = (parseInt(page) - 1) * limit;
    const filter = {};
    if (search) filter.$text = { $search: search };
    if (category && category !== 'all') filter.category = category;

    const [parts, total] = await Promise.all([
      Part.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Part.countDocuments(filter)
    ]);
    res.render('admin/parts', {
      title: 'Inventory Control — DroneForge Admin',
      parts,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      search: search || '',
      category: category || 'all'
    });
  } catch (err) {
    console.error(err);
    res.render('admin/parts', { title: 'Inventory Control', parts: [], total: 0, page: 1, pages: 1, search: '', category: 'all' });
  }
};

exports.getAddPart = (req, res) => {
  res.render('admin/part-form', { title: 'Add Part — DroneForge Admin', part: null, errors: [], formData: null });
};

exports.postAddPart = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('admin/part-form', { title: 'Add Part', part: null, errors: errors.array(), formData: null });
  }
  try {
    const { name, category, price, weight, description, stock } = req.body;
    const imageUrl = req.file ? req.file.path : '';
    const specs = {};
    if (req.body.specKeys && req.body.specVals) {
      const keys = [].concat(req.body.specKeys);
      const vals = [].concat(req.body.specVals);
      keys.forEach((k, i) => { if (k.trim()) specs[k.trim()] = vals[i]?.trim() || ''; });
    }
    await Part.create({ name, category, price: parseFloat(price), weight: parseFloat(weight), description, imageUrl, stock: parseInt(stock) || 10, specs });
    res.redirect('/admin/parts');
  } catch (err) {
    console.error(err);
    res.render('admin/part-form', { title: 'Add Part', part: null, errors: [{ msg: 'Server error.' }], formData: null });
  }
};

exports.getEditPart = async (req, res, next) => {
  try {
    const part = await Part.findById(req.params.id).lean();
    if (!part) return res.status(404).render('errors/404');
    // Convert specs Map (if any) to a plain object for the template
    if (part.specs && typeof part.specs === 'object' && !Array.isArray(part.specs)) {
      part.specs = Object.fromEntries(Object.entries(part.specs));
    }
    res.render('admin/part-form', { title: 'Edit Part — DroneForge Admin', part, errors: [], formData: null });
  } catch (err) {
    next(err); // passes to global error handler which logs err.stack to console
  }
};

exports.postEditPart = async (req, res) => {
  const errors = validationResult(req);
  const part = await Part.findById(req.params.id).catch(() => null);
  if (!part) return res.status(404).render('errors/404');

  if (!errors.isEmpty()) {
    return res.render('admin/part-form', { title: 'Edit Part', part, errors: errors.array(), formData: null });
  }
  try {
    const { name, category, price, weight, description, stock, isAvailable } = req.body;
    if (req.file) {
      if (part.imageUrl) {
        const pid = part.imageUrl.split('/').pop().split('.')[0];
        cloudinary.uploader.destroy(`droneforge/${pid}`).catch(() => {});
      }
      part.imageUrl = req.file.path;
    }
    const specs = {};
    if (req.body.specKeys && req.body.specVals) {
      const keys = [].concat(req.body.specKeys);
      const vals = [].concat(req.body.specVals);
      keys.forEach((k, i) => { if (k.trim()) specs[k.trim()] = vals[i]?.trim() || ''; });
    }
    Object.assign(part, { name, category, price: parseFloat(price), weight: parseFloat(weight), description, stock: parseInt(stock) || 0, isAvailable: isAvailable === 'on', specs });
    await part.save();
    res.redirect('/admin/parts');
  } catch (err) {
    console.error(err);
    res.render('admin/part-form', { title: 'Edit Part', part, errors: [{ msg: 'Server error.' }], formData: null });
  }
};

exports.deletePart = async (req, res) => {
  try {
    const part = await Part.findByIdAndDelete(req.params.id);
    if (part?.imageUrl?.startsWith('/uploads/')) {
      const old = path.join(__dirname, '../public', part.imageUrl);
      if (fs.existsSync(old)) fs.unlinkSync(old);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── PROFILE ──────────────────────────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.session.user.id).lean();
    if (!admin) return res.redirect('/auth/logout');
    res.render('admin/profile', { title: 'My Profile — DroneForge Admin', admin, success: req.query.success || '', error: '' });
  } catch (err) {
    console.error(err);
    res.redirect('/admin');
  }
};

exports.postProfile = async (req, res) => {
  try {
    const { name, phone, bio, currentPassword, newPassword } = req.body;
    const admin = await User.findById(req.session.user.id);
    if (!admin) return res.redirect('/auth/logout');

    if (!name || !name.trim()) {
      return res.render('admin/profile', { title: 'My Profile — DroneForge Admin', admin: admin.toObject(), success: '', error: 'Name is required.' });
    }

    admin.name = name.trim();
    admin.phone = (phone || '').trim();
    admin.bio = (bio || '').trim();
    if (req.body.avatarUrl) admin.avatarUrl = req.body.avatarUrl;
    admin.updatedAt = new Date();

    if (newPassword) {
      const bcrypt = require('bcrypt');
      const match = await bcrypt.compare(currentPassword || '', admin.passwordHash);
      if (!match) {
        return res.render('admin/profile', { title: 'My Profile — DroneForge Admin', admin: admin.toObject(), success: '', error: 'Current password is incorrect.' });
      }
      if (newPassword.length < 8) {
        return res.render('admin/profile', { title: 'My Profile — DroneForge Admin', admin: admin.toObject(), success: '', error: 'New password must be at least 8 characters.' });
      }
      admin.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    await admin.save();
    req.session.user.name = admin.name;
    res.redirect('/admin/profile?success=1');
  } catch (err) {
    console.error(err);
    res.redirect('/admin/profile');
  }
};

// ── USER DETAIL ──────────────────────────────────────────────────────────────────
exports.getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).render('errors/404', { message: 'User not found.' });
    const [orderCount, totalSpent] = await Promise.all([
      Order.countDocuments({ userId: user._id }),
      Order.aggregate([{ $match: { userId: user._id, status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }])
    ]);
    const recentOrders = await Order.find({ userId: user._id }).sort({ createdAt: -1 }).limit(5).lean();
    res.render('admin/user-detail', {
      title: `${user.name} — DroneForge Admin`,
      targetUser: user,
      orderCount,
      totalSpent: totalSpent[0]?.total || 0,
      recentOrders,
      currentUserId: req.session.user.id || ''
    });
  } catch (err) {
    console.error(err);
    res.status(404).render('errors/404', { message: 'User not found.' });
  }
};

// ── ORDERS ──────────────────────────────────────────────────────────────────────
exports.getOrders = async (req, res) => {
  try {
    const { status, page = 1 } = req.query;
    const limit = 15;
    const skip = (parseInt(page) - 1) * limit;
    const filter = status && status !== 'all' ? { status } : {};

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('userId', 'name email'),
      Order.countDocuments(filter)
    ]);
    res.render('admin/orders', {
      title: 'Order Management — DroneForge Admin',
      orders,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      status: status || 'all'
    });
  } catch (err) {
    console.error(err);
    res.render('admin/orders', { title: 'Order Management', orders: [], total: 0, page: 1, pages: 1, status: 'all' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!valid.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status.' });
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, status: order.status });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── PREBUILT BUILDS ────────────────────────────────────────────────────────────
exports.getBuilds = async (req, res) => {
  try {
    const builds = await PrebuiltBuild.find().sort({ createdAt: -1 }).populate('parts.partId', 'name category price').lean();
    res.render('admin/builds', { title: 'Prebuilt Builds — DroneForge Admin', builds });
  } catch (err) {
    console.error(err);
    res.render('admin/builds', { title: 'Prebuilt Builds — DroneForge Admin', builds: [] });
  }
};

exports.getAddBuild = async (req, res) => {
  const allParts = await Part.find({ isAvailable: true }).sort({ category: 1, name: 1 }).lean();
  res.render('admin/build-form', { title: 'Add Build — DroneForge Admin', build: null, allParts, errors: [] });
};

exports.postAddBuild = async (req, res) => {
  const errors = validationResult(req);
  const allParts = await Part.find({ isAvailable: true }).sort({ category: 1, name: 1 }).lean();
  if (!errors.isEmpty()) {
    return res.render('admin/build-form', { title: 'Add Build', build: null, allParts, errors: errors.array() });
  }
  try {
    const { name, description, specChips, presetImage } = req.body;
    const imageUrl = req.file ? req.file.path : (presetImage || '');

    const chips = [].concat(specChips || []).map(s => s.trim()).filter(Boolean);

    // Build parts array from form: partId_<category> and qty_<category>
    const CATS = ['frame','motors','propellers','battery','flightController','camera','ESC','transmitter'];
    const parts = [];
    CATS.forEach(cat => {
      const ids = [].concat(req.body[`partId_${cat}`] || []).filter(Boolean);
      const qtys = [].concat(req.body[`qty_${cat}`] || []);
      ids.forEach((id, i) => {
        parts.push({ partId: id, quantity: parseInt(qtys[i]) || 1 });
      });
    });

    // Compute total price from DB
    const partIds = parts.map(p => p.partId);
    const dbParts = await Part.find({ _id: { $in: partIds } }).lean();
    const priceMap = {};
    dbParts.forEach(p => { priceMap[p._id.toString()] = p.price; });
    const totalPrice = parts.reduce((sum, p) => sum + (priceMap[p.partId.toString()] || 0) * p.quantity, 0);

    await PrebuiltBuild.create({ name, description, imageUrl, specChips: chips, parts, totalPrice });
    res.redirect('/admin/builds');
  } catch (err) {
    console.error(err);
    res.render('admin/build-form', { title: 'Add Build', build: null, allParts, errors: [{ msg: 'Server error.' }] });
  }
};

exports.getEditBuild = async (req, res) => {
  try {
    const [build, allParts] = await Promise.all([
      PrebuiltBuild.findById(req.params.id).lean(),
      Part.find({ isAvailable: true }).sort({ category: 1, name: 1 }).lean()
    ]);
    if (!build) return res.status(404).render('errors/404');
    res.render('admin/build-form', { title: 'Edit Build — DroneForge Admin', build, allParts, errors: [] });
  } catch (err) {
    res.status(404).render('errors/404');
  }
};

exports.postEditBuild = async (req, res) => {
  const errors = validationResult(req);
  const [build, allParts] = await Promise.all([
    PrebuiltBuild.findById(req.params.id),
    Part.find({ isAvailable: true }).sort({ category: 1, name: 1 }).lean()
  ]);
  if (!build) return res.status(404).render('errors/404');

  if (!errors.isEmpty()) {
    return res.render('admin/build-form', { title: 'Edit Build', build: build.toObject(), allParts, errors: errors.array() });
  }
  try {
    const { name, description, specChips, presetImage, isActive } = req.body;
    if (req.file) {
      build.imageUrl = req.file.path;
    } else if (presetImage) {
      build.imageUrl = presetImage;
    }

    const chips = [].concat(specChips || []).map(s => s.trim()).filter(Boolean);

    const CATS = ['frame','motors','propellers','battery','flightController','camera','ESC','transmitter'];
    const parts = [];
    CATS.forEach(cat => {
      const ids = [].concat(req.body[`partId_${cat}`] || []).filter(Boolean);
      const qtys = [].concat(req.body[`qty_${cat}`] || []);
      ids.forEach((id, i) => {
        parts.push({ partId: id, quantity: parseInt(qtys[i]) || 1 });
      });
    });

    const partIds = parts.map(p => p.partId);
    const dbParts = await Part.find({ _id: { $in: partIds } }).lean();
    const priceMap = {};
    dbParts.forEach(p => { priceMap[p._id.toString()] = p.price; });
    const totalPrice = parts.reduce((sum, p) => sum + (priceMap[p.partId.toString()] || 0) * p.quantity, 0);

    Object.assign(build, { name, description, specChips: chips, parts, totalPrice, isActive: isActive === 'on' });
    await build.save();
    res.redirect('/admin/builds');
  } catch (err) {
    console.error(err);
    res.render('admin/build-form', { title: 'Edit Build', build: build.toObject(), allParts, errors: [{ msg: 'Server error.' }] });
  }
};

exports.deleteBuild = async (req, res) => {
  try {
    const build = await PrebuiltBuild.findByIdAndDelete(req.params.id);
    if (build?.imageUrl?.startsWith('/uploads/')) {
      const old = path.join(__dirname, '../public', build.imageUrl);
      if (fs.existsSync(old)) fs.unlinkSync(old);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.toggleBuildStatus = async (req, res) => {
  try {
    const build = await PrebuiltBuild.findById(req.params.id);
    if (!build) return res.status(404).json({ success: false, message: 'Build not found.' });
    build.isActive = !build.isActive;
    await build.save();
    res.json({ success: true, isActive: build.isActive });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
