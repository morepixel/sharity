const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: false // Make listing optional
  },
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }
}, {
  timestamps: true
});

// Ensure unique chat between two users for a listing (or without listing)
chatSchema.index(
  { 
    listing: 1, 
    user1: 1, 
    user2: 1 
  }, 
  { 
    unique: true,
    partialFilterExpression: { listing: { $exists: true } }
  }
);

// Ensure unique chat between two users without a listing
chatSchema.index(
  { 
    user1: 1, 
    user2: 1 
  }, 
  { 
    unique: true,
    partialFilterExpression: { listing: { $exists: false } }
  }
);

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
