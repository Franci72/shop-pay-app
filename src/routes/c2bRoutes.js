const express = require('express');
const { handleC2BCallback } = require('../controllers/c2bController');

const router = express.Router();

router.post('/c2b/callback', handleC2BCallback);

module.exports = router;