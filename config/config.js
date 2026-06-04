const { config } = require("dotenv");

config({
  path: `.env.${process.env.NODE_ENV === "production" ? "production" : "development"}.local`,
});

const { NODE_ENV, MONGO_URI, PORT } = process.env;

module.exports = { NODE_ENV, MONGO_URI, PORT };
