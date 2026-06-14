const Click = require('../models/Click');
const Url = require('../models/Url');

// @desc    Get analytics for a short URL
// @route   GET /api/analytics/:shortCode
// @access  Private
const getAnalytics = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const userId = req.userId;
    
    // Verify URL ownership
    const url = await Url.findOne({
      $or: [
        { shortCode, userId },
        { customAlias: shortCode, userId },
      ],
    });
    
    if (!url) {
      return res.status(404).json({ error: 'URL not found or unauthorized' });
    }
    
    const analytics = await Click.getAnalyticsForUrl(shortCode);
    
    res.status(200).json({
      success: true,
      shortCode,
      originalUrl: url.originalUrl,
      totalClicks: analytics.totalClicks,
      lastVisited: analytics.lastVisited,
      recentVisits: analytics.recentVisits.map(visit => ({
        timestamp: visit.timestamp,
        ipAddress: visit.ipAddress,
        country: visit.country,
        device: visit.device,
        browser: visit.browser,
        referer: visit.referer,
      })),
      dailyTrends: analytics.dailyTrends,
      deviceBreakdown: analytics.deviceBreakdown,
      osBreakdown: analytics.osBreakdown,
      browserBreakdown: analytics.browserBreakdown,
      referrerBreakdown: analytics.referrerBreakdown,
      countryBreakdown: analytics.countryBreakdown,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public stats for a short URL (no auth required)
// @route   GET /api/stats/:shortCode
// @access  Public
const getPublicStats = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    
    // Find URL (even if expired)
    const url = await Url.findOne({
      $or: [
        { shortCode },
        { customAlias: shortCode },
      ],
    });
    
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }
    
    const analytics = await Click.getAnalyticsForUrl(shortCode);
    
    res.status(200).json({
      success: true,
      shortCode,
      originalUrl: url.originalUrl,
      totalClicks: analytics.totalClicks,
      lastVisited: analytics.lastVisited,
      dailyTrends: analytics.dailyTrends.slice(-7), // Last 7 days only for public
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get click timeline for chart
// @route   GET /api/analytics/:shortCode/clicks
// @access  Private
const getClickTimeline = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const { days = 30 } = req.query;
    
    const url = await Url.findOne({
      $or: [
        { shortCode, userId: req.userId },
        { customAlias: shortCode, userId: req.userId },
      ],
    });
    
    if (!url) {
      return res.status(404).json({ error: 'URL not found or unauthorized' });
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const clicks = await Click.find({
      shortCode,
      timestamp: { $gte: startDate },
    }).sort({ timestamp: 1 });
    
    // Group by date
    const timeline = {};
    clicks.forEach(click => {
      const date = click.timestamp.toISOString().split('T')[0];
      timeline[date] = (timeline[date] || 0) + 1;
    });
    
    const timelineArray = Object.entries(timeline).map(([date, count]) => ({
      date,
      count,
    }));
    
    res.status(200).json({
      success: true,
      timeline: timelineArray,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalytics,
  getPublicStats,
  getClickTimeline,
};