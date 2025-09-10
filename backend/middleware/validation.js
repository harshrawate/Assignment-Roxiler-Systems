const validateQuery = (req, res, next) => {
  const { page, limit, month } = req.query

  // Validate page
  if (page && (isNaN(page) || Number.parseInt(page) < 1)) {
    return res.status(400).json({
      success: false,
      message: "Page must be a positive integer",
    })
  }

  // Validate limit
  if (limit && (isNaN(limit) || Number.parseInt(limit) < 1 || Number.parseInt(limit) > 100)) {
    return res.status(400).json({
      success: false,
      message: "Limit must be between 1 and 100",
    })
  }

  // Validate month
  if (month && (isNaN(month) || Number.parseInt(month) < 1 || Number.parseInt(month) > 12)) {
    return res.status(400).json({
      success: false,
      message: "Month must be between 1 and 12",
    })
  }

  next()
}

module.exports = {
  validateQuery,
}
