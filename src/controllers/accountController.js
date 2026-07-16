const BusinessAccount = require('../models/BusinessAccount');

// Add a new M-PESA account
async function addAccount(req, res) {
    try {
        const { account_type, account_number, consumer_key, consumer_secret, passkey, environment } = req.body;
        const user_id = req.user.id;

        if (!account_type || !account_number || !consumer_key || !consumer_secret) {
            return res.status(400).json({ error: 'account_type, account_number, consumer_key, and consumer_secret are required' });
        }

        const account = await BusinessAccount.create({
            user_id,
            account_type,
            account_number,
            consumer_key,
            consumer_secret,
            passkey,
            environment
        });

        res.status(201).json({
            message: 'Account added successfully',
            account: {
                id: account.id,
                account_type: account.account_type,
                account_number: account.account_number,
                environment: account.environment,
                created_at: account.created_at
            }
        });
    } catch (error) {
        console.error('Add account error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// List all accounts for the logged-in user
async function listAccounts(req, res) {
    try {
        const user_id = req.user.id;
        const accounts = await BusinessAccount.findByUser(user_id);
        // Remove sensitive data from response
        const safeAccounts = accounts.map(acc => ({
            id: acc.id,
            account_type: acc.account_type,
            account_number: acc.account_number,
            environment: acc.environment,
            is_default: acc.is_default,
            last_used_at: acc.last_used_at,
            created_at: acc.created_at
        }));
        res.json({ accounts: safeAccounts });
    } catch (error) {
        console.error('List accounts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Delete an account
async function deleteAccount(req, res) {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const deleted = await BusinessAccount.delete(id, user_id);
        if (!deleted) {
            return res.status(404).json({ error: 'Account not found' });
        }

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Get a single account (decrypted credentials for sending payments)
async function getAccount(req, res) {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const account = await BusinessAccount.findById(id, user_id);
        if (!account) {
            return res.status(404).json({ error: 'Account not found' });
        }

        // WARNING: This returns decrypted credentials – only use for initiating payments
        res.json({ account });
    } catch (error) {
        console.error('Get account error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { addAccount, listAccounts, deleteAccount, getAccount };