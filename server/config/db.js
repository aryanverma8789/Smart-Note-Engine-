/**
 * config/db.js
 * ------------
 * Establishes a connection to MongoDB using Mongoose.
 * Reads the connection URI from the MONGO_URI environment variable.
 * Logs success or exits the process on failure so the server never
 * runs in a broken state.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1); // Exit with failure — server cannot function without DB
  }
};

module.exports = connectDB;
