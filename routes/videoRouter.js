const express = require("express");
const { addVideo, updateVideo, deleteVideo, getByTag, sub, random, trend, addView, getVideo, search, getAllVideos } = require("../controllers/videoController");
const verifyToken = require("../verifyToken")

const VideoRouter = express.Router();


VideoRouter.get("/getAllVideos", getAllVideos);
VideoRouter.post("/addVideo", verifyToken, addVideo);
VideoRouter.put("/updateVideo/:id", verifyToken, updateVideo)
VideoRouter.delete("/deleteVide/:id", verifyToken, deleteVideo)
VideoRouter.get("/getVideo/:id", getVideo);
VideoRouter.put("/view/:id", addView)
VideoRouter.get("/trend", trend)
VideoRouter.get("/random", random)
VideoRouter.get("/sub", verifyToken, sub)
// VideoRouter.get("/getByTag", getByTag)
VideoRouter.post("/search", search);







module.exports = VideoRouter;

