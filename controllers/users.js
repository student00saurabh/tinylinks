const User = require("../models/user.js");

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res) => {
  try {
    let { username, name, email, password } = req.body;
    const newUser = new User({ username, email, name });

    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, async (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Start Chat!");
      res.redirect("/");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  if (req.user) {
    return res.redirect("/");
  } else {
    res.render("users/login.ejs");
  }
};

module.exports.login = async (req, res) => {
  req.flash("success", "Happy to see you again!");
  let redirectUrl = res.locals.redirectUrl || "/";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out!");
    res.redirect("/login");
  });
};
