const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register',        userController.registerUser);
router.post('/login',           userController.login);
router.post('/verify-otp',      userController.verifyOTP);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password',  userController.resetPassword);
router.get('/profile', protect, userController.getUserProfile);

module.exports = router;