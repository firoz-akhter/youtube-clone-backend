const express = require("express");
const { getUser, updateUser, deleteUser, subscribeChannel, unsubscribeChannel, likeVideo, dislikeVideo, getAllUser } = require("../controllers/userController");
const verifyToken = require("../verifyToken");


const UserRouter = express.Router();


UserRouter.get("/getAllUser", getAllUser);
UserRouter.get("/getUser/:id", getUser);
UserRouter.put("/updateUser/:id", verifyToken, updateUser); 
UserRouter.delete("/deleteuser/:id", verifyToken, deleteUser);

// subscribe or unsubscribe a channel
// we moved subscribe or unsubscribe a channel to channelRoutes








module.exports = UserRouter;

