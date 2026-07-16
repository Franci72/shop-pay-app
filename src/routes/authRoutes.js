const express = require('express');
const { handleCallback } = require('../controllers/callbackController');

const router = express.Router();

router.post('/payment/callback', handleCallback);

module.exports = router;