const User = require("../models/UserModel");
const Video = require("../models/videoModel");


async function getAllUser(req, res) {
  try {
    let allUsers = await User.find({});
    res.json(allUsers);
    return;
  }
  catch (err) {
    res.send("something went wrong while fetching all user");
  }
}

async function getUser(req, res) {
  try {
    // console.log(req.params.id);
    // let id = req.params.id;
    let user = await User.findById(req.params.id);
    console.log(user);
    if (!user) {
      res.status(404).send("No user found.")
      return;
    }
    res.status(200).json(user);
  }
  catch (err) {
    res.status(500).send("Something went wrong while fetching user...");
  }
}

async function updateUser(req, res) {
  // console.log("inside updateUser")
  // console.log("req.params.id", req.params.id);
  // console.log("req.user.id", req.user._id);
  // console.log("req.user", req.user); return ;



  if (req.params.id !== req.user._id) {
    return res.status(403).send("You can update only your account!")
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      }, { new: true }
    )
    res.status(200).json(updatedUser);
    return;
  }
  catch (err) {
    res.json({
      success: false,
      message: "Something went wrong while updating user..."
    })
  }

}

async function deleteUser(req, res) {
  if (req.params.id !== req.user._id) {
    return res.status(403).send("You can delete only your account!")
  }

  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).send("User deleted successfully...")
  }
  catch (err) {
    res.status(500).send("Something went wrong while deleting user...")
  }



}

async function subscribeChannel(req, res) {

  let id = req.body.channelUserId; // channelUserId
  console.log(id); 
  try {

    const channelUser = await User.findById(id);

    // Check if the user is already subscribed
    if (channelUser.subscribedUsers.includes(req.params.id)) {
      return res.status(400).json({ message: "User is already subscribed to this channel." });
    }

    // jisko mai subscribe kr raha hun...
    await User.findByIdAndUpdate(id, {
      $push: { subscribedUsers: req.params.id }
    })

    // kis kis ko maine subscribe kiya hai
    await User.findByIdAndUpdate(req.params.id, {
      $inc: { subscribers: 1 }
    })
    res.status(200).json("Subscription successfull...")
  }
  catch (err) {
    res.status(500).send("Something went wrong while subscribing...")
  }
}

async function unsubscribeChannel(req, res) {
  let id = req.body.channelUserId;
  try {
    await User.findByIdAndUpdate(id, {
      $pull: { subscribedUsers: req.params.id },
    }, {new: true});
    // await User.findByIdAndUpdate(req.params.id, {
    //   $inc: { subscribers: -1 },
    // });

    const channelUser = await User.findById(req.params.id);
    if (channelUser.subscribers > 0) {
      await User.findByIdAndUpdate(req.params.id, {
        $inc: { subscribers: -1 },
      });
    }

    res.status(200).json("Unsubscription successfull.")
  } catch (err) {
    res.status(500).send("Something wrong while unsubscribing")
  }
}

async function likeVideo(req, res) {
  let id = req.body.id;
  let videoId = req.params.videoId;
  console.log("id", id);
  console.log("vidoeId", videoId);
  try {
    await Video.findByIdAndUpdate(videoId, {
      $addToSet: { likes: id },
      $pull: { dislikes: id }
    })
    res.status(200).send("The video has been liked successfully")
    return;
  }
  catch (err) {
    res.status(500).send("Can't like the video.")
  }
}

async function dislikeVideo(req, res) {
  const id = req.body.id;
  const videoId = req.params.videoId;
  try {
    await Video.findByIdAndUpdate(videoId, {
      $addToSet: { dislikes: id },
      $pull: { likes: id }
    })
    res.status(200).send("The video has been disliked.")
    return ;
  } catch (err) {
    res.status(500).send("Cant dislike the video.")
  }
}

// comment on a video



module.exports = {
  getAllUser, getUser, updateUser, deleteUser, subscribeChannel, unsubscribeChannel, likeVideo, dislikeVideo
}