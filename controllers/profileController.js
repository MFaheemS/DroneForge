const User = require('../models/User');
const Order = require('../models/Order');
const bcrypt = require('bcrypt');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id).lean();
    if (!user) return res.redirect('/auth/logout');
    const [orderCount, totalSpent, recentOrders] = await Promise.all([
      Order.countDocuments({ userId: user._id }),
      Order.aggregate([{ $match: { userId: user._id, status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
      Order.find({ userId: user._id }).sort({ createdAt: -1 }).limit(5).lean()
    ]);
    res.render('profile', {
      title: 'My Profile — DroneForge',
      profileUser: user,
      orderCount,
      totalSpent: totalSpent[0]?.total || 0,
      recentOrders,
      success: req.query.success || '',
      error: ''
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
};

exports.postProfile = async (req, res) => {
  const renderWithError = async (error) => {
    const user = await User.findById(req.session.user.id).lean().catch(() => null);
    const [orderCount, totalSpent, recentOrders] = await Promise.all([
      Order.countDocuments({ userId: req.session.user.id }),
      Order.aggregate([{ $match: { userId: user?._id, status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
      Order.find({ userId: req.session.user.id }).sort({ createdAt: -1 }).limit(5).lean()
    ]);
    res.render('profile', { title: 'My Profile — DroneForge', profileUser: user, orderCount, totalSpent: totalSpent[0]?.total || 0, recentOrders, success: '', error });
  };

  try {
    const { name, phone, bio, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.session.user.id);
    if (!user) return res.redirect('/auth/logout');

    if (!name || !name.trim()) return renderWithError('Name is required.');

    user.name = name.trim();
    user.phone = (phone || '').trim();
    user.bio = (bio || '').trim();
    if (req.body.avatarUrl) user.avatarUrl = req.body.avatarUrl;
    user.updatedAt = new Date();

    if (newPassword) {
      const match = await bcrypt.compare(currentPassword || '', user.passwordHash);
      if (!match) return renderWithError('Current password is incorrect.');
      if (newPassword.length < 8) return renderWithError('New password must be at least 8 characters.');
      user.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    await user.save();
    req.session.user.name = user.name;
    res.redirect('/profile?success=1');
  } catch (err) {
    console.error(err);
    res.redirect('/profile');
  }
};
