const express = require("express");
require("dotenv").config();
require("./db");
const clc = require("cli-color");
const session = require("express-session");
const mongoDbSession = require("connect-mongodb-session")(session);

// Constants
const app = express();
const PORT = process.env.PORT || 8000;
const store = new mongoDbSession({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

// File imports
const AuthRouter = require("./Controllers/AuthController");
const BlogRouter = require("./Controllers/BlogController");
const { isAuth } = require("./Middlewares/AuthMiddleware");
const FollowRouter = require("./Controllers/FollowController");

// Global Middlewares
app.use(express.json());
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store,
  })
);

// Routers
app.use("/auth", AuthRouter);
app.use("/blog",isAuth, BlogRouter);
app.use("/follow",isAuth, FollowRouter);

app.get("/", (req, res) => {
  return res.send({
    status: 200,
    message: "BlogServer is running",
  });
});

app.listen(PORT, () => {
  console.log(
    clc.yellow(`Server is running on: `),
    clc.underline.yellow.bold(`http://localhost:${PORT}`)
  );
});
