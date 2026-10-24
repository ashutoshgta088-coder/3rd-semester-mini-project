const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stuatten';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Fail fast if MongoDB is not available
      socketTimeoutMS: 10000
    });
    console.log(`✅ MongoDB connected: ${MONGODB_URI}`);
    return true;
  } catch (err) {
    console.warn(`⚠️  MongoDB connection failed: ${err.message}`);
    console.warn('🔄 Running in OFFLINE/DEMO MODE — using in-memory fallback store.');
    console.warn('   To enable MongoDB, install it at https://www.mongodb.com/try/download/community');
    return false;
  }
};

module.exports = connectDB;
