require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { authenticate } = require('./src/middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// PUBLIC routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api', require('./src/routes/callbackRoutes'));

// PROTECTED routes
app.use('/api', authenticate, require('./src/routes/accountRoutes'));
app.use('/api', authenticate, require('./src/routes/paymentRoutes'));

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});