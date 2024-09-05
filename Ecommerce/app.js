require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

//import all the routes
const home = require("./routes/home");
const user = require("./routes/user");
const product = require("./routes/product");
const payment=require("./routes/payment");
const order=require("./routes/order");


//create app
const app = express();

//for swagger documentation
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//morgan middleware
app.use(morgan("tiny"));

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

//cookies and file upload
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

//use all the routes
app.use("/api/v1", home);
app.use("/api/v1", user);
app.use("/api/v1", product);
app.use("/api/v1", payment);
app.use("/api/v1", order);


//for views and static files
app.get("/signuptest", (req, res) => {
  res.render("signuptest");
});


//export default app;
module.exports = app;
