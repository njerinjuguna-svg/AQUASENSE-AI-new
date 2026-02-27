// controllers/userController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendOTPEmail, sendPasswordResetEmail } = require('../utils/emailService');

// ─── POST /api/users/register ─────────────────────────────────────────────────
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password, full_name, organization_type } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required.' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    // Password is hashed by the model's beforeCreate hook
    const newUser = await User.create({ username, email, password, full_name, organization_type });

    res.status(201).json({ message: 'Account created successfully.', userId: newUser.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
};

// ─── POST /api/users/login  (Step 1: credentials → OTP sent to email) ─────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send OTP via email
    try {
      await sendOTPEmail(email, otp, user.username);
      console.log(`OTP sent to ${email}`);
    } catch (emailError) {
      // If email fails, still log to terminal as fallback (useful during dev)
      console.log(`\n=============================`);
      console.log(`EMAIL FAILED - OTP FOR ${email}: ${otp}`);
      console.log(`=============================\n`);
    }

    res.status(200).json({ message: `OTP sent to ${email}. Check your inbox.` });
  } catch (error) {
    res.status(500).json({ message: 'Login failed.', error: error.message });
  }
};

// ─── POST /api/users/verify-otp  (Step 2: OTP → JWT) ─────────────────────────
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    const user = await User.findOne({ where: { email, otp } });

    if (!user || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    // Clear OTP so it cannot be reused
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        organization_type: user.organization_type
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'OTP verification failed.', error: error.message });
  }
};

// ─── POST /api/users/forgot-password ──────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ where: { email } });

    // Always return success even if user not found (security: don't reveal if email exists)
    if (!user) {
      return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
    }

    // Generate secure random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await user.save();

    try {
      await sendPasswordResetEmail(email, user.username, resetToken);
    } catch (emailError) {
      // Rollback token if email fails
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      return res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
    }

    res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// ─── POST /api/users/reset-password ───────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // Hash the incoming token to compare with stored hash
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      where: {
        resetPasswordToken: resetTokenHash,
      }
    });

    if (!user || user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired reset token. Please request a new one.' });
    }

    // Update password (beforeUpdate hook will hash it)
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// ─── GET /api/users/profile  (protected) ──────────────────────────────────────
exports.getUserProfile = async (req, res) => {
  res.status(200).json(req.user);
};