const { Comment } = require("../models/CommentModel");
const Video = require("../models/videoModel");



async function addComment(req, res) {
  try {
    const { videoId, text } = req.body;
    const userId = req.user.id; // Assumes user is already authenticated and user ID is available via `req.user.id`

    if (!text || !videoId) {
      return res.status(400).json({ message: "Video ID and comment text are required." });
    }

    // Create a new comment
    const comment = new Comment({
      videoId,
      userId,
      text,
    });

    // Save the comment to the database
    await comment.save();

    // Add this comment to the video's comments array
    await Video.findByIdAndUpdate(videoId, {
      $push: { comments: comment._id },
    });

    res.status(201).json({ message: "Comment added successfully", comment });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Server error while adding comment" });
  }
}

async function deleteComment(req, res) {
  try {
    const commentId = req.params.commentId;
    const userId = req.user.id; // Assuming `verifyToken` middleware sets the user ID in `req.user`

    // Find the comment to be deleted
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    // Check if the user is the owner of the comment
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ message: "You are not authorized to delete this comment." });
    }

    // Remove the comment from the database
    await Comment.findByIdAndRemove(commentId);

    // Also remove the comment from the video's comments array
    await Video.findByIdAndUpdate(comment.videoId, {
      $pull: { comments: commentId },
    });

    res.status(200).json({ message: "Comment deleted successfully." });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Server error while deleting comment." });
  }
}

async function getComments(req, res) {
  try {
    const { videoId } = req.params;

    // Find comments associated with the video ID
    const comments = await Comment.find({ videoId }).populate("userId", "username avatar");

    if (!comments.length) {
      return res.status(404).json({ message: "No comments found for this video" });
    }

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Server error while fetching comments" });
  }
}

module.exports = { deleteComment, addComment, getComments }