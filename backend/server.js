const express = require("express")
const cors = require("cors")
const database = require("./config/database")
const transactionRoutes = require("./routes/transactionRoutes")
const userRoutes = require("./routes/userRoutes")
const storeRoutes = require("./routes/storeRoutes")
const ratingRoutes = require("./routes/ratingRoutes")
const dashboardRoutes = require("./routes/dashboardRoutes")
const errorHandler = require("./middleware/errorHandler")
const { validateQuery } = require("./middleware/validation")

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Apply validation middleware to API routes
app.use("/api", validateQuery)

// Routes
app.use("/api", transactionRoutes)
app.use("/api", userRoutes)
app.use("/api", storeRoutes)
app.use("/api", ratingRoutes)
app.use("/api", dashboardRoutes)

// Error handling middleware (must be last)
app.use(errorHandler)

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  })
})

// Initialize database and start server
async function startServer() {
  try {
    await database.connect()

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📊 API endpoints available at http://localhost:${PORT}/api`)
      console.log(`❤️  Health check at http://localhost:${PORT}/health`)
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down server...")
  try {
    await database.close()
    console.log("✅ Database connection closed")
    process.exit(0)
  } catch (error) {
    console.error("❌ Error during shutdown:", error)
    process.exit(1)
  }
})

process.on("SIGTERM", async () => {
  console.log("\n🛑 Received SIGTERM, shutting down gracefully...")
  try {
    await database.close()
    console.log("✅ Database connection closed")
    process.exit(0)
  } catch (error) {
    console.error("❌ Error during shutdown:", error)
    process.exit(1)
  }
})

// Start the server
startServer()
