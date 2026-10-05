import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to generate JWT token for authenticated requests
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'bulk_mail_secret_key', {
    expiresIn: '7d'
  });
};

// Seed an initial admin user if the database is newly set up
export const seedDefaultAdmin = async () => {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers === 0) {
      const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@bulkmail.com';
      const password = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
      await User.create({
        name: 'Admin',
        email,
        password,
        role: 'admin'
      });
      console.log(`Default admin created: ${email} (password: ${password})`);
    }
  } catch (error) {
    console.error('Error seeding admin user:', error.message);
  }
};

// Admin login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.json({
      success: true,
      token: createToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        smtpConfig: user.smtpConfig
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Register a new admin account
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name: name || 'Admin',
      email: email.toLowerCase().trim(),
      password
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token: createToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        smtpConfig: user.smtpConfig
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get current user profile
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Save user's custom SMTP configuration
export const updateSmtpConfig = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.smtpConfig = {
      ...user.smtpConfig,
      ...req.body
    };

    await user.save();

    res.json({
      success: true,
      message: 'SMTP settings updated',
      smtpConfig: user.smtpConfig
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
