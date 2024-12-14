const express = require("express");


const ChannelRouter = express.Router();


ChannelRouter.get("/singleChannel", (req, res) => {
    res.send("data of a single channel");
})



module.exports = ChannelRouter;