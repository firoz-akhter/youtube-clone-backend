const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({

  channelName: {
    type: String,
    required: true,
    trim: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  channelBanner: {
    type: String, // URL for the banner
    required: true,
    validate: {
      validator: function (url) {
        return /^(https?:\/\/)[^\s]+$/.test(url); // Validate URL format
      },
      message: "Invalid URL for channel banner.",
    },
  },
  subscribedUsers: {
    type: [mongoose.Schema.Types.ObjectId], // channel pe kitne subscribers hai
    default: [],
    ref: "User",
  }, 
  subscriberCount: {
    type: Number,
    default: 0,
  },
  videos: {
    type: [mongoose.Schema.Types.ObjectId], // videos on this channel
    ref: "Video",
    default: [],
  },
}, {
  timestamps: true,
});


const Channel = mongoose.models.Channel || mongoose.model('Channel', channelSchema);

module.exports = Channel;
