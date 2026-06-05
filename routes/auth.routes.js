const express = require("express");
const router = express.Router();
const { signup, login, logout } = require("../controllers/auth.controller");
const {
  authLimiter,
  loginLimiter,
} = require("../middleware/rateLimiter.middleware");

// Apply rate limits to authentication endpoints to mitigate abuse
router.post("/signup", authLimiter, signup);
router.post("/login", loginLimiter, login);
router.post("/logout", authLimiter, logout);

module.exports = router;
