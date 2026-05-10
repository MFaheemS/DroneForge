const Part = require('../models/Part');

const CATEGORIES = ['frame', 'motors', 'propellers', 'battery', 'flightController', 'camera', 'ESC', 'transmitter'];

exports.getCatalog = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, maxWeight, search } = req.query;

    const filter = { isAvailable: true };
    if (category && CATEGORIES.includes(category)) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (maxWeight) filter.weight = { $lte: Number(maxWeight) };
    if (search) filter.$text = { $search: search };

    const parts = await Part.find(filter).sort({ category: 1, price: 1 }).lean();

    // Compute price bounds for slider
    const allParts = await Part.find({ isAvailable: true }, 'price weight').lean();
    const prices = allParts.map(p => p.price);
    const priceMin = Math.floor(Math.min(...prices));
    const priceMax = Math.min(Math.ceil(Math.max(...prices)), 100);
    const weightMax = Math.min(Math.ceil(Math.max(...allParts.map(p => p.weight))), 500);

    const weightMin = 0;
    res.render('parts/catalog', {
      title: 'Parts Catalog — DroneForge',
      parts,
      categories: CATEGORIES,
      filters: { category, minPrice, maxPrice, maxWeight, search },
      priceMin, priceMax, weightMin, weightMax
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('errors/404', { message: 'Could not load parts catalog.' });
  }
};

exports.getPartApi = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, maxWeight, search } = req.query;
    const filter = { isAvailable: true };
    if (category && CATEGORIES.includes(category)) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (maxWeight) filter.weight = { $lte: Number(maxWeight) };
    if (search) filter.name = { $regex: search, $options: 'i' };

    const parts = await Part.find(filter).sort({ category: 1, price: 1 }).lean();
    res.json({ success: true, parts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getPartDetail = async (req, res) => {
  try {
    const part = await Part.findById(req.params.id).lean();
    if (!part) return res.status(404).render('errors/404', { message: 'Part not found.' });

    // Related parts: same category, different id, up to 4
    const related = await Part.find({
      category: part.category,
      _id: { $ne: part._id },
      isAvailable: true
    }).limit(4).lean();

    res.render('parts/detail', {
      title: `${part.name} — DroneForge`,
      part,
      related
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('errors/404', { message: 'Could not load part.' });
  }
};

exports.getPartsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const parts = await Part.find({ category, isAvailable: true, stock: { $gt: 0 } })
      .sort({ price: 1 }).lean();
    res.json({ success: true, parts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
