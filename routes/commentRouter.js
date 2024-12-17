const express = require("express");
const verifyToken = require("../verifyToken.js");
const { addComment, deleteComment, getComments } = require("../controllers/commentController.js");


const CommentRouter = express.Router();


CommentRouter.get("/getComments/:videoId", getComments );
CommentRouter.post("/addComment", verifyToken, addComment);
CommentRouter.delete("/deleteComment/:commentId", verifyToken, deleteComment);



module.exports = CommentRouter;