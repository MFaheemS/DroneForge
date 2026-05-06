const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

router.get('/', (req, res) => {
  res.render('home', { title: 'DroneForge — Build Your Beast' });
});

router.get('/about', (req, res) => {
  res.render('about', { title: 'The Origin — About DroneForge' });
});

router.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact — DroneForge' });
});

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
