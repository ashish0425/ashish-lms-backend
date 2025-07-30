// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log('Connection URI:', process.env.MONGODB_URI ? 'URI found ✅' : 'URI missing ❌');
    
    // Removed deprecated options: useNewUrlParser and useUnifiedTopology
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ MongoDB Connected Successfully!');
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔗 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Not Connected'}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:');
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

// Function to check connection status
const checkConnection = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };
  
  console.log(`📊 MongoDB Status: ${states[state]}`);
  return state === 1;
};

module.exports = { connectDB, checkConnection };