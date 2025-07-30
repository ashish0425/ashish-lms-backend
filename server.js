const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB, checkConnection } = require('./config/db');

const app = express();

// Connect to database
connectDB();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});

app.use(limiter);
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);

// Health check with database status
app.get('/api/health', (req, res) => {
  const isDBConnected = checkConnection();
  res.json({ 
    message: 'LMS API is running!', 
    timestamp: new Date(),
    database: isDBConnected ? 'Connected ✅' : 'Disconnected ❌',
    environment: process.env.NODE_ENV
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API routes are working!' });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 LMS API ready at http://localhost:${PORT}`);
  console.log(`🔍 Test endpoints:`);
  console.log(`   - Health: http://localhost:${PORT}/api/health`);
  console.log(`   - Test: http://localhost:${PORT}/api/test`);
  console.log(`   - Courses: http://localhost:${PORT}/api/courses`);
});