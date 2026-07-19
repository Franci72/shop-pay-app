// ✅ PUBLIC routes (no auth)
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api', require('./src/routes/callbackRoutes'));

// ✅ PROTECTED routes (require auth)
app.use('/api', authenticate, require('./src/routes/accountRoutes'));
app.use('/api', authenticate, require('./src/routes/paymentRoutes'));