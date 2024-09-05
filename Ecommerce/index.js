require('dotenv').config();
const app = require('./app');
const connectWithDB = require('./config/db');
const cloudinary = require('cloudinary');

connectWithDB();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

app.listen(process.env.PORT, () => {
    console.log('Server is up on port ' + process.env.PORT);
})