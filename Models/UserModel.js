const bcrypt = require("bcryptjs");
const UserSchema = require("../Schemas/UserSchema");
const ObjectId = require("mongodb").ObjectId;

const User = class {
  name;
  email;
  username;
  password;
  constructor({ name, email, password, username }) {
    this.name = name.trim();
    this.email = email.trim();
    this.password = password.trim();
    this.username = username.trim();
  }
  registerUser() {
    return new Promise(async (resolve, reject) => {
      const hashedPassword = await bcrypt.hash(
        this.password,
        parseInt(process.env.SALT)
      );
      const userObj = new UserSchema({
        name: this.name,
        email: this.email,
        username: this.username,
        password: hashedPassword,
      });
      try {
        const userDb = await userObj.save();
        resolve(userDb);
      } catch (err) {
        reject(err);
      }
    });
  }
  static usernameOrEmailExists({ email, username }) {
    return new Promise(async (resolve, reject) => {
      const userData = await UserSchema.findOne({
        $or: [{ username: username }, { email: email }],
      });
      if (userData && email === userData.email) reject("Email already exists");
      if (userData && username === userData.username)
        reject("Username already exists");
      resolve();
    });
  }
  static findUserWithLoginId({ loginId }) {
    return new Promise(async (resolve, reject) => {
      try {
        const userDb = await UserSchema.findOne({
          $or: [{ email: loginId }, { username: loginId }],
        }).select("+password");
        if (!userDb) reject("User not found, please register");
        resolve(userDb);
      } catch (err) {
        reject(err);
      }
    });
  }
  static verifyUserId({ userId }) {
    return new Promise(async (resolve, reject) => {
      if (!ObjectId.isValid(userId)) {
        reject("Invalid User ID");
      }
      try {
        const userDb = await UserSchema.findOne({ _id: userId });
        if (!userDb) {
          reject("User does not exist");
        }
        resolve(userDb);
      } catch (err) {
        reject(err);
      }
    });
  }
};

module.exports = User;
