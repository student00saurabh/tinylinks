const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const linkSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fullURL: {
    type: String,
    required: true,
  },
  shortId: {
    type: String,
    required: true,
    unique: true,
  },
  private: {
    type: Boolean,
    default: true, // public by default
  },
  encrypted: {
    type: Boolean,
    default: false,
  },
  iv: String,
  clicks: {
    type: Number,
    default: 0,
  },
  clickHistory: [
    {
      ip: String,
      country: String,
      userAgent: String,
      browser: String,
      os: String,
      platform: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Link", linkSchema);
