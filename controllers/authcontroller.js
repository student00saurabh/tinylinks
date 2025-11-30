const crypto = require("crypto");
const User = require("../models/user.js");

// Load .env during development
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// ─────────────────────────────────────────
// BREVO EMAIL SETUP (GLOBAL CONFIG)
// ─────────────────────────────────────────
const brevo = require("@getbrevo/brevo");
const emailApi = new brevo.TransactionalEmailsApi();
emailApi.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

// ─────────────────────────────────────────
// RENDER EMAIL FORM
// ─────────────────────────────────────────
module.exports.restform = (req, res) => {
  res.render("emailer/emailSent.ejs", {
    message: "Enter an existing email id!",
    alertmsg: false,
  });
};

// ─────────────────────────────────────────
// FORGOT PASSWORD → GENERATE TOKEN + SEND EMAIL
// ─────────────────────────────────────────
module.exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.render("emailer/emailSent.ejs", {
        message: "Make sure, this is a correct email id!",
        alertmsg: true,
      });
    }

    // Create secure token
    const token = crypto.randomBytes(20).toString("hex");

    // Token + Expiry (1 hour)
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    // Auto-detect domain
    const domain =
      process.env.DOMAIN ||
      (process.env.NODE_ENV === "production"
        ? "https://tl-hsxa.onrender.com"
        : "http://localhost:3000");

    const resetLink = `${domain}/reset-password/${token}`;

    // ─────────────────────────────────────────
    // BEAUTIFUL EMAIL TEMPLATE
    // ─────────────────────────────────────────
    const htmlContent = `
  <div style="
    font-family: Arial, sans-serif; 
    background: linear-gradient(to right, #d4f8d4, #eaffea, #d4f8d4);
    padding: 30px;
  ">
    <div style="
      max-width: 600px;
      margin: auto;
      background: rgba(255, 255, 255, 0.45);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 30px;
      border: 1px solid rgba(255,255,255,0.4);
      box-shadow: 0 6px 25px rgba(0,0,0,0.12);
    ">

      <!-- Header -->
      <div style="text-align: center;">
        <img 
          src="https://tl-hsxa.onrender.com/images/logo.png" 
          alt="Logo"
          style="height: 65px; margin-bottom: 10px;"
        >
        <h2 style="color: #0b7a3e; font-size: 24px; margin: 0;">
          Reset Your Password
        </h2>
        <p style="color: #3b4d3b; font-size: 14px; margin-top: 4px;">
          TinyLinks — Secure & Fast URL Shortening
        </p>
      </div>

      <hr style="border: none; border-top: 1px solid #c8e6c9; margin: 20px 0;">

      <!-- Greeting -->
      <p style="color: #1a1a1a; font-size: 16px;">
        Hi <strong>${user.name || "User"}</strong>,
      </p>

      <p style="color: #2f4f2f; font-size: 15px; line-height: 1.6;">
        We received a request to reset your TinyLinks password.  
        Click the button below to create a new password.
      </p>

      <!-- Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}"
          style="
            background: #0b7a3e;
            color: #ffffff;
            padding: 12px 30px;
            text-decoration: none;
            font-weight: bold;
            border-radius: 10px;
            display: inline-block;
            font-size: 16px;
          "
        >
          Reset Password
        </a>
      </div>

      <p style="color: #4f6b4f; font-size: 14px; line-height: 1.6;">
        This link will remain active for <strong>1 hour</strong>.
      </p>

      <p style="color: #4f6b4f; font-size: 14px;">
        If the button above doesn’t work, copy and paste this link in your browser:
      </p>

      <p style="word-break: break-all;">
        <a href="${resetLink}" style="color:#0b7a3e; font-size: 14px;">
          ${resetLink}
        </a>
      </p>

      <hr style="border: none; border-top: 1px solid #c8e6c9; margin: 20px 0;">

      <p style="text-align: center; color: #6e866e; font-size: 12px;">
        This is an automated message. Do not reply.<br>
        © ${new Date().getFullYear()} TinyLinks — All Rights Reserved.
      </p>

    </div>
  </div>
`;

    // Send Email
    await emailApi.sendTransacEmail({
      sender: { email: "student001599@gmail.com", name: "TinyLinks" },
      to: [{ email }],
      subject: "Reset Your Password | TinyLinks",
      htmlContent,
    });

    req.flash("success", "Password reset link has been sent to your email.");
    res.redirect("/login");
  } catch (err) {
    console.error("Brevo Email Error:", err);
    req.flash("error", "Error sending email. Try again.");
    res.redirect("/login");
  }
};

// ─────────────────────────────────────────
// SHOW RESET FORM
// ─────────────────────────────────────────
module.exports.getResetPassword = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    req.flash("error", "Reset link is invalid or expired.");
    return res.redirect("/login");
  }

  res.render("emailer/reset.ejs", { token: req.params.token });
};

// ─────────────────────────────────────────
// SUBMIT NEW PASSWORD
// ─────────────────────────────────────────
module.exports.postResetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    req.flash("error", "Reset link is invalid or expired.");
    return res.redirect("/login");
  }

  // Passport-local-mongoose method
  user.setPassword(password, async (err, updatedUser) => {
    if (err) {
      req.flash("error", "Something went wrong. Try again!");
      return res.redirect("/login");
    }

    updatedUser.resetPasswordToken = undefined;
    updatedUser.resetPasswordExpires = undefined;

    await updatedUser.save();

    req.flash("success", "Password updated successfully!");
    res.redirect("/login");
  });
};
