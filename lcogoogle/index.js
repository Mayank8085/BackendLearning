const express = require("express");
const mongoose = require("mongoose");
const auth =require("./router/auth");
// require('./passport/passport');
const passport = require("passport");
const passportConfig= require("./passport/passportConfig");
const cookieSession = require("cookie-session");

const app = express();



app.set("view engine", "ejs");

mongoose
  .connect(
    "mongodb+srv://sahu:1234@cluster0.kjere.mongodb.net/myAuth?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("DATABASE CONNECTED"))
  .catch((err) => console.log(err));

  app.use(
    cookieSession({
      maxAge: 3 * 24 * 60 * 60 * 1000,
      keys: ["thisislcotokenkey"], // dotenv
    })
  );

app.use(passport.initialize());
app.use(passport.session());

const isLoggedIn = (req, res, next) => {
  if (!req.user) {
    res.redirect("/auth/login");
  }
  next();
};

app.use("/auth", auth);
app.get("/",isLoggedIn, (req, res) => {
  res.render("home");
});

app.listen(4000, () => {
  console.log("Server started on port 4000");
});
