const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const PrebuiltBuild = require('../models/PrebuiltBuild');

router.get('/', async (req, res) => {
  try {
    const builds = await PrebuiltBuild.find({ isActive: true })
      .sort({ purchaseCount: -1, createdAt: -1 })
      .limit(3)
      .lean();
    res.render('home', { title: 'DroneForge — Build Your Beast', builds });
  } catch (err) {
    res.render('home', { title: 'DroneForge — Build Your Beast', builds: [] });
  }
});

router.get('/about', (req, res) => {
  res.render('about', { title: 'The Origin — About DroneForge' });
});

router.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact — DroneForge' });
});

router.get('/faq',      (req, res) => res.render('faq',     { title: 'FAQ — DroneForge' }));
router.get('/privacy',  (req, res) => res.render('privacy', { title: 'Privacy Policy — DroneForge' }));
router.get('/terms',    (req, res) => res.render('terms',   { title: 'Terms of Service — DroneForge' }));
router.get('/blog',     (req, res) => res.redirect('/about'));
router.get('/careers',  (req, res) => res.redirect('/about'));
router.get('/shipping', (req, res) => res.redirect('/faq'));
router.get('/returns',  (req, res) => res.redirect('/faq'));

// Contact form POST (server-side validation + sanitization)
router.post('/contact', [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 80 }).escape(),
  body('email').isEmail().withMessage('Valid email required.').normalizeEmail(),
  body('subject').notEmpty().withMessage('Subject is required.'),
  body('message').trim().notEmpty().withMessage('Message is required.').isLength({ min: 10, max: 2000 }).escape(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  // In a real app: send email here. For demo, just acknowledge.
  res.json({ success: true });
});

module.exports = router;
