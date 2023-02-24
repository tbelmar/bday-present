const express = require("express");
const app = express();
const http = require("http").Server(app);
const cors = require("cors");
const { Deliverer } = require("bday-present");

const PORT = 5000;

app.use(cors());

const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  Deliverer.setup(io.sockets, socket);

  socket.on("send_delivery", (msg) => {
    io.sockets.emit("receive_delivery", msg);
  });
});

app.get("/", (req, res) => {
  res.send("welcome to our server");
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
