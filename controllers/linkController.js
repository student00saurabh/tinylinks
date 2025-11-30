const Link = require("../models/Link");
const shortid = require("shortid");
const validUrl = require("valid-url");
const geoip = require("geoip-lite");
const userAgent = require("ua-parser-js");
const crypto = require("crypto");

// Controller: publickLinks
module.exports.publickLinks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // default page 1
    const limit = 20; // links per page
    const skip = (page - 1) * limit;

    const totalLinks = await Link.countDocuments({ private: false });
    const links = await Link.find({ private: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalLinks / limit);

    res.render("TinyLink/links.ejs", {
      links,
      currentPage: page,
      totalPages,
      baseURL: "https://tl-hsxa.onrender.com",
    });
  } catch (err) {
    console.error(err);
    res.render("TinyLink/links.ejs", {
      links: [],
      currentPage: 1,
      totalPages: 1,
      baseURL: "",
    });
  }
};

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

    const { fullURL, shortId, private, encrypted } = req.body;

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

      const validPattern = /^[a-zA-Z0-9_-]+$/;
      if (!validPattern.test(cleanShort)) {
        req.flash("error", "Custom short code contains invalid characters");
        return res.redirect("/");
      }

      const exists = await Link.findOne({ shortId: cleanShort });
      if (exists) {
        req.flash("error", "This short code is already taken, try another one");
        return res.redirect("/");
      }

      finalShortId = cleanShort;
    } else {
      finalShortId = shortid.generate();
    }

    const newLink = new Link({
      user: req.user._id,
      shortId: finalShortId,
      clicks: 0,
      private: private === "on",
    });

    // 🔒 Encryption
    if (encrypted === "on") {
      const algorithm = "aes-256-cbc";
      const key = crypto.scryptSync(process.env.SECRET, "salt", 32);
      const iv = crypto.randomBytes(16);

      const cipher = crypto.createCipheriv(algorithm, key, iv);
      let encryptedData = cipher.update(fullURL, "utf8", "hex");
      encryptedData += cipher.final("hex");

      newLink.fullURL = encryptedData;
      newLink.encrypted = true;
      newLink.iv = iv.toString("hex");
    } else {
      newLink.fullURL = fullURL;
      newLink.encrypted = false;
    }

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

    // 🔹 Decrypt if needed
    let targetURL = link.fullURL;
    if (link.encrypted) {
      const algorithm = "aes-256-cbc";
      const key = crypto.scryptSync(process.env.SECRET, "salt", 32);
      const decipher = crypto.createDecipheriv(
        algorithm,
        key,
        Buffer.from(link.iv, "hex")
      );
      targetURL = decipher.update(link.fullURL, "hex", "utf8");
      targetURL += decipher.final("utf8");
    }

    // 🔹 Advanced Analytics
    const ip = req.ip;
    const geo = geoip.lookup(ip) || {};
    const ua = userAgent(req.headers["user-agent"]);

    link.clicks++;
    link.clickHistory.push({
      ip,
      country: geo.country || "Unknown",
      platform: ua.os.name || "Unknown",
      browser: ua.browser.name || "Unknown",
      userAgent: req.headers["user-agent"],
      timestamp: new Date(),
    });

    await link.save();

    res.redirect(targetURL);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error while redirecting");
  }
};

// 🔹 Stats, Delete, Update (unchanged)
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
    const { fullURL, customShortId, private } = req.body;

    const link = await Link.findOne({ _id: id, user: req.user._id });
    if (!link) {
      req.flash("error", "Link not found or unauthorized!");
      return res.redirect("/stats");
    }

    // ❗ Check custom short code conflict with any other link
    const conflict = await Link.findOne({
      shortId: customShortId,
      _id: { $ne: id },
    });

    if (conflict) {
      req.flash("error", "This custom short code is already taken!");
      return res.redirect("/stats");
    }

    // Update required fields
    link.fullURL = fullURL;
    link.shortId = customShortId;
    link.private = private === "on";

    await link.save();

    req.flash("success", "Link updated successfully!");
    res.redirect("/stats");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while updating");
    res.redirect("/stats");
  }
};
