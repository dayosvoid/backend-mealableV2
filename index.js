const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const errorHandler = require("./middleware/errorHandling.middleware");
const { MONGO_URI, PORT } = require("./config/config");
const { default: helmet } = require("helmet");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");

app.use(express.json());
app.use(helmet());
app.use(
  cors({
    allowedHeaders: ["Content-Type", "Authorization"],
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

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
