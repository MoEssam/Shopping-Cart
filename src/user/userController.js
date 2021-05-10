var express = require("express");
var db = require("../config/dbConnection");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  var { name, email, password } = req.body;

  let sqlAll = `SELECT * FROM users WHERE email=?;`;
  db.query(sqlAll, [email], async (error, results) => {
    if (error) {
      console.log(error);
    } else if (results.length > 0) {
      return res.send("Email is registered");
    }
    var hashedPassword = await bcrypt.hash(password, 10);
    let sqlInsert = `INSERT INTO users SET ?;`;
    db.query(
      sqlInsert,
      { name, email, password: hashedPassword },
      (error, result) => {
        if (error) {
          console.log(error);
        } else {
          res.status(201).json({
            userID: result.insertId,
            custom_message: "new user was successfully created",
          });
        }
      }
    );
  });
};

exports.login = async (req, res) => {
  var { email, password } = req.body;

  let sqlALl = `SELECT * FROM users WHERE email=?;`;
  db.query(sqlALl, [email], async (error, result) => {
    if (error || result.length === 0) {
      return res.status(401).json({
        error: `Auth failed`,
      });
    } else {
      bcrypt.compare(password, result[0].password, (err, success) => {
        if (err) {
          return res.status(401).json({
            error: `Auth failed`,
          });
        }
        if (success) {
          token = jwt.sign(
            {
              id: result[0].id,
              email: result[0].email,
            },
            process.env.JWT_SECRET
          );
          return res.status(200).json({
            error: `Auth Successful`,
            token,
          });
        }
        res.status(401).json({
          error: `Auth failed`,
        });
      });
    }
  });
};
exports.delete = async (req, res) => {
  res.status(200).json({
    message: "Success",
  });
};

exports.get = async (req, res) => {
  let userID = req.params.id;
  res.status(200).json({
    user: userID,
  });
};
