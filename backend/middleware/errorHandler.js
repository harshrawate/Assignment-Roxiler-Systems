const errorHandler = (err, req, res, next) => {
  console.error("Error:", err)

  // Default error
  let error = {
    success: false,
    message: err.message || "Internal Server Error",
    status: err.status || 500,
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ")
    error = {
      success: false,
      message,
      status: 400,
    }
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const message = "Duplicate field value entered"
    error = {
      success: false,
      message,
      status: 400,
    }
  }

  // Mongoose cast error
  if (err.name === "CastError") {
    const message = "Resource not found"
    error = {
      success: false,
      message,
      status: 404,
    }
  }

  res.status(error.status).json({
    success: error.success,
    message: error.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
}

module.exports = errorHandler
