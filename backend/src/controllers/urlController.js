const urlService = require('../services/urlService');
const Click = require('../models/Click');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const multer = require('multer');
const { validateBulkUrl } = require('../middleware/validation');

// Ensure qrcodes directory exists
const qrDir = path.join(__dirname, '../../qrcodes');
if (!fs.existsSync(qrDir)) {
  fs.mkdirSync(qrDir, { recursive: true });
}

// @desc    Create short URL
// @route   POST /api/urls/shorten
// @access  Private
const shortenUrl = async (req, res, next) => {
  try {
    const { originalUrl, customAlias, expiresAt } = req.body;
    const userId = req.userId;
    
    // Check for duplicate URL for this user (optional feature)
    const existingUrl = await require('../models/Url').findOne({
      userId,
      originalUrl,
    });
    
    if (existingUrl && !customAlias) {
      return res.status(200).json({
        success: true,
        message: 'URL already shortened',
        url: {
          id: existingUrl._id,
          shortCode: existingUrl.shortCode,
          shortUrl: `${req.protocol}://${req.get('host')}/${existingUrl.shortCode}`,
          originalUrl: existingUrl.originalUrl,
          totalClicks: existingUrl.totalClicks,
          createdAt: existingUrl.createdAt,
        },
      });
    }
    
    const url = await urlService.createShortUrl(
      originalUrl,
      userId,
      customAlias,
      expiresAt
    );
    
    // Generate QR code
    const shortUrl = `${req.protocol}://${req.get('host')}/${url.shortCode}`;
    const qrCodePath = path.join(qrDir, `${url.shortCode}.png`);
    await QRCode.toFile(qrCodePath, shortUrl, {
      width: 300,
      margin: 2,
    });
    
    res.status(201).json({
      success: true,
      url: {
        id: url._id,
        shortCode: url.shortCode,
        shortUrl: shortUrl,
        originalUrl: url.originalUrl,
        customAlias: url.customAlias,
        expiresAt: url.expiresAt,
        totalClicks: url.totalClicks,
        createdAt: url.createdAt,
        qrCodeUrl: `/qrcodes/${url.shortCode}.png`,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all user URLs
// @route   GET /api/urls
// @access  Private
const getUserUrls = async (req, res, next) => {
  try {
    const urls = await urlService.getUserUrls(req.userId);
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const urlsWithFullInfo = urls.map(url => ({
      id: url._id,
      shortCode: url.shortCode,
      shortUrl: `${baseUrl}/${url.shortCode}`,
      originalUrl: url.originalUrl,
      customAlias: url.customAlias,
      expiresAt: url.expiresAt,
      totalClicks: url.totalClicks,
      lastClickedAt: url.lastClickedAt,
      createdAt: url.createdAt,
      updatedAt: url.updatedAt,
      isExpired: url.expiresAt ? new Date(url.expiresAt) < new Date() : false,
      qrCodeUrl: `/qrcodes/${url.shortCode}.png`,
    }));
    
    res.status(200).json({
      success: true,
      count: urlsWithFullInfo.length,
      urls: urlsWithFullInfo,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete URL
// @route   DELETE /api/urls/:id
// @access  Private
const deleteUrl = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await urlService.deleteUrl(id, req.userId);
    
    // Delete QR code file
    const url = await require('../models/Url').findById(id);
    if (url) {
      const qrPath = path.join(qrDir, `${url.shortCode}.png`);
      if (fs.existsSync(qrPath)) {
        fs.unlinkSync(qrPath);
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'URL deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update destination URL
// @route   PUT /api/urls/:id
// @access  Private
const updateUrl = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { originalUrl } = req.body;
    
    if (!originalUrl || !originalUrl.match(/^https?:\/\/.+/)) {
      return res.status(400).json({ error: 'Valid URL is required' });
    }
    
    const updatedUrl = await urlService.updateUrlDestination(id, req.userId, originalUrl);
    
    res.status(200).json({
      success: true,
      url: {
        id: updatedUrl._id,
        shortCode: updatedUrl.shortCode,
        originalUrl: updatedUrl.originalUrl,
        totalClicks: updatedUrl.totalClicks,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check alias availability
// @route   GET /api/urls/check-alias/:alias
// @access  Private
const checkAlias = async (req, res, next) => {
  try {
    const { alias } = req.params;
    const available = await urlService.isAliasAvailable(alias);
    
    res.status(200).json({
      success: true,
      alias,
      available,
    });
  } catch (error) {
    next(error);
  }
};

// Configure multer for CSV upload
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
});

// @desc    Bulk create URLs from CSV
// @route   POST /api/urls/bulk
// @access  Private
const bulkCreate = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'CSV file is required' });
    }
    
    const csvContent = req.file.buffer.toString('utf8');
    const lines = csvContent.split('\n');
    const headers = lines[0].toLowerCase().split(',');
    
    const urlColumnIndex = headers.findIndex(h => 
      h.includes('url') || h === 'link' || h === 'destination'
    );
    
    if (urlColumnIndex === -1) {
      return res.status(400).json({ error: 'CSV must contain a URL column' });
    }
    
    const results = [];
    const errors = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const columns = line.split(',');
      const url = columns[urlColumnIndex]?.trim();
      
      if (url && validateBulkUrl(url)) {
        try {
          let finalUrl = url;
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            finalUrl = 'https://' + url;
          }
          
          const newUrl = await urlService.createShortUrl(finalUrl, req.userId);
          results.push({
            originalUrl: finalUrl,
            shortCode: newUrl.shortCode,
            status: 'success',
          });
          
          // Generate QR code
          const shortUrl = `${req.protocol}://${req.get('host')}/${newUrl.shortCode}`;
          const qrCodePath = path.join(qrDir, `${newUrl.shortCode}.png`);
          await QRCode.toFile(qrCodePath, shortUrl, { width: 300, margin: 2 });
        } catch (error) {
          errors.push({ url, error: error.message });
        }
      } else if (url) {
        errors.push({ url, error: 'Invalid URL format' });
      }
    }
    
    res.status(201).json({
      success: true,
      totalProcessed: results.length + errors.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors: errors.slice(0, 10), // Limit error output
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  shortenUrl,
  getUserUrls,
  deleteUrl,
  updateUrl,
  checkAlias,
  bulkCreate,
  upload,
};