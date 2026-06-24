const { getRedisClient } = require("../config/redis");

const BLACKLIST_PREFIX = "bl:";

// Adds a token to the Redis blacklist.
// TTL is set to the token's remaining lifetime so the entry auto-expires.

const blacklistToken = async (token, expiresAt) => {
  const redis = getRedisClient();
  const now = Math.floor(Date.now() / 1000);
  const ttl = expiresAt - now;

  // Only blacklist if there's remaining lifetime; already-expired tokens are harmless.
  if (ttl > 0) {
    await redis.set(`${BLACKLIST_PREFIX}${token}`, "1", "EX", ttl);
  }
};

// Returns true if the token has been blacklisted.
const isTokenBlacklisted = async (token) => {
  const redis = getRedisClient();
  const result = await redis.get(`${BLACKLIST_PREFIX}${token}`);
  return result !== null;
};

module.exports = { blacklistToken, isTokenBlacklisted };
