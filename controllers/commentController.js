const { Comment } = require("../models/CommentModel");
const Video = require("../models/videoModel");



async function addComment(req, res) {
  try {
    const { videoId } = req.params;
    const userId = req.user._id;
    const { text } = req.body;

    // Validate input
    if (!userId || !text) {
      return res.status(400).json({ message: "User ID and comment text are required." });
    }

    // Create a new comment object
    const comment = new Comment({
      videoId,
      userId,
      text,
    });

    // Save the comment to the database
    const savedComment = await comment.save();

    // Update the video document to include the comment ID
    await Video.findByIdAndUpdate(videoId, {
      $push: { comments: savedComment._id },
    });

    res.status(201).json(savedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
}

async function deleteComment(req, res) {
  const commentId = req.params.commentId;
  const userId = req.user._id; // Assuming `verifyToken` adds the authenticated user's ID to `req.user`

  try {
    // Fetch the comment to ensure it exists and get its videoId
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    // Ensure the user can only delete their own comments
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ message: "You can only delete your own comments." });
    }

    // Remove the comment from the database
    await Comment.findByIdAndDelete(commentId);

    // Update the associated video's comments array to remove the commentId
    await Video.findByIdAndUpdate(comment.videoId, {
      $pull: { comments: commentId },
    });

    res.status(200).json({ message: "Comment deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
}

async function getComments(req, res) {
  const videoId = req.params.videoId;

  try {
    // Validate input
    if (!videoId) {
      return res.status(400).json({ message: "Video ID is required." });
    }

    // Fetch comments for the specified video
    const comments = await Comment.find({ videoId })
      .populate("userId", "username avatar") // Populate the user's username and avatar
      .sort({ createdAt: -1 }); // Sort comments by the most recent

    res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
}

module.exports = { deleteComment, addComment, getComments }