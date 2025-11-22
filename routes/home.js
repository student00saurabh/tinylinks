const express = require("express");
const router = express.Router();
const homeController = require("../controllers/home.js");
const { isLoggedIn } = require("../middleware");

router.get("/", isLoggedIn, homeController.index);
router.get("/profile", isLoggedIn, homeController.profile);
router.get("/healthcheck", homeController.dashBoard);

module.exports = router;
