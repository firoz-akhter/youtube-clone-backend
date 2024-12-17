const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    avatar: {
        type: String,
    },
    channels: {
        // channels that I(as a user) own
        type: [mongoose.Schema.Types.ObjectId], // Array of strings to store channel IDs // I might convert it into mongodb.ObjectId
        default: [],
        ref: "Channel",
    },
    subscribedChannels: {
        // channels that I've subscribed to
        type: [mongoose.Schema.Types.ObjectId] ,
        default: [],
        ref: "Channel",
    }
}, {
    timestamps: true
});




const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
