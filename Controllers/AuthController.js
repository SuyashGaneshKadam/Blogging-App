const express = require("express");
const { validateRegisterData } = require("../Utils/AuthUtil");
const User = require("../Models/UserModel");
const AuthRouter = express.Router();
const bcrypt = require("bcryptjs");
const { isAuth } = require("../Middlewares/AuthMiddleware");

AuthRouter.post("/register", async (req, res) => {
  const { name, email, username, password } = req.body;
  // console.log(name, email, username, password);

  // Data validation
  try {
    await validateRegisterData({ name, username, email, password });
  } catch (err) {
    return res.send({
      status: 400,
      message: "Invalid data",
      error: err,
    });
  }

  try {
    // Checking if email or username already exists
    await User.usernameOrEmailExists({ email, username });

    // Saving user
    const obj = new User(req.body);
    // console.log(obj);
    const userDb = await obj.registerUser();
    return res.send({
      status: 201,
      message: "Registration successful",
      data: userDb,
    });
  } catch (err) {
    return res.send({
      status: 500,
      message: "Database error",
      error: err,
    });
  }
});

AuthRouter.post("/login", async (req, res) => {
  const { loginId, password } = req.body;
  // console.log(loginId, password);

  // Validation
  if (!loginId.trim() || !password.trim()) {
    return res.send({
      status: 400,
      message: "Missing credentials",
    });
  }

  // Find the user with Login ID
  try {
    const userDb = await User.findUserWithLoginId({ loginId });
    // console.log(userDb);

    // Checking if passwords match
    const isMatched = await bcrypt.compare(password, userDb.password);
    if (!isMatched) {
      return res.send({
        status: 400,
        message: "Incorrect password",
      });
    }

    // Creating session
    req.session.isAuth = true;
    req.session.user = {
      userId: userDb._id,
      email: userDb.email,
      username: userDb.username,
    };

    return res.send({
      status: 200,
      message: "Login successful",
      data: userDb,
    });
  } catch (err) {
    console.log(err);
    return res.send({
      status: 500,
      message: "Database error",
      error: err,
    });
  }
});

AuthRouter.post("/logout", isAuth, async (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.send({ status: 400, message: "Logout unsuccessful" });
    return res.send({ status: 200, message: "Logout successful" });
  });
});
module.exports = AuthRouter;
