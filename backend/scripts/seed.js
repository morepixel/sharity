require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Listing = require('../models/Listing');

const API_URL = process.env.API_URL || 'http://localhost:5000';

const seedDatabase = async () => {
  try {
    // Load images from JSON file
    const imagesFile = path.join(__dirname, '../data/images.json');
    const images = JSON.parse(fs.readFileSync(imagesFile, 'utf8'));

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Listing.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const users = await User.create([
      {
        username: 'max',
        email: 'max@example.com',
        password: await bcrypt.hash('password123', 10),
        profileImage: images.users.max
      },
      {
        username: 'erika',
        email: 'erika@example.com',
        password: await bcrypt.hash('password123', 10),
        profileImage: images.users.erika
      },
      {
        username: 'tom',
        email: 'tom@example.com',
        password: await bcrypt.hash('password123', 10),
        profileImage: images.users.tom
      }
    ]);
    console.log('Created users');

    // Create listings
    const listings = [
      {
        name: 'Gemütliches Sofa',
        description: 'Ein sehr bequemes Sofa in gutem Zustand',
        images: [
          { url: images.listings.sofa1, isMain: true },
          { url: images.listings.sofa2, isMain: false }
        ],
        mainCategory: 'Haus & Garten',
        subCategory: 'Möbel',
        location: {
          type: 'Point',
          coordinates: [13.404954, 52.520008], // Berlin
          city: 'Berlin'
        },
        user: users[0]._id
      },
      {
        name: 'iPhone 12',
        description: 'Gebrauchtes iPhone 12 in sehr gutem Zustand',
        images: [
          { url: images.listings.iphone1, isMain: true },
          { url: images.listings.iphone2, isMain: false }
        ],
        mainCategory: 'Elektronik',
        subCategory: 'Smartphones',
        location: {
          type: 'Point',
          coordinates: [11.576124, 48.137154], // München
          city: 'München'
        },
        user: users[1]._id
      },
      {
        name: 'Vintage Fahrrad',
        description: 'Klassisches Stadtrad, frisch überholt',
        images: [
          { url: images.listings.bike1, isMain: true },
          { url: images.listings.bike2, isMain: false }
        ],
        mainCategory: 'Sport & Freizeit',
        subCategory: 'Fahrräder',
        location: {
          type: 'Point',
          coordinates: [9.993682, 53.551086], // Hamburg
          city: 'Hamburg'
        },
        user: users[2]._id
      }
    ];

    await Listing.create(listings);
    console.log('Created listings');

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
