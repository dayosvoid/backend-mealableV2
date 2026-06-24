const { createClient } = require("redis");
const { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT, REDIS_USERNAME } = require("./config.js");

let client;

const getRedisClient = () => {
  if (client) return client;

  client = createClient({
    username: REDIS_USERNAME,
    password: REDIS_PASSWORD,
    socket: {
      host: REDIS_HOST,
      port: REDIS_PORT ? parseInt(REDIS_PORT) : 6379,
      reconnectStrategy(retries) {
        // Reconnect with exponential back-off, max 30s
        const delay = Math.min(retries * 100, 30000);
        return delay;
      },
    },
  });

  client.on("connect", () => {
    console.log("Redis connected successfully");
  });

  client.on("error", (err) => {
    console.error("Redis error:", err.message);
  });

  // Initiate connection asynchronously
  client.connect().catch((err) => {
    console.error("Redis connection error:", err.message);
  });

  return client;
};

module.exports = { getRedisClient };

