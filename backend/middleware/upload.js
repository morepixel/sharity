const multer = require('multer');
const path = require('path');

// Konfiguration für Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Eindeutiger Dateiname mit Timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Dateifilter
const fileFilter = (req, file, cb) => {
  // Erlaubte Dateitypen
  const allowedTypes = /jpeg|jpg|png|webp/;
  
  // Prüfe MIME-Type
  const mimeOk = allowedTypes.test(file.mimetype);
  // Prüfe Dateiendung
  const extOk = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimeOk && extOk) {
    cb(null, true);
  } else {
    cb(new Error('Nur Bilder (jpg, jpeg, png, webp) sind erlaubt!'), false);
  }
};

// Upload-Konfiguration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5 // Maximal 5 Dateien
  }
});

module.exports = upload;
