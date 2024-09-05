const express = require("express");
const Razorpay = require("razorpay");

const app = express();

app.use(express.static("./public"));
app.use(express.json());

app.post("/order", async (req, res) => {
  const amount = req.body.amount;
  var instance = new Razorpay({
    key_id: "rzp_test_ZBkRb8V19Sxsev",
    key_secret: "ZOOboNIRtUnwa25IF2ndHMh8",
  });
  var options = {
    amount: amount * 100,
    currency: "INR",
    receipt: "order_rcptid_11",
    payment_capture: 1,
  };
  //   instance.orders.create(options, function (err, order) {
  //     console.log(order);
  //   });

  const myOrder = await instance.orders.create(options);

  res.status(200).json({
    success: true,
    amount,
    order: myOrder,
  });
});

app.listen(4000, () => {
  console.log("Listening on port 4000");
});
