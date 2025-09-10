const express = require("express")
const StoreController = require("../controllers/storeController")
const AuthMiddleware = require("../middleware/auth")

const router = express.Router()

// Public routes - all users can view stores
router.get("/stores", StoreController.getAllStores)
router.get("/stores/:storeId", StoreController.getStoreById)

// Admin only routes
router.post("/stores", AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, StoreController.createStore)

// Store owner and admin can view store raters
router.get(
  "/stores/:storeId/raters",
  AuthMiddleware.verifyToken,
  AuthMiddleware.requireAdminOrStoreOwner,
  StoreController.getStoreRaters,
)

module.exports = router
