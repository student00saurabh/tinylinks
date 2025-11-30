const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpires: {
      type: Date,
    },
    otp: String,
    otpExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isBlocked: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Passport-local plugin
userSchema.plugin(passportLocalMongoose, {
  usernameField: "email",
  limitAttempts: true,
  maxAttempts: 3,
  interval: 100,
  maxInterval: 300000,
  unlockInterval: 60000,
  errorMessages: {
    MissingPasswordError: "No password was given",
    AttemptTooSoonError: "Account is currently locked. Try again later",
    TooManyAttemptsError:
      "Too many unsuccessful login attempts. Please try again in 5 minutes.",
    NoSaltValueStoredError: "Authentication failed. No salt value stored",
    IncorrectPasswordError: "Invalid email or password",
    IncorrectUsernameError: "Invalid email or password",
    MissingUsernameError: "Email is required",
    UserExistsError: "This email is already registered!",
  },
});

module.exports = mongoose.model("User", userSchema);
