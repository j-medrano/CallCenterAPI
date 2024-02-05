const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  var token = req.header("auth-token");
  if (!token) {
    token = req.query.token;
    if (!token) {
      console.log("no token");
      return res.status(401).redirect("/api/user");
    }
  }
  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    console.log("error verifying");
    res.status(400).redirect("/api/user");
  }
};
