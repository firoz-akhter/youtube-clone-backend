const express = require("express");
const verifyToken = require("../verifyToken.js");
const {
  addComment,
  deleteComment,
  getComments,
  editComment,
} = require("../controllers/commentController.js");

const CommentRouter = express.Router();

CommentRouter.get("/getComments/:videoId", getComments);
CommentRouter.post("/addComment/:videoId", verifyToken, addComment);
CommentRouter.delete("/deleteComment/:commentId", verifyToken, deleteComment);
CommentRouter.put("/editComment/:commentId", verifyToken, editComment);

module.exports = CommentRouter;
