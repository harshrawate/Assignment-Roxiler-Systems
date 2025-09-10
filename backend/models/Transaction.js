const database = require("../config/database");

class Transaction {
  static async getAll(page = 1, limit = 10, search = "", month = "") {
    const offset = (page - 1) * limit;
    let query = "SELECT * FROM transactions WHERE 1=1";
    let countQuery = "SELECT COUNT(*) as total FROM transactions WHERE 1=1";
    const params = [];
    const countParams = [];

    if (search) {
      query += " AND (title LIKE ? OR description LIKE ? OR category LIKE ?)";
      countQuery += " AND (title LIKE ? OR description LIKE ? OR category LIKE ?)";
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
      countParams.push(searchParam, searchParam, searchParam);
    }

    if (month) {
      query += " AND MONTH(dateOfSale) = ?";
      countQuery += " AND MONTH(dateOfSale) = ?";
      params.push(month);
      countParams.push(month);
    }

    query += " ORDER BY dateOfSale DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [countRows] = await database.getPool().query(countQuery, countParams);
    const [rows] = await database.getPool().query(query, params);

    return {
      transactions: rows,
      total: countRows[0].total,
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
      totalPages: Math.ceil(countRows[0].total / limit),
    };
  }

  static async getStatistics(month) {
    let query = `
      SELECT 
        SUM(CASE WHEN sold = 1 THEN price ELSE 0 END) as totalSaleAmount,
        COUNT(CASE WHEN sold = 1 THEN 1 END) as totalSoldItems,
        COUNT(CASE WHEN sold = 0 THEN 1 END) as totalNotSoldItems
      FROM transactions
      WHERE 1=1
    `;
    const params = [];

    if (month) {
      query += " AND MONTH(dateOfSale) = ?";
      params.push(month);
    }

    const [rows] = await database.getPool().query(query, params);
    const row = rows[0];
    return {
      totalSaleAmount: row.totalSaleAmount || 0,
      totalSoldItems: row.totalSoldItems || 0,
      totalNotSoldItems: row.totalNotSoldItems || 0,
    };
  }

  static async getBarChartData(month) {
    const priceRanges = [
      { range: "0-100", min: 0, max: 100 },
      { range: "101-200", min: 101, max: 200 },
      { range: "201-300", min: 201, max: 300 },
      { range: "301-400", min: 301, max: 400 },
      { range: "401-500", min: 401, max: 500 },
      { range: "501-600", min: 501, max: 600 },
      { range: "601-700", min: 601, max: 700 },
      { range: "701-800", min: 701, max: 800 },
      { range: "801-900", min: 801, max: 900 },
      { range: "901-above", min: 901, max: 999999 },
    ];

    const results = [];
    for (const range of priceRanges) {
      let query = "SELECT COUNT(*) as count FROM transactions WHERE price >= ? AND price <= ?";
      const params = [range.min, range.max];

      if (month) {
        query += " AND MONTH(dateOfSale) = ?";
        params.push(month);
      }

      const [rows] = await database.getPool().query(query, params);
      results.push({ range: range.range, count: rows[0].count });
    }

    return results;
  }

  static async getPieChartData(month) {
    let query = "SELECT category, COUNT(*) as count FROM transactions WHERE 1=1";
    const params = [];

    if (month) {
      query += " AND MONTH(dateOfSale) = ?";
      params.push(month);
    }

    query += " GROUP BY category";

    const [rows] = await database.getPool().query(query, params);
    return rows;
  }
}

module.exports = Transaction;
