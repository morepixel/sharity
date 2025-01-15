const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const Listing = require('../models/Listing');

// Create a new chat
exports.createChat = async (req, res) => {
  try {
    console.log('Create chat request:', { 
      body: req.body, 
      user: req.user ? {
        _id: req.user._id,
        username: req.user.username
      } : 'No user'
    });
    
    const { recipientId, listingId } = req.body;
    const userId = req.user._id;

    if (!recipientId) {
      return res.status(400).json({ message: 'Recipient ID is required' });
    }

    // Get the recipient user
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      $or: [
        { user1: userId, user2: recipientId },
        { user1: recipientId, user2: userId }
      ],
      listing: listingId || null
    });

    if (chat) {
      console.log('Found existing chat:', chat._id);
      return res.json(chat);
    }

    // Create new chat
    chat = new Chat({
      user1: userId,
      user2: recipientId,
      listing: listingId || null
    });

    await chat.save();
    console.log('Created new chat:', chat._id);
    
    res.status(201).json(chat);
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ message: 'Failed to create chat' });
  }
};

// Get all chats for a user
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({
      $or: [{ user1: userId }, { user2: userId }]
    })
    .populate('user1', 'username')
    .populate('user2', 'username')
    .populate('listing', 'title')
    .populate('lastMessage');

    res.json(chats);
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: 'Failed to get chats' });
  }
};

// Get messages for a chat
exports.getChatMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { recipientId } = req.params;
    const { listingId } = req.query;

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
    }

    const messages = await Message.find({ chat: chat._id })
      .sort('createdAt')
      .populate('sender', 'username');

    console.log('Found messages:', messages.length);
    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Failed to get messages' });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    console.log('Send message request:', {
      params: req.params,
      body: req.body,
      user: req.user._id
    });

    const userId = req.user._id;
    const { recipientId } = req.params;
    const { content, listingId } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Message content is required' });
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
    }

    // Create and save the message
    const message = new Message({
      chat: chat._id,
      sender: userId,
      content
    });

    await message.save();

    // Update chat's lastMessage
    chat.lastMessage = message._id;
    await chat.save();

    // Populate sender info before sending response
    await message.populate('sender', 'username');

    console.log('Message sent:', message);
    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};
