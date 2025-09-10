const express = require("express")
const TransactionController = require("../controllers/transactionController")

const router = express.Router()

// GET /api/transactions - Get all transactions with pagination and search
router.get("/transactions", TransactionController.getAllTransactions)

// GET /api/statistics - Get monthly statistics
router.get("/statistics", TransactionController.getStatistics)

// GET /api/bar-chart - Get bar chart data for price ranges
router.get("/bar-chart", TransactionController.getBarChartData)

// GET /api/pie-chart - Get pie chart data for categories
router.get("/pie-chart", TransactionController.getPieChartData)

module.exports = router
