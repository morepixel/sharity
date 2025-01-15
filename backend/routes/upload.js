const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// POST /api/upload
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Keine Dateien hochgeladen' });
    }

    // URLs der hochgeladenen Dateien erstellen
    const imageUrls = req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      isMain: false
    }));
    
    // Erstes Bild als Hauptbild markieren
    if (imageUrls.length > 0) {
      imageUrls[0].isMain = true;
    }

    res.json({
      message: 'Bilder erfolgreich hochgeladen',
      images: imageUrls
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Fehler beim Hochladen der Bilder' });
  }
});

module.exports = router;
