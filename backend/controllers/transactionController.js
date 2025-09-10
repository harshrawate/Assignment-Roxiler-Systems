const Transaction = require("../models/Transaction")

class TransactionController {
  static async getAllTransactions(req, res) {
    try {
      const { page = 1, limit = 10, search = "", month = "" } = req.query

      const result = await Transaction.getAll(Number.parseInt(page), Number.parseInt(limit), search, month)

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      console.error("Error fetching transactions:", error)
      res.status(500).json({
        success: false,
        message: "Error fetching transactions",
        error: error.message,
      })
    }
  }

  static async getStatistics(req, res) {
    try {
      const { month } = req.query

      const statistics = await Transaction.getStatistics(month)

      res.json({
        success: true,
        data: statistics,
      })
    } catch (error) {
      console.error("Error fetching statistics:", error)
      res.status(500).json({
        success: false,
        message: "Error fetching statistics",
        error: error.message,
      })
    }
  }

  static async getBarChartData(req, res) {
    try {
      const { month } = req.query

      const barChartData = await Transaction.getBarChartData(month)

      res.json({
        success: true,
        data: barChartData,
      })
    } catch (error) {
      console.error("Error fetching bar chart data:", error)
      res.status(500).json({
        success: false,
        message: "Error fetching bar chart data",
        error: error.message,
      })
    }
  }

  static async getPieChartData(req, res) {
    try {
      const { month } = req.query

      const pieChartData = await Transaction.getPieChartData(month)

      res.json({
        success: true,
        data: pieChartData,
      })
    } catch (error) {
      console.error("Error fetching pie chart data:", error)
      res.status(500).json({
        success: false,
        message: "Error fetching pie chart data",
        error: error.message,
      })
    }
  }
}

module.exports = TransactionController
