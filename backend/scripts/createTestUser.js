require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createTestUser = async () => {
  try {
    // Mit MongoDB verbinden
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Testbenutzer erstellen
    const testUser = new User({
      email: 'seller@example.com',
      username: 'seller',
      password: 'password123',  // Wird automatisch gehasht
      profileImage: 'https://via.placeholder.com/150',
      sharries: 100
    });

    // Benutzer speichern
    await testUser.save();
    console.log('Test user created:', {
      id: testUser._id,
      email: testUser.email,
      username: testUser.username
    });

    // Verbindung schließen
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
};

createTestUser();
