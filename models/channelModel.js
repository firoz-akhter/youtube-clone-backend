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
    type: String, 
    // required: true,
  },
  subscribedUsers: {
    type: [mongoose.Schema.Types.ObjectId], 
    default: [],
    ref: "User",
  }, 
  subscriberCount: {
    type: Number,
    default: 0,
  },
  videos: {
    type: [mongoose.Schema.Types.ObjectId], 
    ref: "Video",
    default: [],
  },
}, {
  timestamps: true,
});


const Channel = mongoose.models.Channel || mongoose.model('Channel', channelSchema);

module.exports = Channel;
