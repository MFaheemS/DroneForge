const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const PrebuiltBuild = require('../models/PrebuiltBuild');
const Part = require('../models/Part');

// GET /builds  — customer browse page
router.get('/', async (req, res) => {
  try {
    const builds = await PrebuiltBuild.find({ isActive: true })
      .sort({ purchaseCount: -1, createdAt: -1 })
      .lean();
    res.render('builds', { title: 'Featured Builds — DroneForge', builds });
  } catch (err) {
    res.render('builds', { title: 'Featured Builds — DroneForge', builds: [] });
  }
});

// GET /builds/api  — JSON list of active builds for home page
router.get('/api', async (req, res) => {
  try {
    const builds = await PrebuiltBuild.find({ isActive: true })
      .sort({ createdAt: -1 })
      .populate('parts.partId', 'name category price weight imageUrl')
      .lean();
    res.json({ builds });
  } catch (err) {
    res.status(500).json({ builds: [] });
  }
});

// GET /builds/:id/clone  — redirect to builder with ?clone=<id>
router.get('/:id/clone', requireAuth, async (req, res) => {
  try {
    const build = await PrebuiltBuild.findOne({ _id: req.params.id, isActive: true });
    if (!build) return res.status(404).render('errors/404');
    res.redirect(`/build?clone=${build._id}`);
  } catch (err) {
    res.status(404).render('errors/404');
  }
});

// GET /builds/:id/parts  — JSON payload for builder clone
router.get('/:id/parts', async (req, res) => {
  try {
    const build = await PrebuiltBuild.findOne({ _id: req.params.id, isActive: true })
      .populate('parts.partId', 'name category price weight imageUrl')
      .lean();
    if (!build) return res.status(404).json({ error: 'Not found' });

    const parts = build.parts
      .filter(bp => bp.partId)
      .map(bp => ({
        id:       bp.partId._id.toString(),
        name:     bp.partId.name,
        category: bp.partId.category,
        price:    bp.partId.price,
        weight:   bp.partId.weight,
        imageUrl: bp.partId.imageUrl || '',
        quantity: bp.quantity
      }));

    res.json({ buildName: build.name, parts });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /builds/:id/order  — add all parts to cart then redirect to checkout
router.post('/:id/order', requireAuth, async (req, res) => {
  try {
    const build = await PrebuiltBuild.findOne({ _id: req.params.id, isActive: true })
      .populate('parts.partId')
      .lean();
    if (!build) return res.status(404).render('errors/404');

    // Replace cart with this build's parts
    const cart = build.parts
      .filter(bp => bp.partId && bp.partId.isAvailable)
      .map(bp => ({
        partId:   bp.partId._id.toString(),
        name:     bp.partId.name,
        category: bp.partId.category,
        imageUrl: bp.partId.imageUrl || '',
        price:    bp.partId.price,
        weight:   bp.partId.weight,
        quantity: bp.quantity
      }));

    if (!cart.length) {
      return res.redirect('/?error=build-unavailable');
    }

    req.session.cart = cart;
    req.session.pendingBuildName = build.name;

    // Track purchase popularity
    await PrebuiltBuild.findByIdAndUpdate(build._id, { $inc: { purchaseCount: 1 } });

    res.redirect('/checkout');
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

module.exports = router;
