const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Debug logs für Environment-Variablen
console.log('Environment variables:', {
  port: process.env.PORT,
  mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not set',
  jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not set'
});

// CORS configuration
app.use(cors({
  origin: '*', // In production, you should restrict this
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());

// Debug logs für Requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    body: req.body,
    query: req.query,
    headers: req.headers
  });
  next();
});

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  next();
});

// Serve static files from the images directory with proper MIME types
app.use('/images', express.static(path.join(__dirname, 'images'), {
  setHeaders: (res, filePath) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.removeHeader('X-Content-Type-Options');
    
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.set('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.png')) {
      res.set('Content-Type', 'image/png');
    } else if (filePath.endsWith('.gif')) {
      res.set('Content-Type', 'image/gif');
    } else if (filePath.endsWith('.webp')) {
      res.set('Content-Type', 'image/webp');
    }
  }
}));

// Debug route to check image serving
app.get('/test-image', (req, res) => {
  const imagePath = path.join(__dirname, 'images/listings/sofa1.jpg');
  console.log('Serving test image from:', imagePath);
  res.set('Content-Type', 'image/jpeg');
  res.sendFile(imagePath);
});

// Debug route to list images
app.get('/list-images', (req, res) => {
  const imagesDir = path.join(__dirname, 'images/listings');
  const fs = require('fs');
  fs.readdir(imagesDir, (err, files) => {
    if (err) {
      console.error('Error reading images directory:', err);
      return res.status(500).json({ error: 'Could not read images directory' });
    }
    res.json({ 
      directory: imagesDir,
      files: files
    });
  });
});

// Routes
console.log('Registering routes...');
const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chat');

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
console.log('Routes registered');

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;

// Create server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Images directory: ${path.join(__dirname, 'images')}`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
