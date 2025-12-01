const mongoose = require("mongoose");
const User = require("../models/user.js");
const Link = require("../models/Link.js");

const MONGO_URL = "abcd";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {};

initDB();
