if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const crypto = require("crypto");
const Link = require("./models/Link.js");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const healthRouter = require("./routes/healthRoutes.js");
const linkRouter = require("./routes/linkRoutes.js");
const homeRouter = require("./routes/home.js");
const userRouter = require("./routes/user.js");
const resetRout = require("./routes/authRoutes.js");

const dbUrl = process.env.ATLUSDB_URL;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
});

store.on("error", (err) => {
  console.log("error in mongo session store", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

app.set("trust proxy", 1);

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new LocalStrategy({ usernameField: "email" }, User.authenticate())
);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.DOMAIN + "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let email = profile.emails[0].value;
        let name = profile.displayName;

        // Check existing user
        let existingUser = await User.findOne({ email });

        if (existingUser) {
          return done(null, existingUser);
        }

        // Create new user
        let newUser = new User({
          name,
          email,
          googleId: profile.id,
          isVerified: true,
        });

        await newUser.save();
        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  res.locals.currentPath = req.path;
  next();
});

app.get("/", async (req, res, next) => {
  if (!req.user) {
    const totalUrls = await Link.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalClicks = await Link.aggregate([
      { $group: { _id: null, clicks: { $sum: "$clicks" } } },
    ]);
    res.render("TinyLink/index.ejs", {
      totalUrls,
      totalUsers,
      totalClicks: totalClicks[0]?.clicks || 0,
    });
  } else {
    next();
  }
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Logged in using Google!");
    res.redirect("/");
  }
);

app.use("/", userRouter);
app.use("/", homeRouter);
app.use("/", resetRout);
app.use("/stats", linkRouter);
app.use("/healthz", healthRouter);

app.all(/.*/, (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err); // agar response already sent ho, dobara send mat karo
  }
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message, statusCode });
});

app.listen(3000, () => {
  console.log(`TinyLinks is working at ${3000}`);
});
