const User = require("../models/User");
const bcrypt = require("bcrypt");
const AuthMiddleware = require("../middleware/auth");

class UserController {
  static async register(req, res) {
    try {
      const { name, email, password, address } = req.body;

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ success: false, message: "User with this email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({ name, email, password: hashedPassword, address, role: "normal" });

      const token = AuthMiddleware.generateToken(user);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            address: user.address,
            role: user.role,
          },
          token,
        },
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ success: false, message: "Error registering user", error: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findByEmail(email);
      if (!user) return res.status(401).json({ success: false, message: "Invalid email or password" });

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return res.status(401).json({ success: false, message: "Invalid email or password" });

      const token = AuthMiddleware.generateToken(user);

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            address: user.address,
            role: user.role,
          },
          token,
        },
      });
    } catch (error) {
      console.error("Error logging in user:", error);
      res.status(500).json({ success: false, message: "Error logging in user", error: error.message });
    }
  }

  static async getCurrentUser(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      res.json({ success: true, data: user });
    } catch (error) {
      console.error("Error fetching current user:", error);
      res.status(500).json({ success: false, message: "Error fetching current user", error: error.message });
    }
  }

  static async getAllUsers(req, res) {
    try {
      const filters = req.query;
      const users = await User.findAll(filters);
      res.json({ success: true, data: users });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ success: false, message: "Error fetching users", error: error.message });
    }
  }

  static async createUser(req, res) {
    try {
      const { name, email, password, address, role } = req.body;

      const existingUser = await User.findByEmail(email);
      if (existingUser) return res.status(400).json({ success: false, message: "User with this email already exists" });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashedPassword, address, role });

      res.status(201).json({ success: true, message: "User created successfully", data: user });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ success: false, message: "Error creating user", error: error.message });
    }
  }

  static async updatePassword(req, res) {
    try {
      const { userId } = req.params;
      const { newPassword } = req.body;

      if (req.user.role !== "admin" && req.user.id !== Number(userId)) {
        return res.status(403).json({ success: false, message: "Access denied. You can only update your own password." });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const result = await User.updatePassword(userId, hashedPassword);

      if (result.changes === 0) return res.status(404).json({ success: false, message: "User not found" });

      res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ success: false, message: "Error updating password", error: error.message });
    }
  }

  static async getUserById(req, res) {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      res.json({ success: true, data: user });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ success: false, message: "Error fetching user", error: error.message });
    }
  }
}

module.exports = UserController;
