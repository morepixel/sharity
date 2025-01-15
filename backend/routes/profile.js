const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Listing = require('../models/Listing');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Debug logging
router.use((req, res, next) => {
  console.log('[Profile Route]', {
    method: req.method,
    path: req.path,
    auth: !!req.headers.authorization,
    user: req.user?._id
  });
  next();
});

// Multer Konfiguration für Profilbilder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profiles/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB Limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Nur Bilder im Format JPG oder PNG sind erlaubt!'));
  }
});

// GET /api/profile
// Get current user profile
router.get('/', auth, async (req, res) => {
  try {
    console.log('GET /api/profile - User ID:', req.user.userId);
    
    const user = await User.findById(req.user._id)
      .select('-password');
    
    console.log('Found user:', user ? 'yes' : 'no');
    
    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    // Formatiere die Antwort
    const response = {
      id: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage || 'https://via.placeholder.com/150',
      sharries: user.sharries || 0
    };

    console.log('Sending profile response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error in GET /api/profile:', error);
    res.status(500).json({ message: 'Server Fehler' });
  }
});

// GET /api/profile/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    // Hole die Listings des Users
    const listings = await Listing.find({ user: req.user._id })
      .select('title images createdAt')
      .sort('-createdAt');

    // Füge die Listings zum User-Objekt hinzu
    const userObject = user.toObject();
    userObject.listings = listings;

    res.json(userObject);
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ message: 'Fehler beim Laden des Profils' });
  }
});

// PUT /api/profile
// Update user profile
router.put('/', auth, async (req, res) => {
  try {
    console.log('PUT /api/profile - User ID:', req.user._id);
    console.log('Update data:', req.body);
    
    const { username, email, profileImage } = req.body;
    const updateData = {};

    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (profileImage) updateData.profileImage = profileImage;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    // Formatiere die Antwort
    const response = {
      id: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage || 'https://via.placeholder.com/150',
      sharries: user.sharries || 0
    };

    console.log('Sending updated profile:', response);
    res.json(response);
  } catch (error) {
    console.error('Error in PUT /api/profile:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Diese E-Mail oder dieser Benutzername wird bereits verwendet' 
      });
    }
    res.status(500).json({ message: 'Server Fehler' });
  }
});

// PUT /api/profile/me
router.put('/me', auth, upload.single('profileImage'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    // Update basic info
    if (req.body.username) user.username = req.body.username;
    if (req.body.email) user.email = req.body.email;
    if (req.body.bio) user.bio = req.body.bio;
    if (req.body.location) user.location = req.body.location;

    // Handle profile image upload
    if (req.file) {
      // Delete old profile image if it exists
      if (user.profileImage) {
        try {
          const oldImagePath = path.join(__dirname, '..', user.profileImage);
          await fs.unlink(oldImagePath);
        } catch (error) {
          console.error('Error deleting old profile image:', error);
        }
      }

      // Update with new image path
      user.profileImage = '/uploads/profiles/' + req.file.filename;
    }

    await user.save();
    
    // Return updated user with listings
    const listings = await Listing.find({ user: user._id })
      .select('title images createdAt')
      .sort('-createdAt');

    const userObject = user.toObject();
    userObject.listings = listings;

    res.json(userObject);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Fehler beim Aktualisieren des Profils' });
  }
});

// Delete profile image
router.delete('/me/profileImage', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    if (user.profileImage) {
      try {
        const imagePath = path.join(__dirname, '..', user.profileImage);
        await fs.unlink(imagePath);
      } catch (error) {
        console.error('Error deleting profile image:', error);
      }

      user.profileImage = null;
      await user.save();
    }

    res.json({ message: 'Profilbild erfolgreich gelöscht' });
  } catch (error) {
    console.error('Error deleting profile image:', error);
    res.status(500).json({ message: 'Fehler beim Löschen des Profilbilds' });
  }
});

module.exports = router;
