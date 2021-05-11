var express = require("express");
var router = express.Router();
var verifyToken = require("../middleware/verifyToken");
var jwt = require("jsonwebtoken");
var db = require("../config/dbConnection");

router.post("/:cartid", verifyToken, (req, res) => {
  jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else if (authData) {
      cart_id = req.params.cartid;
      db.query(
        "SELECT * FROM delivery WHERE cart_id = ?",
        [cart_id],
        (error, deliveryStatus) => {
          if (error) {
            console.log(error);
          } else if (deliveryStatus.length == 1) {
            res.json({
              message: "Your shippment is in " + deliveryStatus[0].status,
            });
          } else {
            db.query(
              "INSERT INTO delivery SET ? ",
              {
                cart_id,
                user_id: authData.id,
                status: "In Progress",
              },
              (error, deliveryResult) => {
                if (error) {
                  console.log(error);
                } else {
                  res.json({
                    message: "Your order is in progress.",
                  });
                }
              }
            );
          }
        }
      );
    }
  });
});

router.post("/cancelorder/:deliveryid", verifyToken, (req, res) => {
  jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else if (authData) {
      delivery_id = req.params.deliveryid;
      db.query(
        "SELECT * FROM delivery WHERE id = ?",
        [delivery_id],
        (error, deliveryStatus) => {
          if (error) {
            console.log(error);
          } else if (deliveryStatus[0].status == "Shipped") {
            res.json({
              message: "Sorry you can't cancel your order it has been shipped",
            });
          } else {
            db.query(
              "UPDATE delivery SET status = ? WHERE id = ?",
              ["Cancelled", delivery_id],
              (error, deliveryResult) => {
                if (error) {
                  console.log(error);
                } else {
                  db.query(
                    "SELECT product_id, products.price, cart.id as cart_id, cart_product.id AS cart_product_id, cart_product.user_id as user_id,users.balance\
                     from cart_product\
                     JOIN cart ON cart.id = cart_product.cart_id\
                     JOIN products on products.id = cart_product.product_id\
                     JOIN delivery on delivery.cart_id  = cart.id\
                     JOIN users on users.id = cart_product.user_id\
                     WHERE delivery.id = ?",
                    [delivery_id],
                    (error, joinResults) => {
                      if (error) {
                        console.log(error);
                      } else {
                        var cart_product_id = [];
                        var cart_total_balance = [];
                        var totalBalance = 0;
                        for (var i = 0; i < joinResults.length; i++) {
                          totalBalance = joinResults[i].price + totalBalance;
                          cart_total_balance.push(totalBalance);
                          cart_product_id.push(joinResults[i].cart_product_id);
                        }
                        var length = cart_total_balance.length;
                        console.log(length);
                        console.log(cart_total_balance[length - 1]);
                        console.log(
                          "balance is ",
                          cart_total_balance[length - 1]
                        );
                        db.query(
                          "DELETE FROM cart_product WHERE id in (?)",
                          [cart_product_id],
                          (error) => {
                            if (error) {
                              console.log(error);
                            } else {
                              db.query(
                                "DELETE FROM cart WHERE id = ?",
                                [joinResults[0].cart_id],
                                (error) => {
                                  if (error) {
                                    console.log(error);
                                  } else {
                                    var new_balance =
                                      cart_total_balance[
                                        cart_total_balance.length - 1
                                      ] + joinResults[0].balance;
                                    console.log(new_balance);
                                    db.query(
                                      "UPDATE users SET balance = ? WHERE id = ?",
                                      [new_balance, authData.id],
                                      (error, updateBalance) => {
                                        if (error) {
                                          console.log(error);
                                        } else {
                                          res.json(updateBalance);
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
        }
      );
    }
  });
});

module.exports = router;
