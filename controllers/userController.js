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
  const { id } = req.params; // Extract the user ID from the request parameters

  try {
    // Find the user by ID
    const user = await User.findById(id)
      .populate('channels') // Populate the channels the user owns
      .populate('subscribedChannels'); // Populate the channels the user is subscribed to

    if (!user) {
      // If no user is found, return a 404 error
      return res.status(404).json({ message: 'User not found' });
    }

    // If user is found, send the user data as a response
    res.status(200).json(user);
  } catch (error) {
    // Handle any errors during the query
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
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
    const userId = req.params.id;
    const updatedData = req.body;

    // Find and update the user by ID
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true, runValidators: true });

    if (!updatedUser) {
      // If no user is found, return a 404 error
      return res.status(404).json({ message: 'User not found' });
    }

    // Send the updated user data as a response
    res.status(200).json(updatedUser);
  } catch (error) {
    // Handle any errors during the update
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
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







module.exports = {
  getAllUser, getUser, updateUser, deleteUser
}