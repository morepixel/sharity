const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Listing = require('../models/Listing');

// GET /api/chats
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      $or: [
        { user1: req.user._id },
        { user2: req.user._id }
      ]
    })
    .populate('user1', 'username profileImage')
    .populate('user2', 'username profileImage')
    .populate('listing', 'name images status')
    .populate({
      path: 'lastMessage',
      select: 'content createdAt'
    })
    .sort('-updatedAt');

    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/chats
router.post('/', auth, async (req, res) => {
  try {
    const { listingId, message } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      listing: listingId,
      $or: [
        { user1: req.user._id, user2: listing.user },
        { user1: listing.user, user2: req.user._id }
      ]
    });

    if (!chat) {
      chat = new Chat({
        listing: listingId,
        user1: req.user._id,
        user2: listing.user
      });
      await chat.save();
    }

    // Create initial message
    const newMessage = new Message({
      chat: chat._id,
      sender: req.user._id,
      content: message
    });
    await newMessage.save();

    // Update chat's last message
    chat.lastMessage = newMessage._id;
    chat.updatedAt = new Date();
    await chat.save();

    // Populate and return chat
    await chat.populate([
      { path: 'user1', select: 'username profileImage' },
      { path: 'user2', select: 'username profileImage' },
      { path: 'listing', select: 'name images status' },
      { path: 'lastMessage', select: 'content createdAt' }
    ]);

    res.status(201).json(chat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/chats/:id/messages
router.get('/:id/messages', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Verify user is part of chat
    if (![chat.user1.toString(), chat.user2.toString()].includes(req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const messages = await Message.find({ chat: req.params.id })
      .populate('sender', 'username profileImage')
      .sort('createdAt');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/chats/:id/messages
router.post('/:id/messages', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Verify user is part of chat
    if (![chat.user1.toString(), chat.user2.toString()].includes(req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const message = new Message({
      chat: chat._id,
      sender: req.user._id,
      content: req.body.message
    });
    await message.save();

    // Update chat's last message
    chat.lastMessage = message._id;
    chat.updatedAt = new Date();
    await chat.save();

    await message.populate('sender', 'username profileImage');

    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
