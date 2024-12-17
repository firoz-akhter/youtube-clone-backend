const express = require("express");
const verifyToken = require("../verifyToken");
const { addChannel, getChannelAdmin, getChannel, updateChannel, deleteChannel, getChannelVideos, getAllChannel } = require("../controllers/channelController");


const ChannelRouter = express.Router();


// write router for crud
ChannelRouter.post("/addChannel/:userId", verifyToken, addChannel)

ChannelRouter.get("/getChannelAdmin/:id", verifyToken, getChannelAdmin) // provide full details

ChannelRouter.get("/getChannel/:id", getChannel) // we'll provide only few details

ChannelRouter.put("/updateChannel/:id", verifyToken, updateChannel);
ChannelRouter.delete("/deleteChannel/:id", verifyToken, deleteChannel);
ChannelRouter.get("/getChannelVideos/:id", getChannelVideos);
ChannelRouter.get("/getAllChannel", getAllChannel); // we'll provide only few details related to channel, {exclude subscribedUser array}


module.exports = ChannelRouter;