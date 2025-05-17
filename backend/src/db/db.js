// src/db/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Ensure process.env.MONGODB_URI is being correctly loaded from your .env file
    console.log("Attempting to connect to MongoDB with URI:", process.env.MONGODB_URI ? "URI Found" : "URI NOT FOUND in process.env"); // DEBUG
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI not found in environment variables. Make sure .env file is loaded.");
    }
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // It's good to see the original error object too for more details
    console.error("Full MongoDB connection error object:", error); 
    throw error; // Re-throw to be caught by startServer
  }
};

module.exports = connectDB;