const bcrypt = require("bcryptjs");
const Users = require("../models/auth");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utilis/email.utils");
const CustomError = require("../utilis/CustomError");
const { JWT_SECRET, NODE_ENV } = require("../config/config");

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
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new CustomError(
        "Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one number, and one special character.",
        400,
      );
    }

    const existingByEmail = await Users.findOne({ email });
    if (existingByEmail)
      throw new CustomError("User with this email already exists", 400);
    const existingByUsername = await Users.findOne({ username });
    if (existingByUsername)
      throw new CustomError("Username is already taken", 400);

    const salt = await bcrypt.genSalt(11);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new Users({ username, password: hashedPassword, email, role });
    if (!newUser) throw new Error("Failed to create user");
    await newUser.save();

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

    const user = await Users.findOne({ email });
    if (!user) throw new CustomError("Invalid email or password", 401);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new CustomError("Invalid email or password", 401);

    if (!JWT_SECRET) {
      throw new CustomError(
        "Server configuration error: missing JWT secret",
        500,
      );
    }

    const expiresIn = 60 * 60; // seconds
    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: `${expiresIn}s`,
    });

    // Set cookie expiry to match token expiry
    res.cookie("token", token, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: NODE_ENV === "production" ? "strict" : "lax",
      maxAge: expiresIn * 1000,
      path: "/",
    });

    res.status(200).json({
      data: { id: user._id, username: user.username },
      message: "Login successful",
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (_req, res, next) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
      expires: new Date(0),
    });

    return res.status(204).end();
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, logout };
