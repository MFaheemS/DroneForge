require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { attachUser } = require('./middleware/auth');

const app = express();

// ── Trust Vercel / reverse-proxy headers ──
app.set('trust proxy', 1);

// ── Security Headers ──
app.use(helmet({ contentSecurityPolicy: false }));

// ── MongoDB Query Sanitization ──
function sanitizeObj(obj) {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) { delete obj[key]; continue; }
    if (typeof obj[key] === 'object') sanitizeObj(obj[key]);
  }
}
app.use((req, _res, next) => {
  sanitizeObj(req.body);
  sanitizeObj(req.params);
  next();
});

// ── Static Files ──
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '7d' : 0,
  etag: true,
}));

// ── DB Connection ──
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// ── View Engine ──
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Body Parsing ──
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// ── Attach JWT user to every request ──
app.use(attachUser);

// ── Template Locals ──
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.currentPath = req.path;
  next();
});

// ── Rate Limiter for Auth Routes ──
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).render('errors/404', { title: 'Too Many Requests', message: 'Too many login attempts. Please wait 15 minutes.' })
});

// ── Routes ──
app.use('/', require('./routes/home'));
app.use('/auth', authLimiter, require('./routes/auth'));
app.use('/parts', require('./routes/parts'));
app.use('/build', require('./routes/build'));
app.use('/cart', require('./routes/cart'));
app.use('/orders', require('./routes/orders'));
app.use('/profile', require('./routes/profile'));
app.use('/builds', require('./routes/builds'));
app.use('/admin', require('./routes/admin'));

// ── 404 ──
app.use((req, res) => {
  res.status(404).render('errors/404');
});

// ── 500 ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('errors/404', { message: 'Something went wrong.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`DroneForge running on http://localhost:${PORT}`));
