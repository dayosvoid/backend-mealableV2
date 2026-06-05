const { config } = require("dotenv");

config({
  path: `.env.${process.env.NODE_ENV === "production" ? "production" : "development"}.local`,
});

const { NODE_ENV, BASE_URI, MONGO_URI, PORT, RESEND_KEY } = process.env;

module.exports = { NODE_ENV, BASE_URI, MONGO_URI, PORT, RESEND_KEY };
