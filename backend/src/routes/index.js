// ── AUTH ROUTES ───────────────────────────────────────────────────────────────
const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/errorHandler');

const authRouter = express.Router();

authRouter.post('/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 120 }),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('user_type').optional().isIn(['farmer','buyer','retailer','wholesaler','agrovet','vet','landlord','general']),
  ],
  validate, authController.register
);

authRouter.post('/login',
  [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password required'),
  ],
  validate, authController.login
);

authRouter.get('/me', protect, authController.getMe);
authRouter.put('/profile', protect, authController.updateProfile);
authRouter.post('/change-password', protect, authController.changePassword);

// ── LISTINGS ROUTES ───────────────────────────────────────────────────────────
const listingsRouter = express.Router();
const listingsController = require('../controllers/listingsController');
const { upload } = require('../config/cloudinary');
const { optionalAuth } = require('../middleware/auth');

listingsRouter.get('/', optionalAuth, listingsController.getListings);
listingsRouter.get('/my', protect, listingsController.getMyListings);
listingsRouter.get('/:id', optionalAuth, listingsController.getListing);
listingsRouter.post('/', protect, upload.single('image'), listingsController.createListing);
listingsRouter.put('/:id', protect, upload.single('image'), listingsController.updateListing);
listingsRouter.delete('/:id', protect, listingsController.deleteListing);
listingsRouter.put('/:id/mark-sold', protect, listingsController.markSold);

// ── HOUSING ROUTES ────────────────────────────────────────────────────────────
const housingRouter = express.Router();
const housingController = require('../controllers/housingController');

housingRouter.get('/', housingController.getHousing);
housingRouter.get('/:id', housingController.getHouse);
housingRouter.post('/', protect, upload.array('images', 6), housingController.createHousing);
housingRouter.put('/:id', protect, housingController.updateHousing);
housingRouter.delete('/:id', protect, housingController.deleteHousing);

// ── SERVICES ROUTES ───────────────────────────────────────────────────────────
const servicesRouter = express.Router();
const servicesController = require('../controllers/servicesController');

servicesRouter.get('/', servicesController.getServices);
servicesRouter.get('/:id', servicesController.getService);
servicesRouter.post('/', protect, upload.single('image'), servicesController.createService);
servicesRouter.put('/:id', protect, servicesController.updateService);
servicesRouter.delete('/:id', protect, servicesController.deleteService);

// ── MESSAGES ROUTES ───────────────────────────────────────────────────────────
const messagesRouter = express.Router();
const messagesController = require('../controllers/messagesController');

messagesRouter.get('/conversations', protect, messagesController.getConversations);
messagesRouter.get('/unread', protect, messagesController.getUnreadCount);
messagesRouter.get('/:userId', protect, messagesController.getMessages);
messagesRouter.post('/', protect, messagesController.sendMessage);
messagesRouter.put('/:id/read', protect, messagesController.markRead);

// ── ADMIN ROUTES ─────────────────────────────────────────────────────────────
const adminRouter = express.Router();
const adminController = require('../controllers/adminController');
adminRouter.use(protect, adminController.requireAdmin);
adminRouter.get('/stats', adminController.getStats);
adminRouter.get('/users', adminController.getUsers);
adminRouter.get('/listings', adminController.getListings);
adminRouter.delete('/listings/:id', adminController.deleteListing);
adminRouter.put('/listings/:id/toggle', adminController.toggleListing);
adminRouter.put('/users/:id/toggle', adminController.toggleUser);
adminRouter.delete('/users/:id', adminController.deleteUser);
adminRouter.get('/sold-listings', adminController.getSoldListings);
adminRouter.put('/listings/:id/mark-sold', adminController.markSold);
adminRouter.delete('/sold-listings', adminController.deleteSoldListings);
adminRouter.get('/logs', adminController.getLogs);

// ── AI ROUTES ─────────────────────────────────────────────────────────────────
const aiRouter = express.Router();
const aiController = require('../controllers/aiController');
const { optionalAuth: optAuth } = require('../middleware/auth');

aiRouter.post('/diagnose', optAuth, upload.single('image'), aiController.diagnose);

// ── UPLOAD ROUTES ─────────────────────────────────────────────────────────────
const uploadRouter = express.Router();
const uploadController = require('../controllers/uploadController');

uploadRouter.post('/image', protect, upload.single('image'), uploadController.uploadImage);

module.exports = { authRouter, listingsRouter, housingRouter, servicesRouter, messagesRouter, aiRouter, uploadRouter, adminRouter };
