const User = require("../models/User")
const Store = require("../models/Store")
const Rating = require("../models/Rating")

class DashboardController {
  static async getAdminStats(req, res) {
    try {
      const totalUsers = await User.getStats()
      const totalStores = await Store.getStats()
      const totalRatings = await Rating.getStats()

      res.json({
        success: true,
        data: {
          totalUsers,
          totalStores,
          totalRatings,
        },
      })
    } catch (error) {
      console.error("Error fetching admin stats:", error)
      res.status(500).json({
        success: false,
        message: "Error fetching admin statistics",
        error: error.message,
      })
    }
  }
}

module.exports = DashboardController
