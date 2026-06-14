const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (userId, email) => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(`[DEBUG] Signup attempt for: ${email}`);
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`[DEBUG] Signup failed: User ${email} already exists`);
      return res.status(409).json({ error: 'User already exists with this email' });
    }
    
    // Hash password and create user
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      email,
      passwordHash,
    });
    
    console.log(`[DEBUG] User created successfully: ${user._id}`);
    // Generate token
    const token = generateToken(user._id, user.email);
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error(`[DEBUG] Signup error:`, error);
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(`[DEBUG] Login attempt for: ${email}`);
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`[DEBUG] Login failed: User ${email} not found`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`[DEBUG] Login failed: Password mismatch for ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log(`[DEBUG] Login successful for: ${email}`);
    // Generate token
    const token = generateToken(user._id, user.email);
    
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error(`[DEBUG] Login error:`, error);
    next(error);
  }
};

// @desc    Verify JWT token
// @route   GET /api/auth/verify
// @access  Private
const verify = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  verify,
};