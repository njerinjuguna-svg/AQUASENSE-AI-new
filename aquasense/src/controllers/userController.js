const User = require('../models/User');
const jwt = require('jsonwebtoken');

// POST /api/users/register
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

    // Password is hashed by the model's beforeCreate hook - do NOT hash here too
    const newUser = await User.create({ username, email, password, full_name, organization_type });

    res.status(201).json({ message: 'Account created successfully.', userId: newUser.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
};

// POST /api/users/login  (Step 1: credentials -> OTP)
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

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // In production this would be sent via email/SMS
    console.log(`\n=============================`);
    console.log(`OTP FOR ${email}: ${otp}`);
    console.log(`=============================\n`);

    res.status(200).json({ message: 'OTP generated. Check server terminal (or your email in production).' });
  } catch (error) {
    res.status(500).json({ message: 'Login failed.', error: error.message });
  }
};

// POST /api/users/verify-otp  (Step 2: OTP -> JWT)
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

// GET /api/users/profile  (protected)
exports.getUserProfile = async (req, res) => {
  res.status(200).json(req.user);
};
