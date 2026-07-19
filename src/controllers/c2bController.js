const Transaction = require('../models/Transaction');

async function handleC2BCallback(req, res) {
    try {
        console.log('📩 C2B Callback received:', JSON.stringify(req.body, null, 2));

        const { Body } = req.body;

        if (!Body) {
            return res.status(400).json({ error: 'Invalid callback' });
        }

        const {
            TransactionType,
            TransID,
            TransTime,
            TransAmount,
            BusinessShortCode,
            BillRefNumber,
            MSISDN,
            FirstName,
            LastName
        } = Body;

        // ✅ Save transaction to database
        await Transaction.create({
            user_id: null, // or link to a shop owner
            account_id: null,
            phone_number: MSISDN,
            amount: TransAmount,
            account_reference: BillRefNumber || TransID,
            mpesa_receipt_number: TransID,
            result_code: 0,
            result_description: 'Success',
            status: 'success'
        });

        // ✅ Always respond with 200 OK
        res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
    } catch (error) {
        console.error('C2B callback error:', error);
        res.status(200).json({ ResultCode: 1, ResultDesc: 'Failed' });
    }
}

module.exports = { handleC2BCallback };