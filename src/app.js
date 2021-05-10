require("dotenv").config();
var express = require("express");

var app = express();
app.use(express.json());

var port = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/users", require("./user/index"));
app.use("/products", require("./product/routes"));
app.use("/cart", require("./cart/routes"));

// Error handler - when none of the endpoints match
app.use((req, res, next) => {
  res.status(404).json({
    error: {
      message: "404 not found",
      from: "Moe's API",
    },
  });
});

app.listen(port, () => {
  console.log("Server is up on port " + port);
});
