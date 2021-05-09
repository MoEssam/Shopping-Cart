require("dotenv").config();
var express = require("express");

var app = express();
app.use(express.json());

var port = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log("Server is up on port " + port);
});
