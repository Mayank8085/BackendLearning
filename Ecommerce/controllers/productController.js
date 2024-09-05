const Product = require("../models/product");
const bigPromise = require("../middlewares/bigPromise");
const customError = require("../utils/customError");
const cloudinary = require("cloudinary");
const WhereClause = require("../utils/whereClause");

//add product
exports.addProduct = bigPromise(async (req, res, next) => {
  //images
  let images = [];

  //check if images provided
  if (!req.files) {
    return next(new customError("Images are required", 400));
  }
 
  //upload images
  if (req.files) {
    for (let i = 0; i < req.files.photos.length; i++) {
      //upload image
      let file = req.files.photos[i];
      let result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
        folder: "products",
      });

      //push image to array
      images.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }

  //create product
  req.body.photos = images;
  req.body.user = req.user.id;

  //error is hanndled in the model
  const product = await Product.create(req.body);

  //send response
  res.status(201).json({
    success: true,
    product,
  });
});

//get all products
exports.getAllProduct = bigPromise(async (req, res, next) => {
  const resultPerPage = 4;
  const totalcountProduct = await Product.countDocuments();

  const productsObj = new WhereClause(Product.find(), req.query)
    .search()
    .filter();

  let products = await productsObj.base;
  const filteredProductNumber = products.length;

  //products.limit().skip()

  productsObj.pager(resultPerPage);
  products = await productsObj.base.clone();

  res.status(200).json({
    success: true,
    products,
    filteredProductNumber,
    totalcountProduct,
  });
});

//get single product by id
exports.getProductById = bigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new customError("Product not found", 404));
  }
  res.status(200).json({
    success: true,
    product,
  });
});

//update product
exports.updateProduct = bigPromise(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  let images = [];
  if (!product) {
    return next(new customError("Product not found", 404));
  }

  if (req.files) {
    //delete existing images
    for (let i = 0; i < product.photos.length; i++) {
      const result = await cloudinary.v2.uploader.destroy(product.photos[i].id);
    }
    //upload new images
    for (let i = 0; i < req.files.photos.length; i++) {
      //upload image
      let file = req.files.photos[i];
      let result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
        folder: "products", //foldet name comes from .env file
      });

      //push image to array
      images.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }

  req.body.photos = images;
  req.body.user = req.user.id;

  //error is hanndled in the model
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  //send response
  res.status(200).json({
    success: true,
    updatedProduct,
  });
});

//delete product
exports.deleteProduct = bigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new customError("Product not found", 404));
  }
  //delete images
  for (let i = 0; i < product.photos.length; i++) {
    const result = await cloudinary.v2.uploader.destroy(product.photos[i].id);
  }
  //delete product
  await product.remove();
  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

//add or update review
exports.addReview = bigPromise(async (req, res, next) => {
  const { name, rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new customError("Product not found", 404));
  }
  //review ibject
  const review = {
    name,
    rating,
    comment,
    user: req.user.id,
  };

  //check if review exists
  const AlreadyReview = product.reviews.find(
    (review) => review.user.toString() === req.user.id.toString()
  );

  //if review exists than update
  if (AlreadyReview) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user.id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    //add review
    product.reviews.push(review);
    product.numberOfReviews = product.reviews.length+1;
  }

  //adjust average rating -review
  product.ratings =
    product.reviews.reduce((acc, review) => {
      return acc + review.rating;
    }, 0) / product.reviews.length;

    //save product
    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: "Review added successfully",
        product});

});

//delete review
exports.deleteReview = bigPromise(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    //check if review exists
    if (!product) {
        return next(new customError("Product not found", 404));
    }

    //if review doesnt exist than return error
    

    

    //delete review
    product.reviews = product.reviews.filter(
        (review) => review.user.toString() !== req.user.id.toString()
    );
    product.numberOfReviews = product.reviews.length;
    //adjust average rating -review
    product.ratings =
        product.reviews.reduce((acc, review) => {
        return acc + review.rating;
        }, 0) / product.reviews.length;
    
    //save product
    await product.save({ validateBeforeSave: false });
    
    res.status(200).json({
        success: true,
        message: "Review deleted successfully",
        product,
    });
});



