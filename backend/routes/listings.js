const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const listingController = require('../controllers/listingController');

// Debug logging
router.use((req, res, next) => {
  console.log('[Listings Route]', {
    method: req.method,
    path: req.path,
    auth: !!req.headers.authorization,
    user: req.user?._id
  });
  next();
});

// Public routes (no auth required)
router.get('/', listingController.getListings);
router.get('/:id', listingController.getListing);

// Protected routes (auth required)
router.post('/', auth, listingController.createListing);
router.put('/:id', auth, listingController.updateListing);
router.delete('/:id', auth, listingController.deleteListing);

module.exports = router;
