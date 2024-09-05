const express=require('express');
const { stripePayment, razorpayPayment } = require('../controllers/paymentController');
const { isLoggedIn } = require('../middlewares/user');
const router=express.Router();

//for stripe payment
router.route('/stripepayment').post(isLoggedIn, stripePayment);

//for razorpay payment
router.route('/razorpaypayment').post(isLoggedIn, razorpayPayment);


module.exports= router;