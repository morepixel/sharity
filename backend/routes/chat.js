const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const mongoose = require('mongoose');

console.log('Setting up chat routes...');

// Debug middleware for chat routes
router.use((req, res, next) => {
  console.log('Chat route accessed:', {
    method: req.method,
    url: req.url,
    body: req.body,
    user: req.user?._id
  });
  next();
});

// Get all chats for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({
      $or: [{ user1: userId }, { user2: userId }]
    })
    .populate('user1', 'username')
    .populate('user2', 'username')
    .populate('listing', 'title')
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: 'username'
      }
    });

    res.json(chats);
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: 'Failed to get chats' });
  }
});

// Get messages for a chat
router.get('/:recipientId/messages', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { recipientId } = req.params;
    const { listingId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({ message: 'Invalid recipient ID' });
    }

    // Prevent self-messaging
    if (userId.toString() === recipientId) {
      return res.status(400).json({ message: 'Cannot message yourself' });
    }

    // Find chat
    const chat = await Chat.findOne({
      $or: [
        { user1: userId, user2: recipientId },
        { user1: recipientId, user2: userId }
      ],
      listing: listingId || null
    });

    if (!chat) {
      return res.json([]); // Return empty array if no chat exists yet
    }

    const messages = await Message.find({ chat: chat._id })
      .sort('createdAt')
      .populate('sender', 'username');

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Failed to get messages' });
  }
});

// Send a message
router.post('/:recipientId/messages', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { recipientId } = req.params;
    const { content, listingId } = req.body;

    console.log('Sending message:', {
      sender: userId,
      recipient: recipientId,
      content,
      listingId
    });

    // Validate recipient ID
    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({ message: 'Invalid recipient ID' });
    }

    // Prevent self-messaging
    if (userId.toString() === recipientId) {
      return res.status(400).json({ message: 'Cannot message yourself' });
    }

    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Validate listing ID if provided
    if (listingId && !mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({ message: 'Invalid listing ID' });
    }

    // Find or create chat
    let chat = await Chat.findOne({
      $or: [
        { user1: userId, user2: recipientId },
        { user1: recipientId, user2: userId }
      ],
      listing: listingId || null
    });

    if (!chat) {
      chat = new Chat({
        user1: userId,
        user2: recipientId,
        listing: listingId || null
      });
      await chat.save();
      console.log('Created new chat:', chat._id);
    }

    // Create and save message
    const message = new Message({
      chat: chat._id,
      sender: userId,
      content: content.trim()
    });

    await message.save();
    console.log('Saved message:', message._id);

    // Update chat's lastMessage
    chat.lastMessage = message._id;
    await chat.save();
    console.log('Updated chat with last message');

    // Populate sender info
    await message.populate('sender', 'username');

    console.log('Message sent successfully:', message);
    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to send message' });
  }
});

console.log('Chat routes set up');

module.exports = router;
