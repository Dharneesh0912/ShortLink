const crypto = require('crypto');
const Url = require('../models/Url');

// Alphanumeric characters only (no special chars like _ or -)
const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// Generate a cryptographically random 6-character alphanumeric short code
const randomCode = (length = 6) => {
  let result = '';
  const bytes = crypto.randomBytes(length * 2);
  for (let i = 0; i < bytes.length && result.length < length; i++) {
    const idx = bytes[i] % CHARS.length;
    result += CHARS[idx];
  }
  return result;
};

// Generate unique short code (6 characters)
const generateShortCode = async () => {
  let isUnique = false;
  let shortCode = '';
  let attempts = 0;
  const maxAttempts = 10;
  
  while (!isUnique && attempts < maxAttempts) {
    shortCode = randomCode(6);
    
    // Check if code already exists
    const existingUrl = await Url.findOne({ shortCode });
    if (!existingUrl) {
      isUnique = true;
    }
    attempts++;
  }
  
  if (!isUnique) {
    throw new Error('Unable to generate unique short code');
  }
  
  return shortCode;
};

// Check if custom alias is available
const isAliasAvailable = async (alias) => {
  // Check both shortCode and customAlias fields to be safe
  const existingUrl = await Url.findOne({
    $or: [{ shortCode: alias }, { customAlias: alias }],
  });
  return !existingUrl;
};

// Create short URL
const createShortUrl = async (originalUrl, userId, customAlias = null, expiresAt = null) => {
  let shortCode;
  
  if (customAlias && customAlias.trim().length > 0) {
    const alias = customAlias.trim();
    // Validate: alphanumeric, dash, underscore
    if (!/^[a-zA-Z0-9_-]+$/.test(alias)) {
      throw new Error('Alias must contain only letters, numbers, dashes, and underscores');
    }
    
    const available = await isAliasAvailable(alias);
    if (!available) {
      throw new Error('Alias already taken');
    }
    shortCode = alias;
    // CRITICAL: We set BOTH shortCode and customAlias to the same value
    customAlias = alias;
  } else {
    shortCode = await generateShortCode();
    customAlias = null;
  }
  
  const url = await Url.create({
    shortCode,
    originalUrl,
    userId,
    customAlias: customAlias || null,
    expiresAt: expiresAt || null,
    totalClicks: 0,
  });
  
  return url;
};

// Get URL by short code
const getUrlByShortCode = async (shortCode) => {
  const url = await Url.findOne({ shortCode });
  
  if (!url) {
    return null;
  }
  
  // Check if expired
  if (url.isExpired()) {
    return null;
  }
  
  return url;
};

// Get user's URLs
const getUserUrls = async (userId) => {
  const urls = await Url.find({ userId })
    .sort({ createdAt: -1 })
    .lean();
  
  return urls;
};

// Delete URL
const deleteUrl = async (urlId, userId) => {
  const url = await Url.findOne({ _id: urlId, userId });
  if (!url) {
    throw new Error('URL not found or unauthorized');
  }
  
  await url.deleteOne();
  return true;
};

// Update destination URL
const updateUrlDestination = async (urlId, userId, newOriginalUrl) => {
  const url = await Url.findOne({ _id: urlId, userId });
  if (!url) {
    throw new Error('URL not found or unauthorized');
  }
  
  url.originalUrl = newOriginalUrl;
  await url.save();
  
  return url;
};

// Get URL by ID with ownership check
const getUrlById = async (urlId, userId) => {
  const url = await Url.findOne({ _id: urlId, userId });
  if (!url) {
    return null;
  }
  return url;
};

module.exports = {
  generateShortCode,
  isAliasAvailable,
  createShortUrl,
  getUrlByShortCode,
  getUserUrls,
  deleteUrl,
  updateUrlDestination,
  getUrlById,
};