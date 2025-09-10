const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

class AuthMiddleware {
  // Generate JWT token
  static generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
  }

  // Verify JWT token middleware
  static async verifyToken(req, res, next) {
    try {
      const authHeader = req.header("Authorization");
      const token = authHeader?.replace("Bearer ", "").trim();

      if (!token) {
        return res.status(401).json({ success: false, message: "Access denied. No token provided." });
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ success: false, message: "Invalid token. User not found." });
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      };

      next();
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(401).json({ success: false, message: "Invalid or expired token." });
    }
  }

  // Middleware to restrict roles
  static requireRole(allowedRoles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Authentication required." });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: "Access denied. Insufficient permissions." });
      }

      next();
    };
  }

  // Specific role middlewares
  static requireAdmin(req, res, next) {
    return AuthMiddleware.requireRole(["admin"])(req, res, next);
  }

  static requireNormalUser(req, res, next) {
    return AuthMiddleware.requireRole(["normal"])(req, res, next);
  }

  static requireStoreOwner(req, res, next) {
    return AuthMiddleware.requireRole(["store_owner"])(req, res, next);
  }

  static requireAdminOrStoreOwner(req, res, next) {
    return AuthMiddleware.requireRole(["admin", "store_owner"])(req, res, next);
  }
}

module.exports = AuthMiddleware;
