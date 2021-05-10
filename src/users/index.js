var express = require("express");
var userController = require("./usersController");

var router = express.Router();

router.post("/login", userController.login);
router.post("/register", userController.register);
router.get("/getuser", userController.getUser);

module.exports = router;
