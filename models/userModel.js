const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: [true, "email already in use"],
    lowercase: true,
    validate: [isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please enter the password"],
    minlength: [6, "password must container more than 6 characters"],
  },
});

userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.hash(password, user.password);
    if (auth) return user;
    throw Error("Incorrect Password ");
  }
  throw Error("Incorrect Email");
};

const User = mongoose.model("User", userSchema);

module.exports = User;
