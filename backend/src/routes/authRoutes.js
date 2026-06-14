const express = require('express');
const router = express.Router();
const { signup, login, verify } = require('../controllers/authController');
const { validateSignup, validateLogin, checkValidation } = require('../middleware/validation');
const authMiddleware = require('../middleware/auth');

router.post('/signup', validateSignup, checkValidation, signup);
router.post('/login', validateLogin, checkValidation, login);
router.get('/verify', authMiddleware, verify);

module.exports = router;