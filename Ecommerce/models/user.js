const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        maxlength: [50, 'Name cannot be more than 50 characters'],
        minlength: [3, 'Name must be at least 3 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select : false
    },
    photo: {
        id: {
            type: String,
            required: [true, 'Photo is required']
        },
        secure_url: {
            type: String,
            required: [true, 'Photo is required']
        }
    },
    role: {
        type: String,
        default: 'user'
    },
    forgotPasswordToken: String,
    forgotPasswordExpire: Date,

    createdAt: {
        type: Date,
        default: Date.now
    }


});

//password encryption using pre hook
userSchema.pre('save', async function (next) {
    if(!this.isModified('password')){
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

//password validation using method
userSchema.methods.isValidatedPassword = async function (usersendPassword) {
    return await bcrypt.compare(usersendPassword, this.password);

};

//create token for user
userSchema.methods.getJwtToken = function () {
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY
    });
};

//forget password token (random string )
userSchema.methods.getForgotPasswordToken = function () {
    //generate random string
    const forgotToken=crypto.randomBytes(20).toString('hex');

    //hashing - make sure to hash on backend
    this.forgotPasswordToken = crypto.createHash('sha256').update(forgotToken).digest('hex');

    //set expire
    this.forgotPasswordExpire = Date.now() + 10 * 60 * 1000;

    return forgotToken;
};


module.exports = mongoose.model('User', userSchema);
