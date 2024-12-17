const mongoose = require('mongoose');
const {commentSchema} = require("./CommentModel.js")


// Define the Video Schema
const videoSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  thumbnailUrl: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  channelId: {
    type: String,
    required: true
  },
  uploader: {
    type: String,
    required: true
  },
  views: {
    type: Number,
    default: 0,
  },
  likes: {
    type: [String],
    default: [],
  },
  dislikes: {
    type: [String],
    default: [],
  },
  uploadDate: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  comments: {
    type: [{commentSchema}], // Array of comments
    default: []
  }
}, {
  timestamps: true
});

 
const Video = mongoose.model('Video', videoSchema);

module.exports = Video;
