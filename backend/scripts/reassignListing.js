require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Listing = require('../models/Listing');

const reassignListing = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create seller user if not exists
    const hashedPassword = await bcrypt.hash('seller123', 10);
    let sellerUser = await User.findOne({ email: 'seller@example.com' });
    if (!sellerUser) {
      sellerUser = await User.create({
        username: 'SellerUser',
        email: 'seller@example.com',
        password: hashedPassword,
        location: {
          type: 'Point',
          shareLocation: false
        }
      });
      console.log('Created seller user');
    }

    // Get first listing
    const listing = await Listing.findOne();
    if (!listing) {
      console.log('No listings found');
      process.exit(1);
    }

    console.log('Found listing:', listing.name);
    
    // Save original user ID
    const originalUserId = listing.user;

    // Update listing with new user
    await Listing.findByIdAndUpdate(listing._id, {
      user: sellerUser._id
    });

    console.log(`Reassigned listing "${listing.name}" from user ${originalUserId} to SellerUser (${sellerUser._id})`);
    console.log('\nYou can now:');
    console.log('1. Stay logged in as TestUser (test@example.com)');
    console.log('2. View the Sofa listing');
    console.log('3. You should see the chat button since the Sofa belongs to SellerUser');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

reassignListing();
