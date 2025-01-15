const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res) => {
  try {
    console.log('Register attempt:', { 
      email: req.body.email,
      username: req.body.username 
    });

    const {
      email,
      password,
      username,
      firstName,
      lastName,
      recommendationCode
    } = req.body;

    // Validate required fields
    if (!email || !password || !username) {
      console.log('Missing required fields');
      return res.status(400).json({
        message: 'Email, Passwort und Benutzername sind erforderlich'
      });
    }

    // Check if user already exists
    let existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      console.log('User exists:', {
        email: existingUser.email === email,
        username: existingUser.username === username
      });
      return res.status(400).json({
        message: 'Ein Benutzer mit dieser Email oder diesem Benutzernamen existiert bereits'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user object
    const user = new User({
      email,
      username,
      password: hashedPassword,
      firstName,
      lastName
    });

    // Handle recommendation code
    if (recommendationCode) {
      const recommender = await User.findOne({ recommendationCode });
      if (recommender) {
        user.recommendedBy = recommender._id;
      }
    }

    // Generate unique recommendation code
    user.recommendationCode = await user.generateRecommendationCode();

    await user.save();
    console.log('User registered:', { id: user._id, email: user.email });

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const userResponse = {
      _id: user._id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage,
      recommendationCode: user.recommendationCode
    };

    res.status(201).json({
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Ein Fehler ist aufgetreten' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    console.log('Login attempt:', { email: req.body.email });
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing credentials');
      return res.status(400).json({ message: 'Email und Passwort sind erforderlich' });
    }

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    console.log('User found:', user ? {
      _id: user._id,
      email: user.email,
      username: user.username,
      hasPassword: !!user.password
    } : 'No user');

    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Ungültige Anmeldedaten' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password comparison:', {
      provided: password,
      hashedInDb: user.password,
      isMatch
    });

    if (!isMatch) {
      console.log('Invalid password');
      return res.status(401).json({ message: 'Ungültige Anmeldedaten' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from user object
    const userResponse = {
      _id: user._id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage
    };

    console.log('Login successful:', {
      userId: userResponse._id,
      token: token ? 'Token generated' : 'No token'
    });

    res.json({ token, user: userResponse });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Ein Fehler ist aufgetreten' });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Error getting user data' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow password update through this endpoint
    delete updates.password;
    
    // Update user fields
    Object.keys(updates).forEach(key => {
      user[key] = updates[key];
    });

    await user.save();

    res.json({
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        recommendationCode: user.recommendationCode
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};
