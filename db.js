const clc = require("cli-color");
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(clc.blue("Mongo DB Connected successfully"));
  })
  .catch((err) => {
    console.log(err);
  });
