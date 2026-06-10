const Redis = require("ioredis");
const { REDIS_URL } = require("./config");

let client;

const getRedisClient = () => {
  if (client) return client;

  client = new Redis(REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: null,
    lazyConnect: false,
    // Reconnect with exponential back-off, max 30s
    retryStrategy(times) {
      const delay = Math.min(times * 100, 30000);
      return delay;
    },
  });

  client.on("connect", () => {
    console.log("Redis connected successfully");
  });

  client.on("error", (err) => {
    console.error("Redis error:", err.message);
  });

  return client;
};

module.exports = { getRedisClient };
