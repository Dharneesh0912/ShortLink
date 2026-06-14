const express = require('express');
const router = express.Router();
const {
  shortenUrl,
  getUserUrls,
  deleteUrl,
  updateUrl,
  checkAlias,
  bulkCreate,
  upload,
} = require('../controllers/urlController');
const authMiddleware = require('../middleware/auth');
const { validateUrl, checkValidation } = require('../middleware/validation');

// All routes require authentication
router.use(authMiddleware);

router.post('/shorten', validateUrl, checkValidation, shortenUrl);
router.get('/', getUserUrls);
router.delete('/:id', deleteUrl);
router.put('/:id', updateUrl);
router.get('/check-alias/:alias', checkAlias);
router.post('/bulk', upload.single('file'), bulkCreate);

module.exports = router;