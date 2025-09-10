const express = require("express")
const RatingController = require("../controllers/ratingController")
const AuthMiddleware = require("../middleware/auth")

const router = express.Router()

// Protected routes - require authentication
router.post("/ratings", AuthMiddleware.verifyToken, RatingController.submitRating)
router.get("/ratings/user/:userId/store/:storeId", AuthMiddleware.verifyToken, RatingController.getUserRatingForStore)

// Public route - anyone can view store ratings
router.get("/ratings/store/:storeId", RatingController.getStoreRatings)

module.exports = router
