const Link = require("../models/Link");
const User = require("../models/user");

module.exports.index = async (req, res) => {
  try {
    // agar user login nahi ho toh login page dikhao
    if (!req.user) {
      return res.render("users/login.ejs");
    }

    const search = req.query.search || "";

    // search query apply karne ke liye
    const query = {
      user: req.user._id,
      $or: [
        { code: { $regex: search, $options: "i" } },
        { targetURL: { $regex: search, $options: "i" } },
      ],
    };

    const links = await Link.find(search ? query : { user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    const baseURL = req.protocol + "://" + req.get("host");

    res.render("TinyLink/home.ejs", {
      links,
      search,
      baseURL,
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Something went wrong!");
    res.redirect("/login");
  }
};

module.exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const links = await Link.find({ user: req.user._id });

    const totalLinks = links.length;
    const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);

    res.render("users/profile.ejs", {
      User: user,
      totalLinks,
      totalClicks,
      links,
    });
  } catch (err) {
    req.flash("error", "Unable to load profile");
    res.redirect("/");
  }
};

module.exports.dashBoard = (req, res) => {
  res.render("TinyLink/healthz.ejs");
};
