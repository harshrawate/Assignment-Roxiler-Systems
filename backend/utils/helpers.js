// Utility functions for the backend

/**
 * Format date to YYYY-MM-DD format
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string
 */
const formatDate = (date) => {
  return date.toISOString().split("T")[0]
}

/**
 * Validate month parameter
 * @param {string|number} month - Month to validate
 * @returns {boolean} True if valid month (1-12)
 */
const isValidMonth = (month) => {
  const monthNum = Number.parseInt(month)
  return !isNaN(monthNum) && monthNum >= 1 && monthNum <= 12
}

/**
 * Validate pagination parameters
 * @param {string|number} page - Page number
 * @param {string|number} limit - Items per page
 * @returns {object} Validated pagination object
 */
const validatePagination = (page = 1, limit = 10) => {
  const pageNum = Number.parseInt(page) || 1
  const limitNum = Number.parseInt(limit) || 10

  return {
    page: Math.max(1, pageNum),
    limit: Math.min(100, Math.max(1, limitNum)),
  }
}

/**
 * Generate month name from number
 * @param {number} monthNum - Month number (1-12)
 * @returns {string} Month name
 */
const getMonthName = (monthNum) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  return months[monthNum - 1] || "Invalid Month"
}

/**
 * Calculate percentage
 * @param {number} part - Part value
 * @param {number} total - Total value
 * @returns {number} Percentage (0-100)
 */
const calculatePercentage = (part, total) => {
  if (total === 0) return 0
  return Math.round((part / total) * 100 * 100) / 100 // Round to 2 decimal places
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

module.exports = {
  formatDate,
  isValidMonth,
  validatePagination,
  getMonthName,
  calculatePercentage,
  formatCurrency,
}
