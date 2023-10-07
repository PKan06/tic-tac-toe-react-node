import express from "express";
const app = express();
import { Server } from "socket.io";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
dotenv.config(); // connect to env file and add the data in process.env
app.use(cors());
const serverURL = process.env.SERVERURL;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let connectCounter = 0;
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);
  connectCounter++;
  socket.on("join_room", (room) => {
    socket.join(room);
    // console.log(room)
  });
  // we will get user multiplayer data using user-move
  socket.on("user-move", (data) => {
    // console.log(data)
    // broadcasting the data
    // socket.broadcast.emit("receive_move",data);
    // broadcasting to the room
    const Data = { ...data, connectCounter };
    socket.to(data.room).emit("receive_move", Data);
  });
});

io.on("disconnect", function () {
  connectCounter--;
});

import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// console.log(path.resolve(__dirname, "../client/build"))
app.get("/", (req, res) => {
  app.use(express.static(path.resolve(__dirname, "../client/build")));
  res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});
server.listen(3001, () => {
  console.log(`SERVER IUS RUNNING AT ${serverURL}`);
});
