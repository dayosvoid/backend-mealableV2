const { config } = require("dotenv");

// Only load .env file in development — on Render variables are already in process.env
if (process.env.NODE_ENV !== "production") {
  config(); // loads .env locally
}

const {
  NODE_ENV,
  BASE_URI,
  MONGO_URI,
  PORT,
  RESEND_KEY,
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  SESSION_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  FRONTEND_URL,
  REDIS_HOST,
  REDIS_PASSWORD,
  REDIS_PORT,
  REDIS_USERNAME,
} = process.env;

module.exports = {
  NODE_ENV,
  BASE_URI,
  MONGO_URI,
  PORT,
  RESEND_KEY,
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  SESSION_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  FRONTEND_URL,
  REDIS_HOST,
  REDIS_PASSWORD,
  REDIS_PORT,
  REDIS_USERNAME,
};