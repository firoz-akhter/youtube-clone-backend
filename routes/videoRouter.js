const express = require("express");
const { addVideo, updateVideo, deleteVideo, getByTag, sub, random, trend, addView, getVideo, search, getAllVideos, likeVideo, dislikeVideo } = require("../controllers/videoController");
const verifyToken = require("../verifyToken")

const VideoRouter = express.Router();


VideoRouter.get("/getAllVideos", getAllVideos);
VideoRouter.post("/addVideo", verifyToken, addVideo);
VideoRouter.put("/updateVideo/:id", verifyToken, updateVideo)
VideoRouter.delete("/deleteVideo/:id", verifyToken, deleteVideo)
VideoRouter.get("/getVideo/:id", getVideo);
VideoRouter.put("/addView/:id", addView)
VideoRouter.get("/trend", trend)
VideoRouter.get("/random", random)
VideoRouter.get("/sub", verifyToken, sub)
// VideoRouter.get("/getByTag", getByTag)
VideoRouter.post("/search", search);

VideoRouter.put("/like/:videoId", verifyToken, likeVideo); // will move in video route 
VideoRouter.put("/dislike/:videoId", verifyToken, dislikeVideo);  // will move in video route







module.exports = VideoRouter;

