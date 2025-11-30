const express = require("express");
const router = express.Router();
const linkController = require("../controllers/linkController");
const { isLoggedIn } = require("../middleware");

// ⭐ Show all links belonging to logged-in user
router.get("/", isLoggedIn, linkController.getAllLinks);
router.get("/public-links", linkController.publickLinks);

// ⭐ Create short link
router.post("/", isLoggedIn, linkController.createLink);

// ⭐ Redirect short link to original URL
router.get("/:shortId", linkController.redirectToLongUrl);

router.get("/:code", linkController.getStats);

router
  .route("/:id")
  .delete(isLoggedIn, linkController.deleteLink)
  .put(isLoggedIn, linkController.updateLink);

module.exports = router;
