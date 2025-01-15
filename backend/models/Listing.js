const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  mainCategory: {
    type: String,
    required: true,
    enum: [
      'Haus & Garten',
      'Elektronik',
      'Mode & Kosmetik',
      'Sport & Freizeit',
      'Baby & Kind',
      'Bücher & Medien',
      'Auto & Mobilität',
      'Sonstiges'
    ]
  },
  subCategory: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    },
    city: String,
    distance: Number
  },
  status: {
    type: String,
    enum: ['live', 'pending', 'given'],
    default: 'live'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  chats: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat'
  }],
  givenTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexe für Geo-Suche und Textsuche
listingSchema.index({ 'location.coordinates': '2dsphere' });
listingSchema.index({ name: 'text', description: 'text' });

// Pre-save middleware
listingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure at least one image is marked as main
listingSchema.pre('save', function(next) {
  if (this.images && this.images.length > 0) {
    const hasMainImage = this.images.some(img => img.isMain);
    if (!hasMainImage) {
      this.images[0].isMain = true;
    }
  }
  next();
});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
