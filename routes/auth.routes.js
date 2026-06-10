const express = require("express");
const router = express.Router();
const { signup, login, logout, refresh } = require("../controllers/auth.controller");
const {
  authLimiter,
  loginLimiter,
} = require("../middlewares/rateLimiter.middleware");
const { authMiddleware } = require("../middlewares/auth.middleware");

// Apply rate limits to authentication endpoints to mitigate abuse
router.post("/signup", authLimiter, signup);
router.post("/login", loginLimiter, login);
router.post("/logout", authLimiter, logout);
router.post("/refresh", authMiddleware, refresh);

module.exports = router;
