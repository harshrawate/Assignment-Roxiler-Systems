const database = require("../config/database");

class Rating {
  static async create(ratingData) {
    const { user_id, store_id, rating } = ratingData;
    const query = `
      INSERT INTO ratings (user_id, store_id, rating, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON DUPLICATE KEY UPDATE rating = VALUES(rating), updated_at = CURRENT_TIMESTAMP
    `;
    const [result] = await database.getPool().query(query, [user_id, store_id, rating]);
    return { id: result.insertId, ...ratingData };
  }

  static async findByUserAndStore(userId, storeId) {
    const query = `SELECT * FROM ratings WHERE user_id = ? AND store_id = ?`;
    const [rows] = await database.getPool().query(query, [userId, storeId]);
    return rows[0] || null;
  }

  static async getStats() {
    const query = `SELECT COUNT(*) as total FROM ratings`;
    const [rows] = await database.getPool().query(query);
    return rows[0].total;
  }

  static async getStoreRatings(storeId) {
    const query = `
      SELECT r.*, u.name as user_name
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
    `;
    const [rows] = await database.getPool().query(query, [storeId]);
    return rows;
  }
}

module.exports = Rating;
