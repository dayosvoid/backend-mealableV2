const bcrypt = require("bcryptjs");
const Users = require("../models/auth");
const jwt = require("jsonwebtoken");

const signup = async (req, res, next) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password || !email)
      throw new Error("Username, password and email are required");

    // Validate password complexity before hashing so we return a clear error for weak passwords.
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      const err = new Error(
        "Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one number, and one special character.",
      );
      err.statusCode = 400;
      throw err;
    }

    const existingUser = await Users.findOne({ email });
    if (existingUser) throw new Error("User already exists");

    const salt = await bcrypt.genSalt(11);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new Users({ username, password: hashedPassword, email });
    if (!newUser) throw new Error("Failed to create user");
    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) throw new Error("Email and password are required");

    const user = await Users.findOne({ email });
    if (!user) throw new Error("Invalid email or password");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid email or password");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login };
