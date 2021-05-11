var express = require("express");
var router = express.Router();
var verifyToken = require("../middleware/verifyToken");
var jwt = require("jsonwebtoken");
var db = require("../config/dbConnection");

router.post("/addtocart/:id", verifyToken, (req, res) => {
  jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else if (authData) {
      var product_id = req.params.id;
      db.query(
        "SELECT balance FROM users WHERE id = ? ",
        [authData.id],
        (error, userBalance) => {
          if (error) {
            console.log(error);
          } else if (userBalance[0].balance == 0) {
            res.json({
              message: "Your balance is insufficient, Please recharge",
            });
          } else {
            db.query(
              "SELECT * FROM products WHERE id = ? and price <= ?",
              [product_id, userBalance[0].balance],
              (error, productResult) => {
                if (error) {
                  console.log(error);
                } else if (productResult.length == 0) {
                  res.json({
                    message:
                      "You can't add product with price higher than your available balance",
                  });
                } else {
                  var new_balance =
                    userBalance[0].balance - productResult[0].price;
                  db.query(
                    "UPDATE users SET balance = ? WHERE id = ?",
                    [new_balance, authData.id],
                    (error) => {
                      if (error) {
                        console.log(error);
                      } else {
                        db.query(
                          "INSERT INTO cart SET ?",
                          { user_id: authData.id },
                          (error, cartResult) => {
                            if (error) {
                              console.log(error);
                            } else {
                              db.query(
                                "INSERT INTO cart_product SET ? ",
                                {
                                  user_id: authData.id,
                                  cart_id: cartResult.insertId,
                                  product_id,
                                },
                                (error) => {
                                  if (error) {
                                    console.log(error);
                                  } else {
                                    res.json({
                                      message:
                                        "Product is added and price is deducted from your balance",
                                      product: productResult[0],
                                      cartID: cartResult.insertId,
                                    });
                                  }
                                }
                              );
                            }
                          }
                        );
                      }
                    }
                  );
                }
              }
            );
          }
        }
      );
    }
  });
});

router.post("/updatecart/:cart_id/:product_id", verifyToken, (req, res) => {
  jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else if (authData) {
      var cart_id = req.params.cart_id;
      var product_id = req.params.product_id;

      db.query(
        "SELECT balance FROM users WHERE id = ? ",
        [authData.id],
        (error, userBalance) => {
          if (error) {
            console.log(error);
          } else if (userBalance[0].balance == 0) {
            res.json({
              message: "Your balance is insufficient, Please recharge",
            });
          } else {
            db.query(
              "SELECT * FROM products WHERE id = ? and price <= ?",
              [product_id, userBalance[0].balance],
              (error, productResult) => {
                if (error) {
                  console.log(error);
                } else if (productResult.length == 0) {
                  res.json({
                    message:
                      "You can't add product with price higher than your available balance",
                  });
                } else {
                  var new_balance =
                    userBalance[0].balance - productResult[0].price;
                  db.query(
                    "UPDATE users SET balance = ? WHERE id = ?",
                    [new_balance, authData.id],
                    (error) => {
                      if (error) {
                        console.log(error);
                      } else {
                        db.query(
                          "INSERT INTO cart_product SET ? ",
                          {
                            cart_id,
                            product_id,
                            user_id: authData.id,
                          },
                          (error) => {
                            if (error) {
                              console.log(error);
                            } else {
                              res.json({
                                message:
                                  "Product is added and price is deducted from your balance",
                                product: productResult[0],
                              });
                            }
                          }
                        );
                      }
                    }
                  );
                }
              }
            );
          }
        }
      );
    }
  });
});

router.post("/removefromcart/:cart_product_id", verifyToken, (req, res) => {
  jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else if (authData) {
      var cart_product_id = req.params.cart_product_id;
      db.query(
        "SELECT balance FROM users WHERE id = ?",
        [authData.id],
        (error, userBalance) => {
          if (error) {
            console.log(error);
          } else {
            db.query(
              "SELECT * FROM cart_product WHERE id = ? ",
              [cart_product_id],
              (error, cartProductResult) => {
                if (error) {
                  console.log(error);
                } else {
                  db.query(
                    "SELECT price FROM products WHERE id = ?",
                    [cartProductResult[0].product_id],
                    (error, productPrice) => {
                      if (error) {
                        console.log(error);
                      } else {
                        var new_balance =
                          productPrice[0].price + userBalance[0].balance;
                        db.query(
                          "DELETE from cart_product WHERE id = ? AND user_id = ?",
                          [new_balance, authData.id],
                          (error, deleteResult) => {
                            if (error) {
                              console.log(error);
                            } else if (deleteResult.affectedRows == 0) {
                              res.json({
                                message: "Something went wrong",
                              });
                            } else {
                              db.query(
                                "UPDATE users SET balance = ? WHERE id = ?",
                                [new_balance, authData.id],
                                (error, updateBalanceResult) => {
                                  if (error) {
                                    console.log(error);
                                  } else {
                                    res.json({
                                      message:
                                        "Product has been removed from your cart and and your balance is updated",
                                    });
                                  }
                                }
                              );
                            }
                          }
                        );
                      }
                    }
                  );
                }
              }
            );
          }
        }
      );
    }
  });
});
module.exports = router;
