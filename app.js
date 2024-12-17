const express = require("express")

const app = express();
const UserRouter = require("./routes/userRouter.js");
const ChannelRouter = require("./routes/channelRouter.js");
const CommentRouter = require("./routes/commentRouter.js");
const VideoRouter = require("./routes/videoRouter.js");


require("dotenv").config();
const connectDB = require("./connectDB.js");
const AuthRouter = require("./routes/authRouter.js");
connectDB();
app.use(express.json())




app.get("/", (req, res) => {
    res.send("Hello from backend")
})

app.use("/auth", AuthRouter);
app.use("/users/", UserRouter);
app.use("/channels/", ChannelRouter);
app.use("/comments/", CommentRouter);
app.use("/videos/", VideoRouter);

 

app.listen("3000", (req, res) => {
    console.log("listening on port 3000");
})