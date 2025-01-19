const express = require("express")
const cors = require('cors');

const app = express(); 

app.use(cors({
    origin: 'http://localhost:5173', // Frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // Include cookies if needed
}));


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

app.use("/", AuthRouter);
app.use("/", UserRouter);
app.use("/", ChannelRouter);
app.use("/", CommentRouter);
app.use("/", VideoRouter);

 

app.listen("3001", (req, res) => {
    console.log("listening on port 3000");
})