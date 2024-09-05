const bigPromise= require("../middlewares/bigPromise");

exports.home = bigPromise(
    (req, res) => {
        res.status(200).json({
            success: true,
            message: 'Welcome to the Ecommerce API'
        });
    }
)

exports.homeDummy = (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Dummy Welcome to the Ecommerce API'
    });
};