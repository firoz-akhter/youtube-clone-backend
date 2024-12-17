const express = require("express");
const { getUser, updateUser, deleteUser, subscribeChannel, unsubscribeChannel, likeVideo, dislikeVideo, getAllUser } = require("../controllers/userController");
const verifyToken = require("../verifyToken");


const UserRouter = express.Router();


UserRouter.get("/getAllUser", getAllUser);
UserRouter.get("/getuser/:id", getUser);
UserRouter.put("/updateuser/:id", verifyToken, updateUser); 
UserRouter.delete("/deleteuser/:id", verifyToken, deleteUser);
// subscribe user
UserRouter.put("/sub/:id", verifyToken, subscribeChannel);
// unsubscribe user
UserRouter.put("/unsub/:id", verifyToken, unsubscribeChannel);
UserRouter.put("/like/:videoId", verifyToken, likeVideo);
UserRouter.put("/dislike/:videoId", verifyToken, dislikeVideo);







module.exports = UserRouter;

