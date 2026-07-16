const express = require('express');
const { sendPayment } = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All payment routes require authentication
router.use(authenticate);

router.post('/payment/send', sendPayment);

module.exports = router;