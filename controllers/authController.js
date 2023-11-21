const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");

function handleErrors(err) {
  let errors = {
    email: "",
    password: " ",
  };

  if ((err.messge = "incorrect email"))
    errors.email = "This email is not registered";

  if ((err.messge = "incorrect password")) errors.email = "Incorrect Password";

  if (err.code === 11000) {
    errors.email = "Email already in use";
    return errors;
  }

  if (err.message.includes("user validation failed")) {
    Object.values(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
}

const createToken = function (id) {
  return jwt.sign({ id }, "ThomasShelby", { expiresIn: 2 * 24 * 60 * 60 });
};

module.exports.signup_get = (req, res, next) => {
  res.render("signup");
};

module.exports.login_get = (req, res, next) => {
  res.render("login");
};

module.exports.signup_post = async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    const user = await User.create(req.body);
    const token = createToken(user._id);
    res
      .cookie("jwt", token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 2 })
      .status(201)
      .json({
        success: true,
        user: user._id,
      });
  } catch (err) {
    console.log(err);
    const errors = handleErrors(err);
    res.status(400).json(errors);
  }
};

module.exports.login_post = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res
      .cookie("jwt", token, { maxAge: 1000 * 60 * 60 * 24 * 2, httpOnly: true })
      .status(200)
      .json({ user: user._id });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
  }
};

module.exports.logout_get = async (req, res, next) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};
