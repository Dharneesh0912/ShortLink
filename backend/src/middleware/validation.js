const { body, param, validationResult } = require('express-validator');

// Validation rules for signup
const validateSignup = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number'),
];

// Validation rules for login
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Validation rules for URL shortening
const validateUrl = [
  body('originalUrl')
    .trim()
    .notEmpty()
    .withMessage('URL is required')
    .isURL({
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true,
      allow_underscores: true,
      allow_trailing_dot: false,
      allow_protocol_relative_urls: false,
    })
    .withMessage('Please provide a valid URL starting with http:// or https://'),
  body('customAlias')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ min: 3, max: 30 })
    .withMessage('Custom alias must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Custom alias can only contain letters, numbers, hyphens and underscores'),
  body('expiresAt')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      if (!value) return true;
      const expiryDate = new Date(value);
      if (expiryDate <= new Date()) {
        throw new Error('Expiry date must be in the future');
      }
      return true;
    }),
];

// Validation for bulk upload
const validateBulkUrl = (url) => {
  const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  return urlPattern.test(url);
};

// Middleware to check validation results
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = {
  validateSignup,
  validateLogin,
  validateUrl,
  validateBulkUrl,
  checkValidation,
};