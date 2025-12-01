const express = require("express");
const router = express.Router();
const homeController = require("../controllers/home.js");
const { isLoggedIn } = require("../middleware");

router.get("/", isLoggedIn, homeController.index);
router.get("/profile", isLoggedIn, homeController.profile);
router.get("/healthcheck", homeController.dashBoard);
router.get("/about", homeController.about);
router.get("/privacy-policy", homeController.privacy);
router.get("/terms-&-conditions", homeController.terms);
router.get("/sitemap.xml", homeController.getSitemap);
router.get("/ads.txt", homeController.getAdsTxt);
router.get("/robots.txt", homeController.getRobotsTxt);

module.exports = router;
