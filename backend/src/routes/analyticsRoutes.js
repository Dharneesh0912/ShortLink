const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getPublicStats,
  getClickTimeline,
} = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/auth');

// Protected analytics
router.get('/:shortCode', authMiddleware, getAnalytics);
router.get('/:shortCode/clicks', authMiddleware, getClickTimeline);

// Public stats (no auth)
router.get('/public/:shortCode', getPublicStats);

module.exports = router;