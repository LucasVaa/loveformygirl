const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  images: [{
    type: String,
    required: true
  }],
  date: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Memory', memorySchema); 