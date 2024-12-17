const express = require("express");
const { getUser, updateUser, deleteUser, subscribeChannel, unsubscribeChannel, likeVideo, dislikeVideo, getAllUser } = require("../controllers/userController");
const verifyToken = require("../verifyToken");


const UserRouter = express.Router();


UserRouter.get("/getAllUser", getAllUser);
UserRouter.get("/getuser/:id", getUser);
UserRouter.put("/updateuser/:id", verifyToken, updateUser); 
UserRouter.delete("/deleteuser/:id", verifyToken, deleteUser);
// subscribe or unsubscribe a channel
UserRouter.put("/subscribe/:id", verifyToken, subscribeChannel);









module.exports = UserRouter;

