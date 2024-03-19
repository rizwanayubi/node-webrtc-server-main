const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("cookie-session");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const { ExpressPeerServer } = require("peer");
const db = require("./config/db");
const mainRouting = require("./routes/main-routing");
const externalApiRoutes = require("./routes/api-routes");

const peerServer = ExpressPeerServer(server, {
  debug: true,
});

// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//   );
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
//   next();
// });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/peerjs", peerServer);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(
  session({
    secret: "super_secret_session_key",
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/", mainRouting);
app.use("/api", externalApiRoutes);

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({
    message: error.message || "Something went wrong, please try again!",
  });
});

console.log("\x1b[33m%s\x1b[0m", "HELLO THIS IS THE CONSOLE LOG");
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    console.log(
      "\x1b[33m%s\x1b[0m",
      "HELLO THIS IS THE CONSOLE LOG, AND ITS WORKING"
    );
    console.log("\x1b[33m%s\x1b[0m", userId);
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);
    // messages
    socket.on("message", (message) => {
      //send message to the same room
      io.to(roomId).emit("createMessage", message);
    });

    socket.on("disconnect", () => {
      socket.broadcast.to(roomId).emit("user-disconnected", userId);
    });
  });
});

const port = process.env.PORT || 3000;

db.sync()
  .then(() => {
    server.listen(port, () => {
      console.log(`🚀 📘 🚀 Server is running on port ${port} 🚀 📘 🚀`);
    });
  })
  .catch((err) => console.log(err));
