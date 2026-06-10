const express = require("express");
const passport = require("passport");
const { googleCallback, finalizeGoogle } = require("../controllers/googleAuth.controller");

const router = express.Router();

// Step 1: Redirect to Google for login
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// Step 2: Google redirects back to your app with tokens
router.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: "/auth/failure",
    }),
    googleCallback
);

// Step 3: Finalize Google login/signup after user selects email
router.post("/google/finalize", finalizeGoogle);

// Google auth failure route handler
router.get("/failure", (_req, res) => {
    res.status(401).json({
        success: false,
        message: "Google authentication failed"
    });
});

module.exports = router;