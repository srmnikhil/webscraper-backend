const mongoose = require('mongoose');

// Define the schema for the results of the Selenium script
const trendSchema = new mongoose.Schema({
  trend1: {
    type: String,
    required: true,
  },
  trend2: {
    type: String,
    required: true,
  },
  trend3: {
    type: String,
    required: true,
  },
  trend4: {
    type: String,
    required: true,
  },
  trend5: {
    type: String,
    required: true,
  },
  dateTime: {
    type: Date,
    required: true,
    default: Date.now(), // Sets the end time as the current date and time
  },
  ipAddress: {
    type: String,
    required: true,
  }
});

// Create a model from the schema
const Trend = mongoose.model('Trend', trendSchema);

module.exports = Trend;
