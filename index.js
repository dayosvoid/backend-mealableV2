const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const customError = require("./utilis/CustomError");
const errorHandler = require("./middleware/errorHandling.middleware");
const cookieParser = require("cookie-parser");
const { authMiddleware } = require("./middleware/auth.middleware");
const { MONGO_URI, PORT } = require("./config/config");
const authRoutes = require("./routes/auth.routes");
const { default: helmet } = require("helmet");
const cors = require("cors");
const { generalLimiter } = require("./middleware/rateLimiter.middleware");

app.use(express.json());
app.use(cookieParser());
app.use(helmet()); // Protects against XSS, clickjacking, and script injection
app.use(
  cors({
    allowedHeaders: ["Content-Type", "Authorization"],
    allowedOrigins: ["*"], // Allow all origins (for development; restrict in production)
    allowedMethods: ["GET", "POST", "PUT", "DELETE"],
  }),
); // Enable CORS for all routes

app.use("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/", generalLimiter); // Apply general rate limiter to all other API routes

// 404 handler for unmatched routes
app.use((req, res, next) => {
  next(new customError("Route not found", 404));
});

// Centralized error handling middleware
app.use(errorHandler);

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    mongoose.connection.on("connected", () => {
      console.log("Database connected");
    });

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Error starting server:", err.message);
    process.exit(1);
  }
};

startServer();
