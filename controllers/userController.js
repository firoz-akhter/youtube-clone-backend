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
  const { id } = req.params; 

  try {

    const user = await User.findById(id)
      .populate('channels') 
      .populate('subscribedChannels');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong while getting user data");
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

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true, runValidators: true });

    if (!updatedUser) {
      return res.status(404).send("User not found");
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong while updating user");
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