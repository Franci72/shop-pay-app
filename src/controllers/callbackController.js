const Transaction = require('../models/Transaction');

async function handleCallback(req, res) {
    try {
        console.log('📩 Callback received from Safaricom:', JSON.stringify(req.body, null, 2));

        const { Body } = req.body;

        if (!Body || !Body.stkCallback) {
            console.error('❌ Invalid callback structure');
            return res.status(400).json({ error: 'Invalid callback' });
        }

        const stkCallback = Body.stkCallback;

        const {
            MerchantRequestID,
            CheckoutRequestID,
            ResultCode,
            ResultDesc,
            CallbackMetadata
        } = stkCallback;

        // Prepare update data
        const updateData = {
            merchant_request_id: MerchantRequestID,
            checkout_request_id: CheckoutRequestID,
            result_code: ResultCode,
            result_description: ResultDesc
        };

        // If successful (ResultCode === 0), extract the receipt number
        if (ResultCode === 0 && CallbackMetadata && CallbackMetadata.Item) {
            const receiptItem = CallbackMetadata.Item.find(item => item.Name === 'MpesaReceiptNumber');
            if (receiptItem) {
                updateData.mpesa_receipt_number = receiptItem.Value;
            }
            updateData.status = 'success';
        } else {
            updateData.status = 'failed';
        }

        // Update the transaction in the database
        const updated = await Transaction.updateByCheckoutRequestId(CheckoutRequestID, updateData);

        if (updated) {
            console.log(`✅ Transaction ${CheckoutRequestID} updated. Status: ${updateData.status}`);
        } else {
            console.warn(`⚠️ Transaction ${CheckoutRequestID} not found in database.`);
        }

        // Always respond with 200 OK to acknowledge receipt
        res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });

    } catch (error) {
        console.error('❌ Callback processing error:', error);
        // Still return 200 to prevent Safaricom from retrying
        res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
    }
}

module.exports = { handleCallback };