const Link = require("../models/Link");
const shortid = require("shortid");
const validUrl = require("valid-url");

// 🔹 Dashboard - fetch all links belonging to logged-in user
exports.getAllLinks = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");

    const links = await Link.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    const baseURL = req.protocol + "://" + req.get("host");
    res.render("TinyLink/dashboard.ejs", { links, baseURL });
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while fetching links");
    res.redirect("/");
  }
};

// 🔹 Create Short Link
exports.createLink = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");

    const { fullURL, shortId } = req.body;

    // Input long URL validation
    if (!fullURL || fullURL.trim() === "") {
      req.flash("error", "URL cannot be empty");
      return res.redirect("/");
    }

    if (!validUrl.isWebUri(fullURL)) {
      req.flash("error", "Enter a valid URL");
      return res.redirect("/");
    }

    // Check if URL already shortened for same user
    const existingURL = await Link.findOne({ fullURL, user: req.user._id });
    if (existingURL) {
      req.flash("info", "Short link for this URL already exists");
      return res.redirect("/");
    }

    let finalShortId;

    // 📌 Custom short code handling
    if (shortId && shortId.trim() !== "") {
      const cleanShort = shortId.trim().toLowerCase();

      // Allowed: a-z, A-Z, 0-9, -, _
      const validPattern = /^[a-zA-Z0-9_-]+$/;
      if (!validPattern.test(cleanShort)) {
        req.flash("error", "Custom short code contains invalid characters");
        return res.redirect("/");
      }

      // Check duplicate shortId
      const exists = await Link.findOne({ shortId: cleanShort });
      if (exists) {
        req.flash("error", "This short code is already taken, try another one");
        return res.redirect("/");
      }

      finalShortId = cleanShort;
    } else {
      // If no custom code → auto-generate
      finalShortId = shortid.generate();
    }

    // Create new record
    const newLink = new Link({
      user: req.user._id,
      fullURL,
      shortId: finalShortId,
      clicks: 0,
    });

    await newLink.save();

    req.flash("success", "Short link created successfully!");
    res.redirect("/");
  } catch (err) {
    console.error(err);
    req.flash("error", "Could not create link");
    res.redirect("/");
  }
};

// 🔹 Redirect Short URL
exports.redirectToLongUrl = async (req, res) => {
  try {
    const { shortId } = req.params;
    const link = await Link.findOne({ shortId });

    if (!link) return res.status(404).send("Invalid Short URL");

    // Increase click count
    link.clicks++;
    await link.save();

    res.redirect(link.fullURL);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error while redirecting");
  }
};

exports.getStats = async (req, res) => {
  try {
    const { id } = req.params;
    const link = await Link.findById(id);

    if (!link) {
      req.flash("error", "Link not found");
      return res.redirect("/");
    }

    res.render("TinyLink/stats.ejs", { link });
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong fetching stats");
    res.redirect("/");
  }
};

exports.deleteLink = async (req, res) => {
  try {
    const { id } = req.params;

    // sirf apne links delete kar sakta 🛡
    const link = await Link.findOne({ _id: id, user: req.user._id });

    if (!link) {
      req.flash("error", "Link not found or unauthorized!");
      return res.redirect("/stats");
    }

    await Link.findByIdAndDelete(id);
    req.flash("success", "Link deleted successfully");
    res.redirect("/stats");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while deleting link");
    res.redirect("/stats");
  }
};

exports.updateLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullURL, customShortId } = req.body;

    const link = await Link.findOne({ _id: id, user: req.user._id });
    if (!link) {
      req.flash("error", "Link not found or unauthorized!");
      return res.redirect("/stats");
    }

    // If custom short code already exists (except this current link)
    const conflict = await Link.findOne({
      shortId: customShortId,
      _id: { $ne: id },
    });

    if (conflict) {
      req.flash("error", "This custom short code is already taken!");
      return res.redirect("/stats");
    }

    link.fullURL = fullURL;
    link.shortId = customShortId;
    await link.save();

    req.flash("success", "Link updated successfully!");
    res.redirect("/stats");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while updating");
    res.redirect("/stats");
  }
};
