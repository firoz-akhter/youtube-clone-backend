const Video = require("../models/videoModel");
const Channel = require("../models/ChannelModel");
let User = require("../models/UserModel");

async function addVideo(req, res) {
  console.log("trying to add video");
  console.log(req.body);
  try {
    const { videoUrl, title, thumbnailUrl, description, channelId } = req.body;
    const uploader = req.user._id; // uploader/userId via verifyToken

    if (!videoUrl || !title || !thumbnailUrl || !description || !channelId) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if the channel exists and the user is the owner
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found." });
    }
    // console.log("channel.owner._id.toString", channel.owner._id.toString());
    // console.log("uploader", uploader);
    if (channel.owner._id.toString() !== uploader) {
      return res.status(403).json({
        message: "You are not authorized to add videos to this channel.",
      });
    }

    let newVideo = new Video({
      videoUrl,
      title,
      thumbnailUrl,
      description,
      channelId,
      uploader,
      channelName: channel.channelName,
    });
    await newVideo.save();

    channel.videos.push(newVideo._id);
    await channel.save();

    // newVideo = newVideo.toObject();
    // newVideo.channelName = channel.channelName;

    res
      .status(201)
      .json({ message: "Video added successfully!", video: newVideo });
  } catch (error) {
    console.error(error);
    res.status(500).send("Could not add video, something went wrong...");
  }
}

async function updateVideo(req, res) {
  try {
    const videoId = req.params.id;
    const userId = req.user._id; // userId coming from verify token(middleware)
    const { title, description, thumbnailUrl } = req.body;

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ message: "Video not found." });
    }

    // making sure the user is the uploader of the video
    console.log("video.uploader.toString", video.uploader.toString());
    console.log("userId", userId);
    if (video.uploader.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can update only your video." });
    }

    // Update the fields (only if provided in req.body)
    if (title) video.title = title;
    if (description) video.description = description;
    if (thumbnailUrl) video.thumbnailUrl = thumbnailUrl;

    await video.save();

    res.status(200).json({ message: "Video updated successfully!", video });
  } catch (error) {
    console.error(error);
    res.status(500).send("can't update, something went wrong.");
  }
}

async function deleteVideo(req, res) {
  try {
    const videoId = req.params.id;
    const userId = req.user._id;

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ message: "Video not found." });
    }

    // making sure owner and current user who is deleting is same
    const channel = await Channel.findById(video.channelId);

    if (!channel) {
      return res.status(404).json({ message: "Channel not found." });
    }

    // console.log("chanel.owner._id.toString()", channel.owner._id.toString());
    // console.log("userId", userId);

    if (channel.owner._id.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can delete only your video." });
    }

    await Video.findByIdAndDelete(videoId);

    // channel.videos = channel.videos.filter((vid) => vid.toString() !== videoId);
    // await channel.save();

    const updatedChannel = await Channel.findByIdAndUpdate(
      video.channelId,
      {
        $pull: { videos: videoId }, // Removes videoId from the videos array
      },
      { new: true } // Returns the updated document
    );

    if (!updatedChannel) {
      console.log("Channel not found.");
      return res.status(404).json({ message: "Channel not found..." });
    }

    res.status(200).send("Video deleted successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong while deleting");
  }
}

async function getVideo(req, res) {
  try {
    const videoId = req.params.id;

    const video = await Video.findById(videoId)
      .populate({
        path: "channelId",
        select:
          "channelName description channelBanner subscriberCount subscribedUsers", //
      })
      .populate({
        path: "comments",
        select: "text userId timestamp", //
        populate: { path: "userId", select: "username avatar" },
      });

    if (!video) {
      return res.status(404).json({ message: "Video not found." });
    }

    res.status(200).json({
      video,
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
  } catch (err) {
    res.status(500).send("Something went wrong while fetching all videos");
  }
}

async function addView(req, res) {
  try {
    const videoId = req.params.id;

    // Increment the views
    const video = await Video.findByIdAndUpdate(
      videoId,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!video) {
      return res.status(404).send("Video not found.");
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
    res.status(500).send("Could not increment view, something went wrong.");
  }
}

async function random(req, res) {
  try {
    const randomVideos = await Video.aggregate([
      { $sample: { size: 10 } }, // seleting 10 videos
    ]);

    if (randomVideos.length === 0) {
      return res.status(404).send("No videos found.");
    }

    res.status(200).json({
      message: "Random videos fetched successfully.",
      videos: randomVideos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Some error occured while fetching randomly.");
  }
}

async function trend(req, res) {
  try {
    const trendingVideos = await Video.find().sort({ views: -1 }).limit(10);

    if (trendingVideos.length === 0) {
      return res.status(404).send("No videos found.");
    }

    res.status(200).json({
      message: "Trending videos fetched successfully.",
      videos: trendingVideos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("some error.");
  }
}

async function sub(req, res) {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate("subscribedChannels");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.subscribedChannels.length === 0) {
      return res.status(404).json({ message: "No subscribed channels found." });
    }

    // Fetch videos from all subscribed channels
    const videos = await Video.find({
      channelId: { $in: user.subscribedChannels },
    })
      .sort({ createdAt: -1 })
      .limit(50);

    if (videos.length === 0) {
      return res.status(404).send("No videos found in subscribed channels.");
    }

    res.status(200).json({
      message: "Videos from subscribed channels fetched successfully.",
      videos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error.");
  }
}

async function getByTag(req, res) {
  let tags = req.query.tags.split(",");
  try {
    const videos = await Video.find({ tags: { $in: tags } }).limit(20);
    res.status(200).json(videos);
    return;
  } catch (err) {
    res.status(500).send("Something went wrong");
  }
}

async function search(req, res) {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const videos = await Video.find({
      $or: [
        { title: new RegExp(query, "i") }, // Case-insensitive
        { description: new RegExp(query, "i") },
        { tags: { $in: [query] } },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json(videos);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
}

async function likeVideo(req, res) {
  try {
    const { videoId } = req.params;
    const userId = req.user._id; //  via verified token middleware

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // what if the user has already liked the video
    if (video.likes.includes(userId)) {
      return res.status(400).send("You have already liked this video");
    }

    // remove the user from dislike array, add to like array
    video.likes.push(userId);
    video.dislikes = video.dislikes.filter((id) => id !== userId);

    await video.save();

    res.status(200).json({
      message: "Video liked successfully",
      likes: video.likes.length,
      dislikes: video.dislikes.length,
    });
  } catch (error) {
    console.error("Error liking the video:", error);
    res.status(500).send("Server error while liking the video");
  }
}

async function dislikeVideo(req, res) {
  try {
    const { videoId } = req.params;
    const userId = req.user._id;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    if (video.dislikes.includes(userId)) {
      return res
        .status(400)
        .json({ message: "You have already disliked this video" });
    }

    // remove user from liked array, add user to dislike array
    video.dislikes.push(userId);
    video.likes = video.likes.filter((id) => id !== userId);

    await video.save();

    res.status(200).json({
      message: "Video disliked successfully",
      likes: video.likes.length,
      dislikes: video.dislikes.length,
    });
  } catch (error) {
    console.error("Error disliking the video:", error);
    res.status(500).send("Server error while disliking the video");
  }
}

module.exports = {
  likeVideo,
  dislikeVideo,
  getAllVideos,
  addVideo,
  updateVideo,
  deleteVideo,
  getVideo,
  addView,
  random,
  trend,
  sub,
  getByTag,
  search,
};
