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

module.exports.about = (req, res) => {
  res.render("others/about.ejs");
};
module.exports.privacy = (req, res) => {
  res.render("others/privacy.ejs");
};
module.exports.terms = (req, res) => {
  res.render("others/terms.ejs");
};

module.exports.getSitemap = (req, res) => {
  const baseUrl = "https://tl-hsxa.onrender.com"; // change to your domain

  const sitemap = `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${baseUrl}/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>

      <url>
        <loc>${baseUrl}/login</loc>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
      </url>

      <url>
        <loc>${baseUrl}/signup</loc>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
      </url>

      <url>
        <loc>${baseUrl}/stats/public-links</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>

      <url>
        <loc>${baseUrl}/about</loc>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
      </url>

      <url>
        <loc>${baseUrl}/privacy-policy</loc>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
      </url>

      <url>
        <loc>${baseUrl}/terms-&-conditions</loc>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
      </url>

      <url>
        <loc>${baseUrl}/stats</loc>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
      </url>
    </urlset>
  `.trim();

  res.header("Content-Type", "application/xml");
  res.send(sitemap);
};

module.exports.getAdsTxt = (req, res) => {
  const adsText = `
    google.com, pub-1329737604469399, DIRECT, f08c47fec0942fa0
  `.trim();

  res.header("Content-Type", "text/plain");
  res.send(adsText);
};

exports.getRobotsTxt = (req, res) => {
  const robots = `
    User-agent: *
    Allow: /

    Sitemap: https://tl-hsxa.onrender.com/sitemap.xml
  `.trim();

  res.header("Content-Type", "text/plain");
  res.send(robots);
};
