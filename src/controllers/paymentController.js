const BusinessAccount = require('../models/BusinessAccount');
const Transaction = require('../models/Transaction');
const { stkPush } = require('../utils/safaricom');

async function sendPayment(req, res) {
    try {
        const { account_id, amount, phone_number, account_reference } = req.body;
        const user_id = req.user.id;

        if (!account_id || !amount || !phone_number) {
            return res.status(400).json({ 
                error: 'account_id, amount, and phone_number are required' 
            });
        }

        const account = await BusinessAccount.findById(account_id, user_id);
        if (!account) {
            return res.status(404).json({ error: 'Account not found' });
        }

        if (!['paybill', 'till'].includes(account.account_type)) {
            return res.status(400).json({ 
                error: 'Account type must be paybill or till for STK Push' 
            });
        }

        let formattedPhone = phone_number.replace(/^0/, '254').replace(/^\+/, '');
        if (!formattedPhone.startsWith('254')) {
            formattedPhone = '254' + formattedPhone;
        }

        // 🔥 Step 1: Save pending transaction
        const transaction = await Transaction.create({
            user_id,
            account_id,
            phone_number: formattedPhone,
            amount,
            account_reference: account_reference || 'INV-' + Date.now()
        });

        // 🔥 Step 2: Build the callback URL from env
        const callbackUrl = process.env.CALLBACK_URL || 'https://your-app.com/callback';

        // 🔥 Step 3: Send STK Push with callback URL
        const result = await stkPush(
            account.consumer_key,
            account.consumer_secret,
            account.passkey,
            account.account_number,
            amount,
            formattedPhone,
            transaction.account_reference,
            callbackUrl  // Pass the dynamic callback URL
        );

        // 🔥 Step 4: Update transaction with Safaricom response
        if (result.CheckoutRequestID) {
            await Transaction.updateByCheckoutRequestId(result.CheckoutRequestID, {
                checkout_request_id: result.CheckoutRequestID,
                merchant_request_id: result.MerchantRequestID,
                result_code: parseInt(result.ResponseCode) === 0 ? 0 : 1,
                result_description: result.ResponseDescription
            });
        }

        res.json({
            message: 'Payment request sent successfully',
            transaction_id: transaction.id,
            result: result,
            account_reference: transaction.account_reference
        });

    } catch (error) {
        console.error('Send payment error:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to send payment request' 
        });
    }
}

module.exports = { sendPayment };