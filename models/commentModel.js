const mongoose = require("mongoose")


// Define the Comment Schema
const commentSchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Video'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Optional: specify the model name for referencing
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  }
});


const Comment = mongoose.model("Comment", commentSchema);

module.exports = { Comment, commentSchema };