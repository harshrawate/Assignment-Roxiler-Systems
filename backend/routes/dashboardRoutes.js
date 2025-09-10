const express = require("express")
const DashboardController = require("../controllers/dashboardController")
const AuthMiddleware = require("../middleware/auth")

const router = express.Router()

// Admin only dashboard routes
router.get(
  "/dashboard/stats",
  AuthMiddleware.verifyToken,
  AuthMiddleware.requireAdmin,
  DashboardController.getAdminStats,
)

module.exports = router
