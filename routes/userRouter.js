const express = require("express");


const UserRouter = express.Router();


UserRouter.get("/singleUser", (req, res) => {
    res.send("data of a single user");
})






module.exports = UserRouter;

