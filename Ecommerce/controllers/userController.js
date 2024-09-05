const User = require("../models/user");
const bigPromise = require("../middlewares/bigPromise");
const customError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const cloudinary = require("cloudinary");
const fileUpload = require("express-fileupload");
const mailHelper = require("../utils/emailHelper");
const crypto = require("crypto");

exports.signup = bigPromise(async (req, res, next) => {
  if (!req.files) {
    return next(new customError("No file uploaded", 400));
  }

  const { name, email, password } = req.body;

  let file = req.files.photo;

  const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
    folder: "users",
    width: 500,
    crop: "scale",
  });

  if (!name || !email || !password) {
    return next(
      new customError("Please provide email, passwprd and name", 400)
    );
  }
  const user = await User.create({
    name,
    email,
    password,
    photo: {
      id: result.public_id,
      secure_url: result.secure_url,
    },
  });

  cookieToken(user, res);
});

exports.login = bigPromise(async (req, res, next) => {
  const { email, password } = req.body;

  //check if email and password provided
  if (!email || !password) {
    return next(new customError("Please provide email and password", 400));
  }

  //check if user exists
  const user = await User.findOne({ email }).select("+password");

  //if user does not exist
  if (!user) {
    return next(new customError("User not found", 404));
  }

  //check if password is correct
  const isPasswordCorrect = await user.isValidatedPassword(password);

  //if password is incorrect
  if (!isPasswordCorrect) {
    return next(new customError("Invalid password", 401));
  }

  //if everything is correct
  cookieToken(user, res);
});

//logout
exports.logout = bigPromise(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    status: "success",
    message: "Logout success",
  });
});

//forgot password token
exports.forgotPassword = bigPromise(async (req, res, next) => {
  const { email } = req.body;

  //check if email provided
  if (!email) {
    return next(new customError("Please provide email", 400));
  }

  //check if user exists
  const user = await User.findOne({ email });

  //if user does not exist
  if (!user) {
    return next(new customError("User not found", 404));
  }

  //if everything is correct
  const forgetToken = user.getForgotPasswordToken();

  await user.save({ validateBeforeSave: false });

  //create url
  const myUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${forgetToken}`;

  //craft message
  const message = `Copy paste this link in your URL and hit enter \n\n ${myUrl}`;

  //send email
  try {
    await mailHelper({
      email: user.email,
      subject: "Mayank Tshirt- Reset Password",
      message,
    });
    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (err) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new customError("There was an error sending the email", 500));
  }
});

//reset password
exports.resetPassword = bigPromise(async (req, res, next) => {
  const token = req.params.token;

  //check if token provided
  if (!token) {
    return next(new customError("Please provide token", 400));
  }

  //hash token to compare from db
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  //check if user exists
  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordExpire: { $gt: Date.now() },
  });

  //if user does not exist
  if (!user) {
    return next(new customError("Invalid or expire token", 400));
  }

  //check password and confirm password
  const { password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return next(new customError("Passwords do not match", 400));
  }

  //if everything is correct
  user.password = password;

  //remove token and expire
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpire = undefined;

  //save user
  await user.save();

  //send response or token
  cookieToken(user, res);
});

//information about user in dashboard
exports.getLoggedInUser = bigPromise(async (req, res, next) => {
  // const user = await User.findById(req.user._id).select('-password');
  const user = req.user;
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

//update password
exports.updatePassword = bigPromise(async (req, res, next) => {
  const { password, newPassword } = req.body;

  //check if password provided
  if (!password || !newPassword) {
    return next(
      new customError("Please provide password and new password", 400)
    );
  }

  //check if user exists
  const user = await User.findById(req.user._id).select("+password");

  //if user does not exist
  if (!user) {
    return next(new customError("User not found", 404));
  }

  //check if password is correct
  const isPasswordCorrect = await user.isValidatedPassword(password);

  //if password is incorrect
  if (!isPasswordCorrect) {
    return next(new customError("Invalid password", 401));
  }

  //if everything is correct
  user.password = newPassword;
  await user.save();

  //send response or token
  cookieToken(user, res);
});

//update user details
exports.updateUserDetails = bigPromise(async (req, res, next) => {
  const { name, email } = req.body;

  //check if email provided
  if (!name || !email) {
    return next(new customError("Please provide name and email", 400));
  }

  //check if user exists
  let user = await User.findById(req.user._id);
  if (!user) {
    return next(new customError("User not found", 404));
  }

  if (req.files) {
    const imageId = user.photo.id;

    //delete old image
    const result = await cloudinary.v2.uploader.destroy(imageId);

    //upload new image
    const result2 = await cloudinary.v2.uploader.upload(
      req.files.photo.tempFilePath,
      {
        folder: "users",
        width: 500,
        crop: "scale",
      }
    );

    //update photo in db
    user.photo = {
      id: result2.public_id,
      secure_url: result2.secure_url,
    };
  }

  //update user details
  user.name = name;
  user.email = email;

  //save user
  await user.save();

  //send response or token
  cookieToken(user, res);
  //  user = await User.findByIdAndUpdate(req.user._id, { name, email }, { new: true , runValidators: true, useFindAndModify: false });
});

//admin controller

//allusers and managers
exports.getAllUsersAndManager = bigPromise(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    data: {
      users,
    },
  });
});

//single a user
exports.getSingleUser = bigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  //if user does not exist
  if (!user) {
    return next(new customError("User not found", 404));
  }

  //if everything is correct
  res.status(200).json({
    status: "success",
    user,
  });
});

//upadte a user
exports.updateSingleUser = bigPromise(async (req, res, next) => {
  //check if all fields provided
  const { name, email, role } = req.body;
  if (!name || !email || !role) {
    return next(new customError("Please provide name, email and role", 400));
  }

  //update user
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, email, role },
    { new: true, runValidators: true, useFindAndModify: false }
  );

    //if user does not exist
    if (!user) {
        return next(new customError("User not found", 404));
        }
    
    //if everything is correct
    res.status(200).json({
        status: "success",
        user});

});

//delete a user
exports.deleteSingleUser = bigPromise(async (req, res, next) => {
   const user = await User.findById(req.params.id);
    // if user does not exist
    if (!user) {
        return next(new customError("User not found", 404));
    }
    //delete image
    const imageId = user.photo.id;
    
    //if image exists then delete
    if (imageId) {
        const result = await cloudinary.v2.uploader.destroy(imageId);
    }
    


    
    //delete user
   await user.remove();

    //if everything is correct
    res.status(200).json({
        status: "success",
        message: "User deleted successfully"
    });

});

//all users
exports.getAllUsers = bigPromise(async (req, res, next) => {
  const users = await User.find({
    role: "user",
  });
  res.status(200).json({
    status: "success",
    data: {
      users,
    },
  });
});
