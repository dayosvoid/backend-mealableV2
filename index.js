const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const customError = require("./utilis/CustomError");
const errorHandler = require("./middleware/errorHandling.middleware");
const { MONGO_URI, PORT } = require("./config/config");
const authRoutes = require("./routes/auth.routes");
const { default: helmet } = require("helmet");
const cors = require("cors");

app.use(express.json());
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

app.use(errorHandler);

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Error starting server:", err.message);
    process.exit(1);
  }
};

startServer();
