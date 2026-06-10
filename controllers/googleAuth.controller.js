const jwt = require("jsonwebtoken");
const User = require("../models/auth");
const { sendEmail } = require("../utilis/email.utils");
const { JWT_SECRET, FRONTEND_URL, NODE_ENV } = require("../config/config");

const googleCallback = async (req, res) => {
    try {
        const { googleId, username, emails } = req.user;

        // Create temporary token valid for 30 minutes
        const tempToken = jwt.sign(
            { googleId, username, emails },
            JWT_SECRET,
            { expiresIn: "30m" }
        );

        if (emails.length === 1) {
            // Only one email: skip "choose email" step
            const chosenEmail = emails[0];
            return res.redirect(
                `${FRONTEND_URL}/finalize-google?token=${tempToken}&chosenEmail=${encodeURIComponent(
                    chosenEmail
                )}`
            );
        }

        // Multiple emails: frontend will ask user to choose one
        return res.redirect(
            `${FRONTEND_URL}/choose-email?token=${tempToken}&emails=${encodeURIComponent(
                JSON.stringify(emails)
            )}`
        );
    } catch (err) {
        res.status(500).json({ message: "Google sign-in failed", error: err.message });
    }
};

const finalizeGoogle = async (req, res) => {
    const { token, chosenEmail } = req.body;

    try {
        // Decode temp token
        const decoded = jwt.verify(token, JWT_SECRET);
        const emails = decoded.emails || [];

        // Check if the chosen email was actually returned & verified by Google
        if (chosenEmail && !emails.includes(chosenEmail)) {
            return res.status(400).json({
                message: "Invalid request: selected email does not match verified Google account emails"
            });
        }

        let emailToUse = chosenEmail || emails[0];

        // Check if user already exists
        let user = await User.findOne({
            $or: [{ googleId: decoded.googleId }, { email: emailToUse }],
        });

        if (!user) {
            // Generate a unique username based on the Google profile username or email prefix
            const baseUsername = (decoded.username || emailToUse.split("@")[0])
                .replace(/[^a-zA-Z0-9]/g, "");
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            const finalUsername = `${baseUsername}${randomNum}`;

            // Create new user
            user = await User.create({
                googleId: decoded.googleId,
                username: finalUsername,
                email: emailToUse,
                provider: "google",
            });

            // Send welcome email to new users
            try {
                await sendEmail(user.username, user.email);
            } catch (emailErr) {
                console.error("Failed to send welcome email:", emailErr);
            }
        } else if (!user.googleId) {
            // Link existing local account with Google OAuth
            user.googleId = decoded.googleId;
            user.provider = "google";
            await user.save();
        }

        // Generate authentication tokens
        const expiresIn = 60 * 60; // seconds (1 hour)
        const loginToken = jwt.sign({ id: user._id }, JWT_SECRET, {
            expiresIn: `${expiresIn}s`,
        });
        const refreshToken = jwt.sign({ id: user._id }, JWT_SECRET, {
            expiresIn: "7d",
        });

        // Set HttpOnly cookie for session management matching the local login design
        res.cookie("token", loginToken, {
            httpOnly: true,
            secure: NODE_ENV === "production",
            sameSite: NODE_ENV === "production" ? "strict" : "lax",
            maxAge: expiresIn * 1000,
            path: "/",
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: NODE_ENV === "production",
            sameSite: NODE_ENV === "production" ? "strict" : "lax",
            maxAge: (60 * 60 * 24 * 7) * 1000,
            path: "/",
        });

        res.status(200).json({
            message: "Login successful",
            user,
        });
    } catch (error) {
        res.status(400).json({
            message: "Error finalizing Google sign-in",
            error: error.message,
        });
    }
};

module.exports = { googleCallback, finalizeGoogle };