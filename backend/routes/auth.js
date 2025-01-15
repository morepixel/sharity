const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Test route for auth
router.get('/test', auth, (req, res) => {
  console.log('Test route - User:', {
    _id: req.user._id,
    username: req.user.username
  });
  res.json({ 
    message: 'Auth successful',
    user: {
      _id: req.user._id,
      username: req.user.username
    }
  });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    console.log('Login request body:', {
      email: req.body.email,
      hasPassword: !!req.body.password
    });

    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing credentials:', { email: !!email, password: !!password });
      return res.status(400).json({
        message: 'E-Mail und Passwort sind erforderlich'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log('User found:', user ? {
      id: user._id,
      email: user.email,
      username: user.username
    } : 'No user');

    if (!user) {
      return res.status(401).json({
        message: 'Ungültige Anmeldedaten'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Ungültige Anmeldedaten'
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Generated token for user:', {
      id: user._id,
      email: user.email,
      token: token.substring(0, 20) + '...'
    });

    // Send response
    const response = {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage || 'https://via.placeholder.com/150',
        sharries: user.sharries || 0
      }
    };

    console.log('Login response:', {
      ...response,
      token: response.token.substring(0, 20) + '...'
    });
    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Login fehlgeschlagen',
      error: error.message
    });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    console.log('Register request body:', req.body);
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      const missingFields = [];
      if (!username) missingFields.push('username');
      if (!email) missingFields.push('email');
      if (!password) missingFields.push('password');
      
      console.log('Missing fields:', missingFields);
      return res.status(400).json({
        message: `Fehlende Felder: ${missingFields.join(', ')}`
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Ungültige E-Mail-Adresse'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.trim() }
      ]
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'E-Mail' : 'Benutzername';
      return res.status(400).json({
        message: `Dieser ${field} ist bereits registriert`
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      username: username.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      profileImage: 'https://via.placeholder.com/150',
      sharries: 0
    });

    await user.save();
    console.log('User saved:', {
      id: user._id,
      username: user.username,
      email: user.email
    });

    // Generate token
    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send response
    const response = {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        sharries: user.sharries
      }
    };

    console.log('Registration response:', response);
    res.status(201).json(response);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Registrierung fehlgeschlagen',
      error: error.message
    });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Fehler beim Laden des Profils' });
  }
});

// PUT /api/auth/me
router.put('/me', auth, async (req, res) => {
  try {
    const { username, location } = req.body;
    const updates = { username, location };

    // Optional: E-Mail-Änderung
    if (req.body.email) {
      const existingUser = await User.findOne({ 
        email: req.body.email,
        _id: { $ne: req.user._id }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Diese E-Mail wird bereits verwendet' });
      }
      updates.email = req.body.email;
    }

    // Optional: Passwort-Änderung
    if (req.body.password) {
      updates.password = req.body.password;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profil erfolgreich aktualisiert',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Fehler beim Aktualisieren des Profils' });
  }
});

module.exports = router;
