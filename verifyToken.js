const jwt = require("jsonwebtoken")

function verifyToken(req, res, next) {


  const token = req.headers['access_token'];
  // console.log(token); return ;
  
  if(!token) {
    res.status(404).json({
      success: false,
      message: "You are not authenticated!"
    })
    return ;
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if(err) {
      res.status(401).json({
        success: false,
        message: "Token is not valid!"
      })
      return;
    }
    req.user = user.user;
    console.log(req.user);
    next();
  })
  

}



module.exports = verifyToken;