require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files (for frontend)
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Auth routes (public)
app.use('/api/auth', require('./src/routes/authRoutes'));

// Callback routes (public – for Safaricom)
app.use('/api', require('./src/routes/callbackRoutes'));

// Account routes (protected)
app.use('/api', require('./src/routes/accountRoutes'));

// Payment routes (protected)
app.use('/api', require('./src/routes/paymentRoutes'));

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});