const express = require('express');
const { handleCallback } = require('../controllers/callbackController');

const router = express.Router();

// ⚠️ IMPORTANT: This is a PUBLIC route – Safaricom calls it without a token
router.post('/payment/callback', handleCallback);

module.exports = router;