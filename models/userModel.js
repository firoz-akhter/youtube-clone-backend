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
        type: [String], // Array of strings to store channel IDs // I might convert it into mongodb.ObjectId
        default: []
    },
    subscribers: {
        type: Number, // kis kis ko maine subscribe kiya hai
        default: 0,
        min: [0, 'Subscribers count cannot be less than zero.']
    },
    subscribedUsers: {
        type: [String] // mere kitne subscribers hai
    }
}, {
    timestamps: true
});




const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
