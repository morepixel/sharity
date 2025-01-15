require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const User = require('../models/User');
const Listing = require('../models/Listing');

const downloadAndProcessImage = async (filename) => {
  const imagesDir = path.join(__dirname, '..', 'images', 'listings');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  // Kopiere ein existierendes Bild als Platzhalter
  const sourceImage = path.join(__dirname, '..', 'images', 'listings', 'sofa1.jpg');
  const targetImage = path.join(imagesDir, filename);

  if (fs.existsSync(sourceImage)) {
    // Verarbeite das Bild mit sharp
    await sharp(sourceImage)
      .resize(800, 600, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(targetImage);
    
    return `images/listings/${filename}`;
  } else {
    console.error('Source image not found:', sourceImage);
    return null;
  }
};

const seedTestData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete only the test user if exists
    await User.deleteOne({ email: 'test@example.com' });
    console.log('Deleted existing test user');

    // Create test user
    const hashedPassword = await bcrypt.hash('test123', 10);
    const testUser = await User.create({
      username: 'TestUser',
      email: 'test@example.com',
      password: hashedPassword
    });
    console.log('Created test user:', testUser);

    // Create images for new listings
    const bike1 = await downloadAndProcessImage('bike1.jpg');
    const camera1 = await downloadAndProcessImage('camera1.jpg');

    // Create test listings
    const listings = [
      {
        name: 'Vintage Fahrrad',
        description: 'Gut erhaltenes Vintage-Rennrad aus den 80er Jahren. Perfekt für Stadtfahrten und Sammler.',
        images: [
          {
            url: bike1,
            isMain: true
          }
        ],
        mainCategory: 'Sport & Freizeit',
        subCategory: 'Fahrräder',
        location: {
          type: 'Point',
          coordinates: [13.404954, 52.520008],
          city: 'Berlin'
        },
        user: testUser._id,
        status: 'live'
      },
      {
        name: 'Profi-Kamera Set',
        description: 'Komplettes Kamera-Set mit Objektiven und Zubehör. Ideal für ambitionierte Fotografen.',
        images: [
          {
            url: camera1,
            isMain: true
          }
        ],
        mainCategory: 'Elektronik',
        subCategory: 'Kameras',
        location: {
          type: 'Point',
          coordinates: [13.404954, 52.520008],
          city: 'Berlin'
        },
        user: testUser._id,
        status: 'live'
      }
    ];

    // Create only new listings
    for (const listingData of listings) {
      const listing = await Listing.create(listingData);
      console.log('Created listing:', listing.name);
    }

    console.log('Test data seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding test data:', error);
    process.exit(1);
  }
};

seedTestData();
