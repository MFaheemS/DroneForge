const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const adminController = require('../controllers/adminController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/uploads/parts')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `part-${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/image\/(jpeg|png|webp|gif)/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only images allowed.'));
  }
});

const partValidation = [
  body('name').trim().notEmpty().withMessage('Part name is required.').isLength({ max: 100 }),
  body('category').isIn(['frame','motors','propellers','battery','flightController','camera','ESC','transmitter']).withMessage('Invalid category.'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number.'),
  body('weight').isFloat({ min: 0 }).withMessage('Weight must be a positive number.'),
  body('description').trim().notEmpty().withMessage('Description is required.').isLength({ max: 500 }),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer.')
];

router.use(requireAdmin);

router.get('/', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/toggle-status', adminController.toggleUserStatus);
router.patch('/users/:id/role', adminController.changeUserRole);

router.get('/parts', adminController.getParts);
router.get('/parts/add', adminController.getAddPart);
router.post('/parts/add', upload.single('image'), partValidation, adminController.postAddPart);
router.get('/parts/:id/edit', adminController.getEditPart);
router.post('/parts/:id/edit', upload.single('image'), partValidation, adminController.postEditPart);
router.delete('/parts/:id', adminController.deletePart);

router.get('/orders', adminController.getOrders);
router.patch('/orders/:id/status', adminController.updateOrderStatus);

module.exports = router;
