const express = require("express");
const { getVideo } = require("../controllers/videoController");


const VideoRouter = express.Router();


VideoRouter.get("/singleVideo", getVideo)






module.exports = VideoRouter;

