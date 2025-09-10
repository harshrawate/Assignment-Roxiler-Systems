const express = require("express")
const UserController = require("../controllers/userController")
const AuthMiddleware = require("../middleware/auth")

const router = express.Router()

// Public authentication routes
router.post("/register", UserController.register)
router.post("/login", UserController.login)

// Protected routes - require authentication
router.get("/me", AuthMiddleware.verifyToken, UserController.getCurrentUser)

// Admin only routes
router.get("/users", AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, UserController.getAllUsers)
router.post("/users", AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, UserController.createUser)
router.get("/users/:userId", AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, UserController.getUserById)

// User can update their own password, admin can update any password
router.put("/users/:userId/password", AuthMiddleware.verifyToken, UserController.updatePassword)

module.exports = router
