const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getProfile, postProfile } = require('../controllers/profileController');

router.use(requireAuth);
router.get('/', getProfile);
router.post('/', postProfile);

module.exports = router;
