const User = require("../models/UserModel")
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

    // Save the channel to the database
    const savedChannel = await newChannel.save();

    // Add the channel to the user's owned channels
    user.channels.push(savedChannel._id);
    await user.save();

    res.status(201).json({
      message: "Channel created successfully",
      channel: savedChannel
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while creating channel" });
  }
}

async function getChannelAdmin(req, res) {
  let userId = req.user._id;
  const { id } = req.params; // Channel ID

  try {
    // Fetch the channel with all details
    const channel = await Channel.findById(id)
      .populate("owner", "username email avatar") // Populate the owner's basic details
      .populate("subscribedUsers", "username email avatar") // Populate the details of subscribed users
      .populate({
        path: "videos", // Populate videos with their details
        select: "title description views likes thumbnailUrl", // Only include relevant fields
      });

    // If no channel is found, return an error
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Check if the current user is the owner of the channel
    // console.log("userId", userId);
    // console.log("channel.owner._id.toString()", channel.owner.id);
    if (channel.owner.id !== userId) {
      return res.status(403).json({ message: "This is not your channel." });
    }

    // Return the channel details
    res.status(200).json({
      message: "Channel fetched successfully",
      channel,
    });
  } catch (error) {
    console.error("Error fetching channel:", error);
    res.status(500).json({ message: "Server error while fetching channel" });
  }
}

async function getChannel(req, res) {
  const { id } = req.params; // Channel ID from URL params

  try {
    // Fetch the channel, excluding the subscribedUsers field
    const channel = await Channel.findById(id)
      .select("-subscribedUsers") // Exclude subscribedUsers from the response
      .populate("owner", "username email avatar") // Populate owner's details
      .populate({
        path: "videos",
        select: "title views thumbnailUrl", // Include only relevant fields for videos
      });

    // If channel not found, return 404
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Return the channel details
    res.status(200).json({
      message: "Channel fetched successfully",
      channel,
    });
  } catch (error) {
    console.error("Error fetching channel:", error);
    res.status(500).json({ message: "Server error while fetching channel" });
  }
}

async function updateChannel(req, res) {
  const { id } = req.params; // Channel ID
  const userId = req.user._id; // Extracted from `verifyToken` middleware
  const { channelName, description, channelBanner } = req.body; // Fields to update

  try {
    // Fetch the channel to verify ownership
    const channel = await Channel.findById(id);

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Check if the current user is the owner of the channel
    // console.log("userId", userId);
    // console.log("channel.owner.id", channel.owner._id.toString());
    // if (channel.owner.id !== userId) {
    //   return res.status(403).json({ message: "You are not authorized to update this channel." });
    // }

    if (channel.owner._id.toString() !== userId) {
      return res.status(403).json({ message: "This is not your channel." });
    }

    // Update the channel details
    if (channelName) channel.channelName = channelName;
    if (description) channel.description = description;
    if (channelBanner) channel.channelBanner = channelBanner;

    // Save the updated channel
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
  const userId = req.user._id; // Extracted from `verifyToken` middleware

  try {
    // Fetch the channel to verify existence and ownership
    const channel = await Channel.findById(id);

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Check if the current user is the owner of the channel
    if (channel.owner._id.toString() !== userId) {
      return res.status(403).json({ message: "You are not authorized to delete this channel." });
    }

    // Remove the channel from the user's owned channels list
    await User.findByIdAndUpdate(userId, {
      $pull: { channels: id },
    });

    // Remove all associated videos of the channel
    await Video.deleteMany({ channelId: id });

    // Delete the channel
    await Channel.findByIdAndDelete(id);

    res.status(200).json({ message: "Channel deleted successfully" });
  } catch (error) {
    console.error("Error deleting channel:", error);
    res.status(500).json({ message: "Server error while deleting channel" });
  }
}

async function getChannelVideos(req, res) {
  const { id } = req.params; // Channel ID

  try {
    // Verify that the channel exists
    const channel = await Channel.findById(id);

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Fetch all videos associated with the channel
    const videos = await Video.find({ channelId: id }).select("-comments"); // Exclude comments if not needed

    res.status(200).json({
      message: "Videos retrieved successfully",
      videos,
    });
  } catch (error) {
    console.error("Error fetching channel videos:", error);
    res.status(500).json({ message: "Server error while fetching channel videos" });
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
    res.status(500).json({ message: "Server error while fetching channels" });
  }
}

async function subscribeChannel(req, res) {

  try {
    const userId = req.user._id; // Get the user ID from the request parameters, via verifyToken
    const channelId = req.params.id;

    // Find the user by userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the channel to verify it exists
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Check if the user is already subscribed or not
    const isSubscribed = user.subscribedChannels.includes(channelId);

    if (isSubscribed) {
      // Unsubscribe the user
      user.subscribedChannels = user.subscribedChannels.filter(id => id !== channelId);
      channel.subscribedUsers = channel.subscribedUsers.filter(id => id !== userId);
      await user.save();
      await channel.save();
      return res.status(200).json({ message: 'Unsubscribed successfully' });
    } else {
      // Subscribe the user
      user.subscribedChannels.push(channelId);
      channel.subscribedUsers.push(userId);
      await user.save();
      await channel.save();
      return res.status(200).json({ message: 'Subscribed successfully' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}







module.exports = { subscribeChannel, addChannel, getChannelAdmin, updateChannel, deleteChannel, getChannel, getChannelVideos, getAllChannel }