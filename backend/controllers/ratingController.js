const Rating = require("../models/Rating")

class RatingController {
  static async submitRating(req, res) {
    try {
      const { user_id, store_id, rating } = req.body

      // Validate rating value
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        })
      }

      const ratingData = await Rating.create({
        user_id,
        store_id,
        rating,
      })

      res.status(201).json({
        success: true,
        message: "Rating submitted successfully",
        data: ratingData,
      })
    } catch (error) {
      console.error("Error submitting rating:", error)
      res.status(500).json({
        success: false,
        message: "Error submitting rating",
        error: error.message,
      })
    }
  }

  static async getUserRatingForStore(req, res) {
    try {
      const { userId, storeId } = req.params

      const rating = await Rating.findByUserAndStore(userId, storeId)

      res.json({
        success: true,
        data: rating,
      })
    } catch (error) {
      console.error("Error fetching user rating:", error)
      res.status(500).json({
        success: false,
        message: "Error fetching user rating",
        error: error.message,
      })
    }
  }

  static async getStoreRatings(req, res) {
    try {
      const { storeId } = req.params

      const ratings = await Rating.getStoreRatings(storeId)

      res.json({
        success: true,
        data: ratings,
      })
    } catch (error) {
      console.error("Error fetching store ratings:", error)
      res.status(500).json({
        success: false,
        message: "Error fetching store ratings",
        error: error.message,
      })
    }
  }
}

module.exports = RatingController
