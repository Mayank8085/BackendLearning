const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    const token =
      req.cookies.token ||
      req.body.token ||
      eq.header("Authorization").replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({
        message: "You are not logged in",
      });
    }

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    console.log(decoded);
    req.user = decoded;
  } catch (error) {
    return res.status(401).send({ error: "Please authenticate" });
  }
  return next();
};

module.exports = auth;
