const bcrypt = require("bcryptjs");
const Auth = require("../models/auth");
const User = require("../models/user.schema");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utilis/email.utils");
const CustomError = require("../utilis/CustomError");
const { JWT_SECRET, NODE_ENV, JWT_REFRESH_SECRET } = require("../config/config");
const { blacklistToken } = require("../utilis/tokenBlacklist");

// ─── Cookie helpers ────────────────────────────────────────────────────────────

const ACCESS_TOKEN_TTL_MS = 60 * 60 * 1000;        // 1 h
const REFRESH_TOKEN_TTL_MS = 60 * 60 * 24 * 7 * 1000; // 7 d

const cookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: NODE_ENV === "production" ? "strict" : "lax",
  maxAge,
  path: "/",
});

// ─── Controllers ──────────────────────────────────────────────────────────────

const signup = async (req, res, next) => {
  try {
    const { username, password, email, role } = req.body;

    if (!username || !password || !email)
      throw new CustomError("Username, password and email are required", 400);

    // basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      throw new CustomError("Invalid email format", 400);

    // Validate password complexity before hashing so we return a clear error for weak passwords.
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])[^\s]{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new CustomError(
        "Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one number, and one special character.",
        400,
      );
    }

    const existingByEmail = await Auth.findOne({ email });
    if (existingByEmail)
      throw new CustomError("User with this email already exists", 400);
    const existingByUsername = await Auth.findOne({ username });
    if (existingByUsername)
      throw new CustomError("Username is already taken", 400);

    const salt = await bcrypt.genSalt(11);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new Auth({ username, password: hashedPassword, email, role });
    if (!newUser) throw new Error("Failed to create user");
    await newUser.save();

    // Create user profile document
    await User.create({
      displayName: newUser.username,
      userId: newUser._id,
    });

    // Send welcome email but do not block user creation on email failure
    try {
      await sendEmail(newUser.username, newUser.email);
    } catch (emailErr) {
      console.error("Failed to send welcome email:", emailErr);
    }

    res.status(201).json({
      data: { id: newUser._id, username: newUser.username },
      message: "User created successfully",
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      throw new CustomError("Email and password are required", 400);

    const user = await Auth.findOne({ email });
    if (!user) throw new CustomError("Invalid email, use the email you used to sign up", 401);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new CustomError("Incorrect password", 401);

    if (!JWT_SECRET) {
      throw new CustomError(
        "Server configuration error: missing JWT secret",
        500,
      );
    }

    const now = Math.floor(Date.now() / 1000);

    const token = jwt.sign(
      { id: user._id, iat: now },
      JWT_SECRET,
      { expiresIn: "1h" },
    );

    const refreshToken = jwt.sign(
      { id: user._id, iat: now },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, cookieOptions(ACCESS_TOKEN_TTL_MS));
    res.cookie("refreshToken", refreshToken, cookieOptions(REFRESH_TOKEN_TTL_MS));

    res.status(200).json({
      data: { id: user._id, username: user.username },
      message: "Login successful",
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    // Blacklist both tokens so they cannot be reused even within their lifetime
    const accessToken = req.cookies?.token;
    const refreshToken = req.cookies?.refreshToken;

    const blacklistPromises = [];

    if (accessToken) {
      try {
        const decoded = jwt.decode(accessToken);
        if (decoded?.exp) {
          blacklistPromises.push(blacklistToken(accessToken, decoded.exp));
        }
      } catch (_) {
        // malformed token — no need to blacklist
      }
    }

    if (refreshToken) {
      try {
        const decoded = jwt.decode(refreshToken);
        if (decoded?.exp) {
          blacklistPromises.push(blacklistToken(refreshToken, decoded.exp));
        }
      } catch (_) {
        // malformed token — no need to blacklist
      }
    }

    await Promise.all(blacklistPromises);

    res.clearCookie("token", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });

    return res.status(204).end();
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const oldRefreshToken = req.cookies?.refreshToken;
    if (!oldRefreshToken)
      throw new CustomError("No refresh token found", 401);

    // Verify signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(oldRefreshToken, JWT_REFRESH_SECRET);
    } catch (_) {
      throw new CustomError("Invalid or expired refresh token", 401);
    }

    const user = await Auth.findById(decoded.id);
    if (!user) throw new CustomError("User not found", 404);

    const now = Math.floor(Date.now() / 1000);

    // Issue new token pair
    const newToken = jwt.sign(
      { id: user._id, iat: now },
      JWT_SECRET,
      { expiresIn: "1h" },
    );

    const newRefreshToken = jwt.sign(
      { id: user._id, iat: now },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );

    // Blacklist the old refresh token to prevent replay attacks
    if (decoded.exp) {
      await blacklistToken(oldRefreshToken, decoded.exp);
    }

    res.cookie("token", newToken, cookieOptions(ACCESS_TOKEN_TTL_MS));
    res.cookie("refreshToken", newRefreshToken, cookieOptions(REFRESH_TOKEN_TTL_MS));

    res.status(200).json({
      data: { id: user._id, username: user.username },
      message: "Token refreshed successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login, logout, refresh };
