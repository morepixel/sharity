const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    console.log('Auth middleware - Headers:', req.headers);
    
    // Token aus dem Authorization Header extrahieren
    const authHeader = req.header('Authorization');
    console.log('Auth header:', authHeader);
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('No Bearer token found');
      return res.status(401).json({ message: 'Keine Authentifizierung' });
    }

    const token = authHeader.substring(7);
    console.log('Token found:', token ? 'Token present' : 'No token');
    
    if (!token) {
      console.log('No token after extraction');
      return res.status(401).json({ message: 'Keine Authentifizierung' });
    }

    // Token verifizieren
    console.log('Verifying token with secret:', process.env.JWT_SECRET ? 'Secret present' : 'No secret');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    // User in der Datenbank finden
    const user = await User.findById(decoded.userId);
    console.log('Found user:', user ? {
      _id: user._id,
      username: user.username
    } : 'No user found');
    
    if (!user) {
      console.log('User not found in database');
      return res.status(401).json({ message: 'Benutzer nicht gefunden' });
    }

    // User zum Request hinzufügen
    req.user = user;
    req.token = token;
    console.log('Auth successful, proceeding to next middleware');
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.name === 'JsonWebTokenError') {
      console.log('JsonWebTokenError:', error.message);
      return res.status(401).json({ message: 'Ungültiger Token' });
    }
    if (error.name === 'TokenExpiredError') {
      console.log('TokenExpiredError:', error.message);
      return res.status(401).json({ message: 'Token abgelaufen' });
    }
    console.log('Unknown error:', error.message);
    res.status(500).json({ message: 'Server Fehler' });
  }
};

module.exports = auth;
