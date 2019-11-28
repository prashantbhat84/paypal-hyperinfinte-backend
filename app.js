const express = require("express");
const app = express();
const engines = require("consolidate");
const paypal = require("paypal-rest-sdk");

let PORT = process.env.PORT || 3000;
app.engine("ejs", engines.ejs);
app.set("views", "./views");
app.set("view engine", "ejs");
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "ARBQFYLMTPkf18nF6-8-Yr2GS5osOzUvl0qixV3c7hXPtnNi1aG4L7Mq6EmF-XMRXENO8bFpHCfs5HCI",
  client_secret:
    "EPLVWrl6klFhn5Ufdu0YAAhn4Kq8MVcGbbK9BIwiZFVaiIvQiBa5Y9_s1kZd_r4FL_IDVsycAOG5jYpg"
});

app.get("/", (req, res) => {
  res.render("index");
});
app.get("/paypal", (req, res) => {
  let create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal"
    },
    redirect_urls: {
      return_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel"
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "item",
              sku: "item",
              price: "1.00",
              currency: "USD",
              quantity: 1
            }
          ]
        },
        amount: {
          currency: "USD",
          total: "1.00"
        },
        description: "This is the payment description."
      }
    ]
  };
  paypal.payment.create(create_payment_json, function(error, payment) {
    if (error) {
      throw error;
    } else {
      console.log("Create Payment Response");
      console.log(payment);
      res.redirect(payment.links[1].href);
    }
  });
});
app.get("/success", (req, res) => {
  let payerid = req.query.PayerID;
  let paymentid = req.query.paymentId;
  let execute_payment_json = {
    payer_id: payerid,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: "1.00"
        }
      }
    ]
  };

  let paymentId = paymentid;

  paypal.payment.execute(paymentId, execute_payment_json, function(
    error,
    payment
  ) {
    if (error) {
      console.log(error.response);
      throw error;
    } else {
      console.log("Get Payment Response");
      console.log(JSON.stringify(payment));
      res.render("success");
    }
  });
});
app.get("/success1", (req, res) => {
  console.log(req.query.PayerID);
  console.log(req.query.paymentId);
  res.send("ok");
});
app.get("/cancel", (req, res) => {
  res.render("cancel");
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
