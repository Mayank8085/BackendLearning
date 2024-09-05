const mongoose = require("mongoose");

const { MONGO_DB } = process.env;

exports.connect = () => {
  mongoose
    .connect(MONGO_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });
};
