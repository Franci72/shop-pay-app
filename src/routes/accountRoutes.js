const express = require('express');
const { addAccount, listAccounts, deleteAccount, getAccount } = require('../controllers/accountController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All account routes require authentication
router.use(authenticate);

router.post('/accounts', addAccount);
router.get('/accounts', listAccounts);
router.get('/accounts/:id', getAccount);
router.delete('/accounts/:id', deleteAccount);

module.exports = router;