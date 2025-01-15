require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const resetPassword = async () => {
  try {
    // Mit MongoDB verbinden
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Benutzer finden
    const user = await User.findOne({ email: 'seller@example.com' });
    if (!user) {
      console.log('User not found');
      return;
    }

    // Neues Passwort setzen und speichern
    user.password = 'password123';
    await user.save(); // Dies wird das Passwort automatisch hashen

    console.log('Password reset successful for user:', {
      id: user._id,
      email: user.email,
      username: user.username
    });

    // Verbindung schließen
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
};

resetPassword();
