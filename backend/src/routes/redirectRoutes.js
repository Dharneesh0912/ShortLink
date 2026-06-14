const express = require('express');
const router = express.Router();
const UAParser = require('ua-parser-js');
const axios = require('axios');
const Click = require('../models/Click');
const Url = require('../models/Url');

// Track click and redirect
router.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    
    // Find URL
    const url = await Url.findOne({
      $or: [
        { shortCode },
        { customAlias: shortCode },
      ],
    });
    
    if (!url) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Link Not Found</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>🔗 Link Not Found</h1>
          <p>The short link you're looking for doesn't exist or has been removed.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}">Go to Home</a>
        </body>
        </html>
      `);
    }
    
    // Check if expired
    if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
      return res.status(410).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Link Expired</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>⏰ Link Expired</h1>
          <p>This short link has expired on ${new Date(url.expiresAt).toLocaleDateString()}.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}">Go to Home</a>
        </body>
        </html>
      `);
    }

    // ── Redirect IMMEDIATELY — don't wait for analytics ──
    res.redirect(302, url.originalUrl);

    // ── Track click asynchronously AFTER redirect is sent ──
    setImmediate(async () => {
      try {
        const uaParser = new UAParser(req.headers['user-agent']);
        const uaResult = uaParser.getResult();

        let device = 'desktop';
        if (uaResult.device.type === 'mobile') device = 'mobile';
        else if (uaResult.device.type === 'tablet') device = 'tablet';
        else if (uaResult.device.type === 'bot') device = 'bot';

        const browser = uaResult.browser.name || 'unknown';
        const os = uaResult.os.name || 'unknown';

        let country = null;
        let city = null;
        const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

        try {
          const geoResponse = await axios.get(`http://ip-api.com/json/${clientIp}`, { timeout: 2000 });
          if (geoResponse.data && geoResponse.data.status === 'success') {
            country = geoResponse.data.country;
            city = geoResponse.data.city;
          }
        } catch { /* geolocation failure is non-fatal */ }

        await Promise.all([
          Click.create({
            urlId: url._id,
            shortCode: url.shortCode,
            timestamp: new Date(),
            ipAddress: clientIp,
            userAgent: req.headers['user-agent'],
            referer: req.headers['referer'] || null,
            country,
            city,
            device,
            browser,
            os,
          }),
          url.incrementClicks(),
        ]);
      } catch (trackErr) {
        console.error('Click tracking error:', trackErr);
      }
    });

  } catch (error) {
    console.error('Redirect error:', error);
    if (!res.headersSent) {
      res.status(500).send('Internal server error');
    }
  }
});

module.exports = router;