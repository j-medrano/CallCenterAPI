const router = require("express").Router();
const verify = require("./verifyToken");
const path = require("path");

router.get("/", verify, (req, res) => {
  // Send the HTML file in the response
  res.status(200);
  res.sendFile(path.join(__dirname, "..", "views", "admin.html"));
});

module.exports = router;
