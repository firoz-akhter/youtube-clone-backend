const User = require("../models/UserModel");
const Channel = require("../models/ChannelModel");
const Video = require("../models/videoModel");

async function addChannel(req, res) {
  const userId = req.user._id;
  // console.log(userId); return ;
  const { channelName, description, channelBanner } = req.body;

  try {
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create the new channel
    const newChannel = new Channel({
      channelName,
      description,
      channelBanner,
      owner: userId,
    });

    // saving channel to database
    const savedChannel = await newChannel.save();

    // Add the channel to the user's owned channels
    user.channels.push(savedChannel._id);
    await user.save();

    res.status(201).json({
      message: "Channel created successfully",
      channel: savedChannel,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while creating channel" });
  }
}

const getUserChannels = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find the user by ID and populate the channel references
    const user = await User.findById(userId).populate("channels"); // Populates the channels owned by the user
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the user's channels
    res.status(200).json({
      ownedChannels: user.channels,
    });
  } catch (error) {
    console.error("Error fetching user channels:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

async function getChannelAdmin(req, res) {
  let userId = req.user._id;
  const { id } = req.params; // Channel ID

  try {
    // Fetch the channel with all details
    const channel = await Channel.findById(id)
      .populate("owner", "username email avatar")
      .populate("subscribedUsers", "username email avatar")
      .populate({
        path: "videos",
        select: "title description views likes thumbnailUrl", //
      });

    // If no channel is found, return an error
    if (!channel) {
      return res.status(404).send("channel not found");
    }

    // Check if the current user is the owner of the channel
    // console.log("userId", userId);
    // console.log("channel.owner._id.toString()", channel.owner.id);
    if (channel.owner.id !== userId) {
      return res.status(403).send("This is not your channel");
    }

    // Return the channel details
    res.status(200).json({
      message: "Channel fetched successfully",
      channel,
    });
  } catch (error) {
    console.error("Error fetching channel:", error);
    res.status(500).send("Error while fetching channel");
  }
}

async function getChannel(req, res) {
  const { id } = req.params; // Channel ID

  try {
    // Fetch the channel, excluding the subscribedUsers field
    const channel = await Channel.findById(id)
      .select("-subscribedUsers") // excluding subscribers
      .populate("owner", "username email avatar") // populating owner
      .populate({
        path: "videos",
        select: "title views thumbnailUrl", // Include only relevant fields for videos
      });

    if (!channel) {
      return res.status(404).send("channel not found");
    }

    res.status(200).json({
      message: "Channel fetched successfully",
      channel,
    });
  } catch (error) {
    console.error("Error fetching channel:", error);
    res.status(500).send("Something went wrong while fetching channel");
  }
}

async function updateChannel(req, res) {
  const { id } = req.params; // Channel ID
  const userId = req.user._id; // from `verifyToken` middleware
  const { channelName, description, channelBanner } = req.body;

  try {
    const channel = await Channel.findById(id);

    if (!channel) {
      return res.status(404).send("Channel not found");
    }

    // Check if the current user is the owner of the channel
    // console.log("userId", userId);
    // console.log("channel.owner.id", channel.owner._id.toString());
    // if (channel.owner.id !== userId) {
    //   return res.status(403).json({ message: "You are not authorized to update this channel." });
    // }

    if (channel.owner._id.toString() !== userId) {
      return res.status(403).send("This is not your channel.");
    }

    if (channelName) channel.channelName = channelName;
    if (description) channel.description = description;
    if (channelBanner) channel.channelBanner = channelBanner;

    const updatedChannel = await channel.save();

    res.status(200).json({
      message: "Channel updated successfully",
      channel: updatedChannel,
    });
  } catch (error) {
    console.error("Error updating channel:", error);
    res.status(500).json({ message: "Server error while updating channel" });
  }
}

async function deleteChannel(req, res) {
  const { id } = req.params; // Channel ID
  const userId = req.user._id; // from `verifyToken` middleware

  try {
    const channel = await Channel.findById(id);

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Check if the current user is the owner of the channel
    if (channel.owner._id.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this channel." });
    }

    // removing channel from the user's owned channels list
    await User.findByIdAndUpdate(userId, {
      $pull: { channels: id },
    });

    // Removing all videos of the channel
    await Video.deleteMany({ channelId: id });

    await Channel.findByIdAndDelete(id);

    res.status(200).send("Channel deleted successfully");
  } catch (error) {
    console.error("Error deleting channel:", error);
    res.status(500).send("Something went wrong while deleting channel");
  }
}

async function getChannelVideos(req, res) {
  const { id } = req.params; // Channel ID

  try {
    const channel = await Channel.findById(id);

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Fetching all videos of the channel
    const videos = await Video.find({ channelId: id }).select("-comments"); // Exclude comments

    res.status(200).json({
      message: "Videos fetched successfully",
      videos,
    });
  } catch (error) {
    console.error("Error fetching channel videos:", error);
    res.status(500).send("Some error while fetching channel videos");
  }
}

async function getAllChannel(req, res) {
  try {
    // Fetch all channels, excluding the `subscribedUsers` field
    const channels = await Channel.find({}, "-subscribedUsers");

    res.status(200).json({
      message: "Channels retrieved successfully",
      channels,
    });
  } catch (error) {
    console.error("Error fetching all channels:", error);
    res.status(500).send("Server error while fetching channels");
  }
}

async function subscribeChannel(req, res) {
  try {
    const userId = req.user._id; // userId via verifyToken
    const channelId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // user is already subscribed or not
    const isSubscribed = user.subscribedChannels.includes(channelId);

    if (isSubscribed) {
      // Unsubscribe the user
      // user.subscribedChannels = user.subscribedChannels.filter(
      //   (id) => id !== channelId
      // );

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { subscribedChannels: channelId } }, // MongoDB $pull operator
        { new: true } // Return the updated document
      );
      // channel.subscribedUsers = channel.subscribedUsers.filter(
      //   (id) => id !== userId
      // );

      const updatedChannel = await Channel.findByIdAndUpdate(
        channelId,
        { $pull: { subscribedUsers: userId } }, // MongoDB $pull operator
        { new: true } // Return the updated document
      );
      await user.save();
      await channel.save();
      return res.status(200).json({
        message: "Unsubscribed successfully",
        subscribedUsers: updatedChannel.subscribedUsers,
      });
    } else {
      // Subscribe the user
      user.subscribedChannels.push(channelId);
      channel.subscribedUsers.push(userId);
      await user.save();
      await channel.save();
      return res.status(200).json({
        message: "Subscribed successfully",
        subscribedUsers: channel.subscribedUsers,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong while subscribing");
  }
}

// write the route to unsubscribe a channel

module.exports = {
  getUserChannels,
  subscribeChannel,
  addChannel,
  getChannelAdmin,
  updateChannel,
  deleteChannel,
  getChannel,
  getChannelVideos,
  getAllChannel,
};
