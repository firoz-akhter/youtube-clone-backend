const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
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
        default: null, 
        match: [/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/, 'Invalid URL format']
    },
    channels: {
        type: [String], // Array of strings to store channel IDs // I might convert it into mongodb.ObjectId
        default: []
    }
}, {
    timestamps: true
});



const User = mongoose.model('User', userSchema);
module.exports = User;
