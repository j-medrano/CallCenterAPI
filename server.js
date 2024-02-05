var express = require("express");
const dotenv = require("dotenv");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: { origin: "*" },
  transports: ["websocket"],
});
//import routes
const authRoute = require("./routes/auth");
const adminRouteVerify = require("./routes/verifyToken");

//env file
dotenv.config();
//connect to DB
mongoose
  .connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("connected to db"))
  .catch((e) => console.log(e));

//route middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.use("/api/user", authRoute);

app.get("/", (req, res) => {
  res.status(200);
  res.redirect("/api/admin");
});

app.get("/api/user", (req, res) => {
  res.status(200);
  res.sendFile(__dirname + "/views/login.html");
});

app.get("/api/admin", adminRouteVerify, (req, res) => {
  res.status(200);
  console.log("admin requested");
  res.sendFile(__dirname + "/views/admin.html");
});

app.post("/api/data", adminRouteVerify, (req, res) => {
  io.emit("request", JSON.stringify(req.body));
  res.status(200).send(req.body);
});

server.listen(3000, () => {
  console.log("server running...");
});

io.on("connection", (client) => {
  console.log("Connected: " + client.id);
  client.on("disconnect", (reason) => {
    console.log("Client disconnected - " + reason);
  });
});

io.on("disconnect", (client) => {
  console.log("Socket disconnected");
});
