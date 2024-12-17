const { Comment } = require("../models/CommentModel");
const Video = require("../models/videoModel");



async function addComment(req, res) {
  const {videoId, userId, text} = req.body
  const newComment = new Comment({ videoId, userId, text });
  try {
    const savedComment = await newComment.save();
    res.status(200).json(savedComment);
  } catch (err) {
    res.status(500).send("something went wrong while adding comment.")
  }
}

async function deleteComment(req, res) {
  try {
    const comment = await Comment.findById(res.params.id);
    const video = await Video.findById(res.params.id);
    if (req.user.id === comment.userId || req.user.id === video.userId) {
      await Comment.findByIdAndDelete(req.params.id);
      res.status(200).json("The comment has been deleted.");
      return;
    } else {
      res.status(403).send("You can't delete others video")
      return;
    }
  } catch (err) {
    res.status(500).send("Something went wrong while deleting video")
  }
}

async function getComments(req, res) {
  let videoId = req.params.videoId;
  if(!videoId) {
    res.send("VideoId is missing");
    return ;
  }
  try {
    console.log("finding comments for a video")
    const comments = await Comment.find({ videoId: req.params.videoId });
    console.log("comments", comments);
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).send("Something went wrong while fetching comments of a single video")
  }
}

module.exports = {deleteComment, addComment, getComments}