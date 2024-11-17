const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
  title: String,
  date: Date,
  description: String,
  tags: [String],
  images: [{
    _id: mongoose.Schema.Types.ObjectId,
    originalPath: String,
    thumbnailPath: String,
    contentType: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Memory', memorySchema); 