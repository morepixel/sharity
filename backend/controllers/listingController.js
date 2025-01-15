const Listing = require('../models/Listing');

// Create a new listing
exports.createListing = async (req, res) => {
  try {
    const {
      name,
      description,
      images,
      mainCategory,
      subCategory,
      location
    } = req.body;

    const listing = await Listing.create({
      name,
      description,
      images,
      mainCategory,
      subCategory,
      location,
      user: req.user.id
    });

    console.log('Created listing:', JSON.stringify(listing, null, 2));

    res.status(201).json(listing);
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ message: 'Error creating listing' });
  }
};

// Get all listings with filters
exports.getListings = async (req, res) => {
  try {
    console.log('Getting listings...');
    
    // Basic query for active listings
    const query = { status: 'live' };
    
    // Get listings with populated user
    const listings = await Listing.find(query)
      .populate('user', 'username profileImage')
      .sort('-createdAt')
      .lean()
      .exec();

    // Transform the data to match frontend expectations
    const transformedListings = listings.map(listing => ({
      _id: listing._id,
      title: listing.name,
      description: listing.description,
      images: listing.images.map((img, index) => ({
        url: img.url,
        isMain: img.isMain || index === 0
      })),
      location: listing.location?.city || 'Unbekannt',
      user: {
        _id: listing.user?._id,
        username: listing.user?.username || 'Unbekannt',
        profileImage: listing.user?.profileImage || null
      },
      mainCategory: listing.mainCategory,
      subCategory: listing.subCategory,
      createdAt: listing.createdAt,
      status: listing.status
    }));

    // Log the first listing for debugging
    if (transformedListings.length > 0) {
      console.log('First listing images:', 
        JSON.stringify(transformedListings[0].images, null, 2));
    }

    res.json(transformedListings);
  } catch (error) {
    console.error('Error getting listings:', error);
    res.status(500).json({ message: 'Error getting listings' });
  }
};

// Get a single listing
exports.getListing = async (req, res) => {
  try {
    console.log('Getting listing with id:', req.params.id);
    const listing = await Listing.findById(req.params.id)
      .populate('user', 'username profileImage')
      .lean()
      .exec();

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Transform the data to match frontend expectations
    const transformedListing = {
      _id: listing._id,
      title: listing.name,
      description: listing.description,
      images: listing.images.map((img, index) => ({
        url: img.url,
        isMain: img.isMain || index === 0
      })),
      location: listing.location?.city || 'Unbekannt',
      user: {
        _id: listing.user?._id,
        username: listing.user?.username || 'Unbekannt',
        profileImage: listing.user?.profileImage || null
      },
      mainCategory: listing.mainCategory,
      subCategory: listing.subCategory,
      createdAt: listing.createdAt,
      status: listing.status
    };

    // Log image data for debugging
    console.log('Transformed listing images:', 
      JSON.stringify(transformedListing.images, null, 2));

    res.json(transformedListing);
  } catch (error) {
    console.error('Error getting listing:', error);
    res.status(500).json({ message: 'Error getting listing' });
  }
};

// Update a listing
exports.updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user owns the listing
    if (listing.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    console.log('Updated listing:', JSON.stringify(updatedListing, null, 2));

    res.json(updatedListing);
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ message: 'Error updating listing' });
  }
};

// Delete a listing
exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user owns the listing
    if (listing.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await listing.remove();
    console.log('Listing removed:', listing._id);

    res.json({ message: 'Listing removed' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ message: 'Error deleting listing' });
  }
};
