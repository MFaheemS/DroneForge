const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');
const { body } = require('express-validator');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const adminController = require('../controllers/adminController');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'droneforge',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 1200, crop: 'limit' }],
  },
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
router.get('/profile', adminController.getProfile);
router.post('/profile', adminController.postProfile);

router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetail);
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

// ── PREBUILT BUILDS ────────────────────────────────────────────────────────────
const buildValidation = [
  body('name').trim().notEmpty().withMessage('Build name is required.').isLength({ max: 100 }),
  body('description').trim().notEmpty().withMessage('Description is required.').isLength({ max: 600 })
];

router.get('/builds', adminController.getBuilds);
router.get('/builds/add', adminController.getAddBuild);
router.post('/builds/add', upload.single('image'), buildValidation, adminController.postAddBuild);
router.get('/builds/:id/edit', adminController.getEditBuild);
router.post('/builds/:id/edit', upload.single('image'), buildValidation, adminController.postEditBuild);
router.delete('/builds/:id', adminController.deleteBuild);
router.patch('/builds/:id/toggle', adminController.toggleBuildStatus);

module.exports = router;
