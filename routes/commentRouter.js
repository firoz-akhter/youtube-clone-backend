const express = require("express");


const CommentRouter = express.Router();


CommentRouter.get("/singleComment", (req, res) => {
    res.send("data of a single comment");
})



module.exports = CommentRouter;