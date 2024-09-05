const User = require('../models/user');
const bigPromise=require ("./bigPromise");
const customError = require("../utils/customError");
const jwt = require('jsonwebtoken');

//isLoggedIn middleware to check if user is logged in
exports.isLoggedIn= bigPromise(async (req, res, next) => {
        // const token = req.cookies.token || req.header("Authorization").replace("Bearer ", "");
    
        // check token first in cookies
        let token = req.cookies.token;
    
        // if token is not in cookies check header
        if (!token && req.header("Authorization")) {
            token = req.header("Authorization").replace("Bearer ", "");
        }
    
        // if token is not in cookies or header
        if (!token) {
            return next(new customError("You are not logged in", 401));
        }
    
        // verify token
       const decoded= jwt.verify(token, process.env.JWT_SECRET);
    
        // if token is invalid
        if (!decoded) {
            return next(new customError("You are not logged in", 401));
        }
    
        // if token is valid
        req.user = await User.findById(decoded.id);
        next();   
});

//check roles for user
exports.customRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new customError("You are not authorized to access this route", 403));
        }
        next();
    };
};
