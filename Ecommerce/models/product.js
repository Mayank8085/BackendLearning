const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [50, 'Product name cannot be more than 50 characters'],
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        maxlength:[5, 'Product price cannot be more than 5 digits']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
    },
    photos: [
        {
            id: {
                type: String,
                required: [true, 'Photo id is required'],
            },
            secure_url: {
                type: String,
                required: [true, 'Photo url is required'],
            },

        }
    ],
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum:{
            values:[
                'shortsleeves',
                'longsleeves',
                'sweatshirts',
                'hoodies'         
            ],
            message: 'Please choose category from the list'
        }
    },
    //this field was updated 
  stock: {
    type: Number,
    required: [true, "please add a number in stock"],
  },
    brand: {
        type: String,
        required: [true, 'Product brand is required'],
    },
    ratings:{
        type: Number,
        default: 0
    },
    NumberOfReviews:{
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: [true, 'User name is required'],
            },
            name: {
                type: String,
                required: true,
            },
            rating: {
                type: Number,
                required: true,
            },
            comment: {
                type: String,
                required: true,
            },
        }
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User name is required'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Product', productSchema);