var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var db = require("../config/dbConnection");

exports.isLoggedIn = async (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer") ||
    !req.headers.authorization.split(" ")[1]
  ) {
    return res.status(422).json({
      message: "Please provide the token",
    });
  }

  var theToken = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(theToken, process.env.JWT_SECRET);
  console.log("Authenticated");
  res.send("Authenticated");
  //next();
};
