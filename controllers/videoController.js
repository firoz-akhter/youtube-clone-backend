const Video = require("../models/videoModel");
const Channel = require("../models/ChannelModel")
let User = require("../models/UserModel");


async function addVideo(req, res) {
    try {
        const { videoUrl, title, thumbnailUrl, description, channelId } = req.body;
        const uploader = req.user._id; // Assuming `verifyToken` middleware sets `req.user`

        // Validate required fields
        if (!videoUrl || !title || !thumbnailUrl || !description || !channelId) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Check if the channel exists and the user is the owner
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ message: "Channel not found." });
        }
        console.log("channel.owner._id.toString", channel.owner._id.toString());
        console.log("uploader", uploader);
        if (channel.owner._id.toString() !== uploader) {
            return res.status(403).json({ message: "You are not authorized to add videos to this channel." });
        }

        // Create and save the new video
        const newVideo = new Video({
            videoUrl,
            title,
            thumbnailUrl,
            description,
            channelId,
            uploader,
        });
        await newVideo.save();

        // Add the video to the channel's video list
        channel.videos.push(newVideo._id);
        await channel.save();

        res.status(201).json({ message: "Video added successfully!", video: newVideo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }

}

async function updateVideo(req, res) {
    try {
        const videoId = req.params.id;
        const userId = req.user._id; // Assuming `verifyToken` middleware sets `req.user`
        const { title, description, thumbnailUrl } = req.body;

        // Fetch the video from the database
        const video = await Video.findById(videoId);

        if (!video) {
            return res.status(404).json({ message: "Video not found." });
        }

        // Ensure the user is the uploader of the video
        console.log("video.uploader.toString", video.uploader.toString());
        console.log("userId", userId);
        if (video.uploader.toString() !== userId) {
            return res.status(403).json({ message: "You are not authorized to update this video." });
        }

        // Update the fields (only if provided in req.body)
        if (title) video.title = title;
        if (description) video.description = description;
        if (thumbnailUrl) video.thumbnailUrl = thumbnailUrl;

        // Save the updated video
        await video.save();

        res.status(200).json({ message: "Video updated successfully!", video });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
}

async function deleteVideo(req, res) {
    try {
        const videoId = req.params.id;
        const userId = req.user._id; // Assuming `verifyToken` middleware sets `req.user`

        // Fetch the video to be deleted
        const video = await Video.findById(videoId);

        if (!video) {
            return res.status(404).json({ message: "Video not found." });
        }

        // Check if the user is the owner of the channel that uploaded the video
        const channel = await Channel.findById(video.channelId);

        if (!channel) {
            return res.status(404).json({ message: "Channel not found." });
        }

        console.log("chanel.owner._id.toString()", channel.owner._id.toString());
        console.log("userId", userId);

        if (channel.owner._id.toString() !== userId) {
            return res.status(403).json({ message: "You are not authorized to delete this video." });
        }

        // Delete the video
        await Video.findByIdAndDelete(videoId);

        // Remove the video ID from the channel's videos array
        channel.videos = channel.videos.filter((vid) => vid.toString() !== videoId);
        await channel.save();

        res.status(200).json({ message: "Video deleted successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
}

async function getVideo(req, res) {
    try {
        const videoId = req.params.id;

        // Fetch the video by ID and populate references
        const video = await Video.findById(videoId)
            .populate({
                path: "channelId",
                select: "channelName description channelBanner", // Include only selected fields from the channel
            })
            .populate({
                path: "comments",
                select: "text userId timestamp", // Include only selected fields from comments
                populate: { path: "userId", select: "username avatar" }, // Include user details in comments
            });

        if (!video) {
            return res.status(404).json({ message: "Video not found." });
        }

        res.status(200).json({
            video
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
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
        const videoId = req.params.id;

        // Increment the views count for the video
        const video = await Video.findByIdAndUpdate(
            videoId,
            { $inc: { views: 1 } }, // Increment the `views` field by 1
            { new: true } // Return the updated document
        );

        if (!video) {
            return res.status(404).json({ message: "Video not found." });
        }

        res.status(200).json({
            message: "View count updated successfully.",
            video: {
                id: video._id,
                views: video.views,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
}

async function random(req, res) {
    try {
        // Fetch a random set of videos
        const randomVideos = await Video.aggregate([
            { $sample: { size: 10 } } // Randomly select 10 videos (adjustable)
        ]);

        if (randomVideos.length === 0) {
            return res.status(404).json({ message: "No videos found." });
        }

        res.status(200).json({
            message: "Random videos fetched successfully.",
            videos: randomVideos,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
}

async function trend(req, res) {
    try {
        // Fetch videos sorted by views in descending order (trending videos)
        const trendingVideos = await Video.find()
            .sort({ views: -1 }) // Sort by `views` in descending order
            .limit(10); // Limit to top 10 videos (optional)

        if (trendingVideos.length === 0) {
            return res.status(404).json({ message: "No videos found." });
        }

        res.status(200).json({
            message: "Trending videos fetched successfully.",
            videos: trendingVideos,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
}


async function sub(req, res) {
    try {
        // Get the user ID from the verified token (added by verifyToken middleware)
        const userId = req.user._id;

        // Find the user and fetch their subscribed channels
        const user = await User.findById(userId).populate("subscribedChannels");

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (user.subscribedChannels.length === 0) {
            return res.status(404).json({ message: "No subscribed channels found." });
        }

        // Fetch videos from all subscribed channels
        const videos = await Video.find({ channelId: { $in: user.subscribedChannels } })
            .sort({ createdAt: -1 }) // Sort videos by most recent
            .limit(50); // Optional: limit the number of videos returned

        if (videos.length === 0) {
            return res.status(404).json({ message: "No videos found in subscribed channels." });
        }

        res.status(200).json({
            message: "Videos from subscribed channels fetched successfully.",
            videos,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
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
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        // Perform a text search on video title, description, or any other searchable fields
        const videos = await Video.find({
            $or: [
                { title: new RegExp(query, "i") }, // Case-insensitive search for title
                { description: new RegExp(query, "i") }, // Case-insensitive search for description
                { tags: { $in: [query] } }, // Search in tags array if tags are used
            ],
        }).sort({ createdAt: -1 }); // Sort results by most recent

        res.status(200).json(videos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function likeVideo(req, res) {
    try {
        const { videoId } = req.params;
        const userId = req.user._id; // Extract user ID from the verified token

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
        const userId = req.user._id; // Extract user ID from the verified token

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