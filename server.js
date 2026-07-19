require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { authenticate } = require('./src/middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files (for frontend)
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// =============================================
//  PUBLIC ROUTES (no authentication required)
// =============================================

// Auth routes (register, login)
app.use('/api/auth', require('./src/routes/authRoutes'));

// Callback routes (Safaricom STK Push callbacks)
app.use('/api', require('./src/routes/callbackRoutes'));

// ✅ C2B Callback route (Safaricom payment notifications)
app.use('/api', require('./src/routes/c2bRoutes'));

// =============================================
//  PROTECTED ROUTES (authentication required)
// =============================================

// Account management
app.use('/api', authenticate, require('./src/routes/accountRoutes'));

// Payment (STK Push)
app.use('/api', authenticate, require('./src/routes/paymentRoutes'));

// =============================================
//  START SERVER
// =============================================

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});