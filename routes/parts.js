const express = require('express');
const router = express.Router();
const { getCatalog, getPartApi, getPartsByCategory } = require('../controllers/partsController');

router.get('/', getCatalog);
router.get('/api/filter', getPartApi);
router.get('/api/category/:category', getPartsByCategory);

module.exports = router;
