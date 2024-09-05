const BigPromise = require("../middlewares/bigPromise");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const Razorpay = require("razorpay");

//stripe payment
exports.stripePayment = BigPromise(async (req, res, next) => {
  const { amount, currency } = req.body;
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    metadata: { integration_check: "accept_a_payment" },
  });
  res.status(200).json({
    success: true,
    client_secret: paymentIntent.client_secret,
  });
});

//razorpay payment
exports.razorpayPayment = BigPromise(async (req, res, next) => {
    var instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    const { amount, currency } = req.body;
    const payment = await instance.orders.create({
        amount,
        currency,
        receipt: "order_rcptid_11",
    });
    res.status(200).json({
        success: true,
        amount,
        payment_id: payment.id,

    });

});