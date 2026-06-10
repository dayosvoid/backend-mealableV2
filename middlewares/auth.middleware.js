const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/config");
const CustomError = require("../utilis/CustomError");
const { isTokenBlacklisted } = require("../utilis/tokenBlacklist");

const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // Check cookie first.
    if (req.cookies && req.cookies.token) token = req.cookies.token;

    // Fallback to Authorization header
    const authHeader = req.headers.authorization;
    if (!token && authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) return next(new CustomError("Authentication required", 401));

    if (!JWT_SECRET)
      return next(
        new CustomError("Server configuration error: missing JWT secret", 500),
      );

    // Verify signature and expiry first
    const payload = jwt.verify(token, JWT_SECRET);

    // Reject tokens that were explicitly revoked (logged-out or rotated)
    const revoked = await isTokenBlacklisted(token);
    if (revoked) return next(new CustomError("Token has been revoked", 401));

    req.user = { id: payload.id };
    return next();
  } catch (err) {
    return next(new CustomError("Invalid or expired token", 401));
  }
};

const adminMiddleware = (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN")
      return next(new CustomError("Unauthorized", 401));
    return next();
  } catch (err) {
    return next(err);
  }
};

module.exports = { authMiddleware, adminMiddleware };
