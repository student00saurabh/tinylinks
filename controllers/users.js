const User = require("../models/user.js");
const crypto = require("crypto");

// Load .env during development
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const brevo = require("@getbrevo/brevo");
const emailApi = new brevo.TransactionalEmailsApi();
emailApi.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

async function sendVerificationOTP(user) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.otp = otp;
  user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  const htmlContent = `
  <div style="
    font-family: Arial, sans-serif; 
    background: linear-gradient(to right, #d4f8d4, #eaffea, #d4f8d4);
    padding: 30px;
  ">
    <div style="
      max-width: 600px; margin: auto;
      background: rgba(255, 255, 255, 0.45);
      border-radius: 16px;
      padding: 30px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.4);
    ">
      <div style="text-align: center;">
        <img 
          src="https://tl-hsxa.onrender.com/images/logo.png" 
          alt="Logo"
          style="height: 65px; margin-bottom: 10px;"
        >
        <h2 style="color: #0b7a3e;">Verify Your Email</h2>
        <p style="color: #3b4d3b;">TinyLinks — Secure & Fast URL Shortening</p>
      </div>

      <hr style="border: none; border-top: 1px solid #c8e6c9; margin: 20px 0;">

      <p style="font-size: 16px;">Hi <strong>${user.name}</strong>,</p>
      <p style="color:#2f4f2f; font-size: 15px;">
        Thank you for joining TinyLinks!  
        Use the OTP below to verify your email and activate your account.
      </p>

      <div style="text-align:center; margin:30px 0;">
        <div style="
          font-size: 32px; 
          font-weight: bold;
          letter-spacing: 6px;
          padding: 12px 20px;
          background: #0b7a3e;
          color: white;
          border-radius: 12px;
          display: inline-block;
        ">
          ${otp}
        </div>
      </div>

      <p style="color:#4f6b4f; font-size: 14px;">
        This OTP is valid for <strong>10 minutes</strong>.
      </p>

      <hr style="border: none; border-top: 1px solid #c8e6c9; margin: 20px 0;">

      <p style="text-align:center; font-size:12px; color:#6e866e;">
        This is an automated message. Do not reply.<br>
        © ${new Date().getFullYear()} TinyLinks — All Rights Reserved.
      </p>
    </div>
  </div>
  `;

  await emailApi.sendTransacEmail({
    sender: { email: "student001599@gmail.com", name: "TinyLinks" },
    to: [{ email: user.email }],
    subject: "Verify Your Email - TinyLinks",
    htmlContent,
  });

  return otp;
}

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
  try {
    let { name, email, password } = req.body;
    const newUser = new User({ email, name });

    const registeredUser = await User.register(newUser, password);

    req.flash("success", "OTP sent to your email. Please verify your email.");
    res.redirect(`/verify-email?email=${email}`);
    // req.login(registeredUser, async (err) => {
    //   if (err) {
    //     return next(err);
    //   }
    //   req.flash("success", "Thanks for joining TinyLinks");
    //   res.redirect("/");
    // });
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

module.exports.renderVerifyEmailForm = async (req, res) => {
  const { email } = req.query;
  if (!email) return res.redirect("/login");
  const user = await User.findOne({ email: email });
  await sendVerificationOTP(user);
  res.render("emailer/otp.ejs", { user });
};

module.exports.verifyEmail = async (req, res) => {
  const { otp } = req.body;
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    req.flash("error", "Invalid request.");
    return res.redirect("/signup");
  }

  if (user.isVerified) {
    req.flash("info", "Email already verified.");
    return res.redirect("/login");
  }

  if (user.otp !== otp || user.otpExpires < Date.now()) {
    req.flash("error", "Invalid or expired OTP.");
    return res.redirect(`/verify-email?email=${email}`);
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  req.login(user, (err) => {
    if (err) return next(err);
    req.flash("success", "Email verified successfully!");
    res.redirect("/");
  });
};

module.exports.resendOtp = async (req, res) => {
  try {
    const { id } = req.params; // user id from URL
    const user = await User.findById(id);
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/signup");
    }

    await sendVerificationOTP(user); // send new OTP

    req.flash("success", "A new OTP has been sent to your email.");
    res.redirect(`/verify-email?email=${user.email}`);
  } catch (err) {
    console.log(err);
    req.flash("error", "Failed to send OTP. Try again.");
    res.redirect("back");
  }
};
