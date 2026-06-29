const express = require("express");
const app = express();
app.set("trust proxy", 1);             // ← must be first, before anything else

const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const customError = require("./utilis/CustomError");
const errorHandler = require("./middlewares/error.middleware");
const cookieParser = require("cookie-parser");
const { MONGO_URI, PORT, SESSION_SECRET } = require("./config/config");
const authRoutes = require("./routes/auth.routes");
const googleRoutes = require("./routes/google.routes");
const helmet = require("helmet");                          // ← fixed import
const cors = require("cors");
const { generalLimiter } = require("./middlewares/rateLimiter.middleware");
const groceryRoutes = require("./routes/grocery.routes");
const mealsRoute = require("./routes/meals.routes");
const recommendedRoute = require("./routes/recommendedMeal.routes");
const passport = require("passport");
const session = require("express-session");
const { getRedisClient } = require("./config/redis");

// ─── Core middleware ──────────────────────────────────────
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors({
  origin: "*",                                             // ← fixed key
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE"],               // ← fixed key
}));
app.use(generalLimiter);                                   // ← before routes

// ─── Passport / session ──────────────────────────────────
require("./config/passport");
app.use(session({
  secret: SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());

// ─── Routes ──────────────────────────────────────────────
app.get("/", (req, res) => {                               // ← silence health check 404
  res.status(200).json({ message: "MealableV2 API is running" });
});
app.use("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});
app.use("/auth", googleRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/grocery", groceryRoutes);
app.use("/api/meals", mealsRoute);
app.use("/api/recommended", recommendedRoute);

// ─── 404 handler ─────────────────────────────────────────
app.use((req, res, next) => {
  next(new customError("Route not found", 404));
});

// ─── Error handler — must be last ────────────────────────
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────
const startServer = async () => {
  try {
    // Redis — optional, don't crash if unavailable
    try {
      const redis = getRedisClient();
      await redis.ping();
      console.log("Redis ready");
    } catch (err) {
      console.warn("Redis unavailable — continuing without cache:", err.message);
    }

    await mongoose.connect(MONGO_URI);
    console.log("Database connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Error starting server:", err.message);
    process.exit(1);
  }
};

startServer();