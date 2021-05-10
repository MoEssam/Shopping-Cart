var express = require("express");
var router = express.Router();
var userController = require("./userController");
var checkAuth = require("../middleware/auth");
var verifyToken = require("../middleware/verifyToken");
var jwt = require("jsonwebtoken");

router.post("/login", userController.login);
router.post("/register", userController.register);
router.delete("/:id", [userController.delete, checkAuth]);
router.get("/:id", userController.get);

// Protected
router.post("/protected", verifyToken, (req, res) => {
  jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      res.json({
        theBearerToken: authData,
      });
    }
  });
});

module.exports = router;
