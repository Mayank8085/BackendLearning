const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    googleId: String,
});

module.exports = mongoose.model('User', userSchema);