const Video = require("../models/videoModel");
let User = require("../models/UserModel");


async function addVideo(req, res) {
    let newVideo = new Video({ userId: req.user.id, ...req.body });
    // console.log(newVideo)
    try {
        const savedVideo = await newVideo.save();
        console.log("video saved")
        res.status(200).json(savedVideo);
    }
    catch (err) {
        res.status(500).send("something went wrong while saving video.")
    }

}

async function updateVideo(req, res) {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) {
            res.status(404).json({
                success: false,
                msg: "Video not found."
            })
            return;
        }
        if (req.user.id !== video.userId) {
            return res.status(403).send("You can update only your video")
        }
        let updatedVideo = await Video.findByIdAndUpdate(req.params.id, {
            $set: req.body,
        },
            { new: true })
        return res.status(200).json(updatedVideo)
    }
    catch (err) {
        res.status(500).send("Something went wrong while updating video.")
    }
}

async function deleteVideo(req, res) {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) {
            res.status(404).json({
                success: false,
                msg: "Video not found."
            })
            return;
        }
        if (req.user.id !== video.userId) {
            return res.status(403).send("You can delete only your video")
        }
        await Video.findByIdAndDelete(req.params.id)
        return res.status(200).send("Video deleted successfully.")
    }
    catch (err) {
        res.status(500).send("Something went wrong while updating video.")
    }
}

async function getVideo(req, res) {
    try {
        let video = await Video.findById(req.params.id);
        res.status(200).json(video);
    }
    catch (err) {
        res.status(500).send("Something went wrong while finding video");
    }
}

async function getAllVideos(req, res) {
    try {
        let video = await Video.find({});
        res.status(200).json(video);
    }
    catch (err) {
        res.status(500).send("Something went wrong while fetching all videos")
    }
}

async function addView(req, res) {
    
    try {
        await Video.findByIdAndUpdate(req.params.id, {
            $inc: { views: 1 },
        });
        res.status(200).json("The view has been increased.");
        return;
    } catch (err) {
        res.status(500).send("something went wrong while updating video view")
    }
}

async function random(req, res) {
    try {
        const videos = await Video.aggregate([{ $sample: { size: 40 } }]);
        res.status(200).json(videos);
    } catch (err) {
        res.status(500).send("Something went wrong while fetching videos")
    }
}

async function trend(req, res) {
    try {
        let videos = await Video.find().sort({ view: -1 });
        res.status(200).json(videos);
    }
    catch (err) {
        res.status(500).send("Something went wrong")
    }
}


async function sub(req, res) {
    let id = req.body.id;
    try {
        const user = await User.findById(id);
        const subscribedChannels = user.subscribedUsers;

        const list = await Promise.all(
            subscribedChannels.map(async (channelId) => {
                return await Video.find({ userId: channelId });
            })
        );

        res.status(200).json(list.flat().sort((a, b) => b.createdAt - a.createdAt));
        return;
    }
    catch (err) {
        res.status(500).send("Something went wrong")
    }
}

async function getByTag(req, res) {
    let tags = req.query.tags.split(",")
    try {
        const videos = await Video.find({ tags: { $in: tags } }).limit(20);
        res.status(200).json(videos);
        return;
    }
    catch (err) {
        res.status(500).send("Something went wrong");
    }
}

async function search(req, res) {
    let query = req.body.query;
    try {
        let videos = await Video.find({
            title: { $regex: query, $options: "i" },
        }).limit(40);
        res.status(200).json(videos);
        return ;
    }
    catch (err) {
        res.status(500).send("Something went wrong while searching")
    }
}


module.exports = { getAllVideos, addVideo, updateVideo, deleteVideo, getVideo, addView, random, trend, sub, getByTag, search }