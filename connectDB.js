const mongoose = require("mongoose");


 
const connectDB = async () => {
    mongoose.connect(process.env.MONGODB_URL).then(() => {
        console.log("connection to database successful")
    }).catch ((err) => {
        console.log("something went wrong while connecting to database")
        console.log(err);
    })

}


module.exports = connectDB;