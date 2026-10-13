const express = require('express');
const { registerUser, loginUser, verifyOtpHandler, forgotPassword, resetPassword, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOtpHandler);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', authMiddleware, getMe);

module.exports = router;
