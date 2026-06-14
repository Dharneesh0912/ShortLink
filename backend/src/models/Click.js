const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema({
  urlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Url',
    required: true,
    index: true,
  },
  shortCode: {
    type: String,
    required: true,
    index: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  ipAddress: {
    type: String,
    default: null,
  },
  userAgent: {
    type: String,
    default: null,
  },
  referer: {
    type: String,
    default: null,
  },
  country: {
    type: String,
    default: null,
  },
  city: {
    type: String,
    default: null,
  },
  device: {
    type: String,
    enum: ['mobile', 'desktop', 'tablet', 'bot', 'unknown'],
    default: 'unknown',
  },
  browser: {
    type: String,
    default: 'unknown',
  },
  os: {
    type: String,
    default: 'unknown',
  },
});

// Static method to get analytics for a URL
clickSchema.statics.getAnalyticsForUrl = async function(shortCode) {
  const clicks = await this.find({ shortCode }).sort({ timestamp: -1 });
  
  const totalClicks = clicks.length;
  const lastVisited = clicks.length > 0 ? clicks[0].timestamp : null;
  const recentVisits = clicks.slice(0, 10);
  
  // Daily trends (last 30 days)
  const dailyTrends = {};
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  clicks.forEach(click => {
    if (click.timestamp >= thirtyDaysAgo) {
      const date = click.timestamp.toISOString().split('T')[0];
      dailyTrends[date] = (dailyTrends[date] || 0) + 1;
    }
  });
  
  const dailyTrendsArray = Object.entries(dailyTrends).map(([date, count]) => ({ date, count }));
  
  // Device breakdown
  const deviceBreakdown = {};
  clicks.forEach(click => {
    const device = click.device || 'unknown';
    deviceBreakdown[device] = (deviceBreakdown[device] || 0) + 1;
  });
  
  // OS breakdown
  const osBreakdown = {};
  clicks.forEach(click => {
    const os = click.os || 'unknown';
    osBreakdown[os] = (osBreakdown[os] || 0) + 1;
  });
  
  // Browser breakdown
  const browserBreakdown = {};
  clicks.forEach(click => {
    const browser = click.browser || 'unknown';
    if (browser !== 'unknown') {
      browserBreakdown[browser] = (browserBreakdown[browser] || 0) + 1;
    }
  });

  // Referrer breakdown
  const referrerBreakdown = {};
  clicks.forEach(click => {
    try {
      const referer = click.referer;
      if (referer) {
        const domain = new URL(referer).hostname;
        referrerBreakdown[domain] = (referrerBreakdown[domain] || 0) + 1;
      } else {
        referrerBreakdown['Direct'] = (referrerBreakdown['Direct'] || 0) + 1;
      }
    } catch {
      referrerBreakdown['Other'] = (referrerBreakdown['Other'] || 0) + 1;
    }
  });
  
  // Country breakdown
  const countryBreakdown = {};
  clicks.forEach(click => {
    if (click.country) {
      countryBreakdown[click.country] = (countryBreakdown[click.country] || 0) + 1;
    }
  });
  
  return {
    totalClicks,
    lastVisited,
    recentVisits,
    dailyTrends: dailyTrendsArray,
    deviceBreakdown,
    osBreakdown,
    browserBreakdown,
    referrerBreakdown,
    countryBreakdown,
  };
};

module.exports = mongoose.model('Click', clickSchema);