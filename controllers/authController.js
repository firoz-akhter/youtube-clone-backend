const User = require("../models/UserModel")
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');



async function register(req, res) {

    let { username, email, password } = req.body;

    if (!username || !email || !password) {
        res.status(400).send("Either one or more required fields are missing...")
        return;
    }

    try {

        let existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(409).send("Email already registered...");
            return;
        }

        let hashedPassword = await bcrypt.hash(password, 10); // check once more
        let newUser = new User({
            username,
            email,
            password: hashedPassword
        })

        await newUser.save();
        
        
        newUser = newUser.toObject()
        // let token = jwt.sign(newUser, process.env.SECRET_KEY)
        // newUser.token = token;

        delete newUser.password;
        res.status(200).json(
            newUser
        )

    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }

}





async function login(req, res) {
    let { email, password } = req.body;

    if (!email || !password) {
        res.status(400).send("Email and password both required...")
        return;
    }
    try {
        // finding saved user by email
        let user = await User.findOne({ email })

        if (!user) {
            res.status(401).send("User with email or password not found...")
            return;
        }

        // check password is correct or not 
        let isValidPassword = await bcrypt.compare(password, user.password); // check one more
        if (!isValidPassword) {
            res.status(401).send("Invalid email or password...");
            return;
        }

        // generate token
        let token = jwt.sign({ // check once more
            user
        }, process.env.SECRET_KEY)

        user = user.toObject();
        delete user.password;
        user.token = token;

        // return token
        res.status(200).json(user)
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internal Server error");
    }
}












module.exports = { register, login }
