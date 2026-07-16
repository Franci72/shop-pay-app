const axios = require('axios');

async function getAccessToken(consumerKey, consumerSecret) {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const url = process.env.SANDBOX_URL + '/oauth/v1/generate?grant_type=client_credentials';
    
    try {
        const response = await axios.get(url, {
            headers: { Authorization: `Basic ${auth}` }
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting access token:', error.response?.data || error.message);
        throw new Error('Failed to get access token');
    }
}

async function stkPush(consumerKey, consumerSecret, passkey, businessShortCode, amount, phoneNumber, accountReference, callbackUrl) {
    try {
        const accessToken = await getAccessToken(consumerKey, consumerSecret);
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
        const password = Buffer.from(`${businessShortCode}${passkey}${timestamp}`).toString('base64');

        const payload = {
            BusinessShortCode: businessShortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: amount,
            PartyA: phoneNumber,
            PartyB: businessShortCode,
            PhoneNumber: phoneNumber,
            CallBackURL: callbackUrl || 'https://your-app.com/callback',
            AccountReference: accountReference || 'INV-' + Date.now(),
            TransactionDesc: 'Payment for goods'
        };

        const url = process.env.SANDBOX_URL + '/mpesa/stkpush/v1/processrequest';
        const response = await axios.post(url, payload, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        return response.data;
    } catch (error) {
        console.error('STK Push error:', error.response?.data || error.message);
        throw new Error('STK Push failed');
    }
}

module.exports = { getAccessToken, stkPush };