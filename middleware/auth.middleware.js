const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/config");
const CustomError = require("../utilis/CustomError");

const authMiddleware = (req, res, next) => {
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

    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id };
    return next();
  } catch (err) {
    return next(new CustomError("Invalid or expired token", 401));
  }
};

module.exports = { authMiddleware };
