const passport = require("passport");
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, BASE_URI } = require("./config");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// Configure Google OAuth strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: "https://" + BASE_URI + "/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Extract emails and name from Google profile
                const emails = profile.emails?.map(e => e.value) || [];
                const username = profile.displayName || "User";

                if (emails.length === 0) {
                    // Fail if no email is returned by Google
                    return done(new Error("No emails found in Google profile"), null);
                }

                // Pass the essential user info to the next step in Passport
                return done(null, {
                    googleId: profile.id,
                    username,
                    emails,
                });
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

// Store user info in session
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));