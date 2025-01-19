const { Comment } = require("../models/CommentModel");
const Video = require("../models/videoModel");

async function addComment(req, res) {
  console.log("someone is trying to add comment");
  console.log("req.body", req.body);
  try {
    const { videoId } = req.params;
    const userId = req.user._id;
    const { text } = req.body;
    console.log("text", text);

    if (!userId || !text) {
      return res
        .status(400)
        .json({ message: "User ID and comment text are required." });
    }

    const comment = new Comment({
      videoId,
      userId,
      text,
    });

    const savedComment = await comment.save();

    await Video.findByIdAndUpdate(videoId, {
      $push: { comments: savedComment._id },
    });

    res.status(201).json(savedComment);
    return;
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong while adding comment.");
    return;
  }
}

async function deleteComment(req, res) {
  const commentId = req.params.commentId;
  const userId = req.user._id; // userId via verifyToken

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    // Ensuring the user can only delete their own comments
    if (comment.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own comments." });
    }

    await Comment.findByIdAndDelete(commentId);

    // Update the associated video's comments array to remove the commentId
    await Video.findByIdAndUpdate(comment.videoId, {
      $pull: { comments: commentId },
    });

    res.status(200).json({ message: "Comment deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something weng wrong while deleting comment.");
  }
}

async function getComments(req, res) {
  const videoId = req.params.videoId;

  try {
    if (!videoId) {
      return res.status(400).json({ message: "Video ID is required." });
    }

    const comments = await Comment.find({ videoId })
      .populate("userId", "username avatar") // Populate the user's username and avatar
      .sort({ createdAt: -1 }); // Sort comments by the most recent

    res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("Something went wrong while fetching comments of a video");
  }
}

async function editComment(req, res) {
  const commentId = req.params.commentId;
  const userId = req.user._id; // userId via verifyToken
  const { text } = req.body;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    // Ensuring the user can only delete their own comments
    if (comment.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can edit only your own comments." });
    }

    // await Comment.findByIdAndUpdate(id: commentId, text: comment.text);
    await Comment.findByIdAndUpdate(commentId, { text: text });

    // Update the associated video's comments array to remove the commentId
    // await Video.findByIdAndUpdate(comment.videoId, {
    //   $pull: { comments: commentId },
    // });

    res.status(200).json({ message: "Comment updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong while deleting comment.");
  }
}

module.exports = { deleteComment, addComment, getComments, editComment };
