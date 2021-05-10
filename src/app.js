require("dotenv").config();
var express = require("express");
var cookieParser = require("cookie-parser");

var app = express();
app.use(express.json());
app.use(cookieParser());

var port = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/user", require("./users/index"));

app.listen(port, () => {
  console.log("Server is up on port " + port);
});
