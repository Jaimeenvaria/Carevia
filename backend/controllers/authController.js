const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../services/emailService');
const { logAuditEvent } = require('../services/auditService');

// Register User
exports.registerUser = async (req, res) => {
    const { name, email, password, phone } = req.body;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const otpHash = await bcrypt.hash(otp, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            phone: phone || '',
            otpHash,
            otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
            otpAttempts: 0
        });
        await user.save();

        await sendOTPEmail(email, name, otp);

        await logAuditEvent({
            actorId: user._id,
            actorRole: 'patient',
            action: 'USER_REGISTER',
            resourceType: 'User',
            resourceId: user._id,
            metadata: { email },
            req
        });

        res.status(201).json({ message: 'User registered successfully. An OTP has been sent to your email.' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Verify OTP
exports.verifyOtpHandler = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email }).select('+otpHash');
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        if (user.otpAttempts >= 5) {
            return res.status(429).json({ message: 'Too many OTP attempts. Please request a new OTP.' });
        }

        const isMatch = await bcrypt.compare(otp, user.otpHash || '');
        if (!isMatch) {
            user.otpAttempts = (user.otpAttempts || 0) + 1;
            await user.save();
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        user.isVerified = true;
        user.otpHash = undefined;
        user.otpExpiresAt = undefined;
        user.otpAttempts = 0;
        await user.save();

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        await logAuditEvent({
            actorId: user._id,
            actorRole: user.role,
            action: 'OTP_VERIFIED',
            resourceType: 'User',
            resourceId: user._id,
            req
        });

        return res.status(200).json({
            message: 'OTP verified successfully',
            token,
            user: user.toJSON()
        });
    } catch (err) {
        console.error('OTP verification error:', err);
        return res.status(500).json({ message: 'Failed to verify user', error: err.message });
    }
};

// Login User
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        if (!user.isVerified) {
            return res.status(400).json({ message: 'Please verify your email before logging in.' });
        }

        if (user.status === 'suspended') {
            return res.status(403).json({ message: 'Account suspended. Contact support.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        user.lastLoginAt = new Date();
        await user.save();

        await logAuditEvent({
            actorId: user._id,
            actorRole: user.role,
            action: 'USER_LOGIN',
            resourceType: 'User',
            resourceId: user._id,
            req
        });

        res.status(200).json({ token, user: user.toJSON() });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get current user profile
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ user: user.toJSON() });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: Number(process.env.EMAIL_PORT),
            secure: Boolean(process.env.SECURE),
            auth: { user: process.env.USER, pass: process.env.PASS }
        });

        await transporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: 'Patientra Health — Password Reset',
            html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 15 minutes.</p>`,
        });

        res.status(200).json({ message: 'Password reset link has been sent to your email.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const hashedPassword = await bcrypt.hash(password, 12);

        await User.findByIdAndUpdate(decoded.userId, { password: hashedPassword });
        res.status(200).json({ message: 'Password reset successful. You can now log in.' });
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired token.' });
    }
};
