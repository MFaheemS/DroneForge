const express = require('express');
const router = express.Router();
const { getCatalog, getPartApi, getPartsByCategory, getPartDetail } = require('../controllers/partsController');

router.get('/', getCatalog);
router.get('/api/filter', getPartApi);
router.get('/api/category/:category', getPartsByCategory);
router.get('/:id', getPartDetail);

module.exports = router;
