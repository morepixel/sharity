const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Listing = require('../models/Listing');

// Debug logging
router.use((req, res, next) => {
  console.log('[Users Route]', {
    method: req.method,
    path: req.path,
    auth: !!req.headers.authorization,
    user: req.user?._id
  });
  next();
});

// GET /api/users/me
router.get('/me', auth, async (req, res) => {
  try {
    console.log('Getting user profile:', req.user._id);
    
    // Get user data without password
    const user = await User.findById(req.user._id)
      .select('-password')
      .lean();

    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    // Get user's listings
    const listings = await Listing.find({ user: req.user._id })
      .select('title price images createdAt')
      .sort('-createdAt')
      .lean();

    // Add listings to user object
    const response = {
      ...user,
      listings
    };

    console.log('User profile found with', listings.length, 'listings');
    res.json(response);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ message: 'Fehler beim Laden des Benutzerprofils' });
  }
});

// PUT /api/users/me
router.put('/me', auth, async (req, res) => {
  try {
    console.log('Updating user profile:', req.user._id);
    const { username, email } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    // Update fields if provided
    if (username) user.username = username;
    if (email) user.email = email;

    await user.save();
    
    // Return updated user without password
    const updatedUser = await User.findById(user._id)
      .select('-password')
      .lean();

    console.log('User profile updated');
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Fehler beim Aktualisieren des Benutzerprofils' });
  }
});

module.exports = router;
