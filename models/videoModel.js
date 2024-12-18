const mongoose = require('mongoose');


// Define the Video Schema
const videoSchema = new mongoose.Schema({
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
    type: mongoose.Schema.Types.ObjectId,
    ref: "Channel",
    required: true,
  },
  uploader: {
    type: String,
    required: true,
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
    type: [mongoose.Schema.Types.ObjectId], // Array of comments
    ref: "Comment",
    default: []
  }
}, {
  timestamps: true
});


const Video = mongoose.model('Video', videoSchema);

module.exports = Video;
