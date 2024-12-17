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
        return;
    }
    catch (err) {
        res.status(500).send("Something went wrong while searching")
    }
}

async function likeVideo(req, res) {
    try {
        const { videoId } = req.params;
        const userId = req.user.id; // Extract user ID from the verified token

        // Find the video by ID
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ message: "Video not found" });
        }

        // Check if the user has already liked the video
        if (video.likes.includes(userId)) {
            return res.status(400).json({ message: "You have already liked this video" });
        }

        // Add the user ID to the likes array and remove it from dislikes if present
        video.likes.push(userId);
        video.dislikes = video.dislikes.filter((id) => id !== userId);

        // Save the updated video
        await video.save();

        res.status(200).json({
            message: "Video liked successfully",
            likes: video.likes.length,
            dislikes: video.dislikes.length,
        });
    } catch (error) {
        console.error("Error liking the video:", error);
        res.status(500).json({ message: "Server error while liking the video" });
    }
}

async function dislikeVideo(req, res) {
    try {
        const { videoId } = req.params;
        const userId = req.user.id; // Extract user ID from the verified token

        // Find the video by ID
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ message: "Video not found" });
        }

        // Check if the user has already disliked the video
        if (video.dislikes.includes(userId)) {
            return res.status(400).json({ message: "You have already disliked this video" });
        }

        // Add the user ID to the dislikes array and remove it from likes if present
        video.dislikes.push(userId);
        video.likes = video.likes.filter((id) => id !== userId);

        // Save the updated video
        await video.save();

        res.status(200).json({
            message: "Video disliked successfully",
            likes: video.likes.length,
            dislikes: video.dislikes.length,
        });
    } catch (error) {
        console.error("Error disliking the video:", error);
        res.status(500).json({ message: "Server error while disliking the video" });
    }
}


module.exports = { likeVideo, dislikeVideo, getAllVideos, addVideo, updateVideo, deleteVideo, getVideo, addView, random, trend, sub, getByTag, search }