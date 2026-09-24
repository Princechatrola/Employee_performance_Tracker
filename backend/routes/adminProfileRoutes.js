const express = require("express");

const router = express.Router();

const { getAdminProfile,} = require("../controllers/adminProfileController");

// GET ADMIN PROFILE
router.get("/:id", getAdminProfile);

module.exports = router;