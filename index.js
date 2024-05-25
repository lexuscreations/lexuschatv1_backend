import cors from "cors";
import http from "http";
import express from "express";
import { Server } from "socket.io";
import routes from "./routes/index.js";
import cookieParser from "cookie-parser";
import connectDB from "./services/database.js";
import { handleConnection } from "./controllers/socketController.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandlers.js";
import {
  getFE_URL,
  getSERVER_PORT,
  getPackageJsonAppName,
} from "./config/index.js";

const app = express();

const server = http.createServer(app);

const FE_URL = getFE_URL();
const SERVER_PORT = getSERVER_PORT();
const packageJsonAppName = getPackageJsonAppName();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [FE_URL],
    credentials: true,
  })
);

const io = new Server(server, {
  cors: {
    origin: [FE_URL],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => handleConnection(socket, io));

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.get("/", (req, res) =>
  res.send(`Hey there! 🚀 Welcome aboard ${packageJsonAppName}!`)
);
app.use("/ping", (req, res) => res.send("Pong"));

app.use("/api/v1/user", routes.userRoute);
app.use("/api/v1/message", routes.messageRoute);

app.use(notFoundHandler);
app.use(errorHandler);

connectDB().then(() =>
  server.listen(SERVER_PORT, () =>
    console.log(`🚀 Server-Listening-At-PORT: ${SERVER_PORT}`)
  )
);
