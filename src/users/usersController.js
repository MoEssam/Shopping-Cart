var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var db = require("../config/dbConnection");

exports.register = async (req, res) => {
  var { name, email, password } = req.body;

  db.query(
    "SELECT email FROM users WHERE email = ?",
    [email],
    async (error, results) => {
      if (error) {
        console.log(error);
      }
      if (results.length > 0) {
        return res.send("Email is registerd");
      }
      var hashedPassword = await bcrypt.hash(password, 8);
      console.log(hashedPassword);
      await db.query(
        "INSERT INTO users SET ?",
        { name, email, password: hashedPassword },
        (error, result) => {
          if (error) {
            console.log(error);
          } else {
            res.send("Register Successfully");
          }
        }
      );
    }
  );
};

exports.login = async (req, res) => {
  var { email, password } = req.body;
  if (!email || !password) {
    return res.send("Please provide email and password");
  }
  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (error, results) => {
      var isMatch = await bcrypt.compare(password, results[0].password);
      if (!results || !isMatch) {
        return res.send("Incorrect email or password");
      } else {
        var id = results[0].id;
        var token = jwt.sign({ id }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN,
        });
        var cookieOptions = {
          expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
          ),
          httpOnly: true,
        };
        res.cookie("jwt", token, cookieOptions);
        res.redirect("/user/getuser");
      }
    }
  );
};

exports.getUser = async (req, res, next) => {
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
  var decoded = jwt.verify(theToken, process.env.JWT_SECRET);
  db.query(
    "SELECT `id`,`name`,`email` FROM `users` WHERE `id`=?",
    [decoded.id],
    async (error, results) => {
      if (error) {
        console.log(error);
      } else if (results.length > 0) {
        return res.json({
          user: results[0],
        });
      } else {
        res.json({
          message: "No user found",
        });
      }
    }
  );
};
