const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const SECRET_KEY = process.env.JWT_SECRET || 'supersecretkey';

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
    },
    SECRET_KEY,
    { expiresIn: '30m' }
  );
};

const cookieOptions = {
  httpOnly: true,
  secure: false,              // set to true in production (HTTPS)
  sameSite: 'lax',
  maxAge: 30 * 60 * 1000,    // 30 minutes
};

/* ==========================================
   POST /auth/register  — local registration
   ========================================== */
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  try {
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      if (existing.authType === 'google') {
        return res.status(400).json({
          message: 'This email is linked to a Google account. Please sign in with Google.',
        });
      }
      return res.status(400).json({ message: 'Email already registered. Please log in.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      authType: 'local',
    });

    const token = generateToken(user);
    res.cookie('token', token, cookieOptions);

    return res.status(201).json({
      message: 'Account created successfully.',
      user: { id: user.id, name: user.name, email: user.email, profilePic: user.profilePic },
    });
  } catch (err) {
    console.error('Register error:', err.message);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

/* ======================================
   POST /auth/login  — local login
   ====================================== */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (user.authType === 'google') {
      return res.status(400).json({
        message: 'This account uses Google sign-in. Please use the Google button.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    res.cookie('token', token, cookieOptions);

    return res.json({
      message: 'Login successful.',
      user: { id: user.id, name: user.name, email: user.email, profilePic: user.profilePic },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

module.exports = router;
