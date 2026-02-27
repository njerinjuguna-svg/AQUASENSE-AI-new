// controllers/userController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../utils/emailService');

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

    const newUser = await User.create({ username, email, password, full_name, organization_type });

    res.status(201).json({ message: 'Account created successfully.', userId: newUser.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
};

// ─── POST /api/users/login  (direct JWT - no OTP) ─────────────────────────────
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
    res.status(500).json({ message: 'Login failed.', error: error.message });
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

    if (!user) {
      return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();

    try {
      await sendPasswordResetEmail(email, user.username, resetToken);
    } catch (emailError) {
      console.error('❌ Resend error:', JSON.stringify(emailError, null, 2));
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      return res.status(500).json({ message: 'Failed to send reset email. Please try again.', error: emailError.message });
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

    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({ where: { resetPasswordToken: resetTokenHash } });

    if (!user || user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired reset token. Please request a new one.' });
    }

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