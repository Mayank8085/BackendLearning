const express=require('express');
const {addProduct, getAllProduct, getProductById, updateProduct, deleteProduct, addReview, deleteReview } = require('../controllers/productController');
const { isLoggedIn, customRole } = require('../middlewares/user');
const router=express.Router();

// router.route("/testproduct").get(testProduct)?
//common route for all the users
router.route("/products").get(getAllProduct);
router.route("/product/:id").get(getProductById);

//reviews
router.route("/product/:id/reviews")
.put(isLoggedIn, addReview)
.delete(isLoggedIn, deleteReview);

//admin route
router.route("/admin/addproduct").post(isLoggedIn, customRole("admin"), addProduct);

router.route("/product/:id")
.put(isLoggedIn,customRole("admin"),updateProduct)
.delete(isLoggedIn,customRole("admin"),deleteProduct);


module.exports= router;