const express = require("express");
const { register, login } = require("../controllers/authController");

const AuthRouter = express.Router();

// create a user
AuthRouter.post("/register", register)

// sign in
AuthRouter.post("/login", login)

// google auth
AuthRouter.post("/googlelogin", )







module.exports = AuthRouter;