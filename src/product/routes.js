var express = require("express");
var router = express.Router();
var verifyToken = require("../middleware/verifyToken");
var jwt = require("jsonwebtoken");
var db = require("../config/dbConnection");

router.get("/all", verifyToken, (req, res) => {
  jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else if (authData) {
      db.query("SELECT * FROM products", (error, results) => {
        if (error) {
          console.log(error);
        } else {
          res.json({
            theBearerToken: authData,
            products: results,
          });
        }
      });
    }
  });
});

router.get("/", verifyToken, (req, res) => {
  jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else if (authData) {
      db.query(
        "SELECT * FROM products WHERE price <= ?",
        [authData.balance],
        (error, results) => {
          if (error) {
            console.log(error);
          } else {
            res.json({
              //theBearerToken: authData,
              products: results,
            });
          }
        }
      );
    }
  });
});

router.post("/request", verifyToken, (req, res) => {
  jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else if (authData) {
      var { category, name, brand } = req.body;
      db.query(
        "INSERT INTO product_request SET ?",
        { category, name, brand, user_id: authData.id },
        (error, result) => {
          if (error) {
            console.log(error);
          } else {
            res.status(201).json({
              userID: result.insertId,
              custom_message: "Your request has been submitted",
            });
          }
        }
      );
    }
  });
});

router.get("/:id", verifyToken, (req, res) => {
  jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else if (authData) {
      db.query(
        "SELECT * FROM products WHERE id = ?",
        [req.params.id],
        (error, results) => {
          if (error) {
            console.log(error);
          } else {
            res.json({
              product: results,
            });
          }
        }
      );
    }
  });
});

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
