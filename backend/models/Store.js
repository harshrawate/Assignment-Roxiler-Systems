const database = require("../config/database");

class Store {
  static async create(storeData) {
    const { name, email, address, owner_id } = storeData;
    const query = `
      INSERT INTO stores (name, email, address, owner_id)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await database.getPool().query(query, [name, email, address, owner_id]);
    return { id: result.insertId, ...storeData };
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT s.*, 
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.name) {
      query += ` AND s.name LIKE ?`;
      params.push(`%${filters.name}%`);
    }
    if (filters.email) {
      query += ` AND s.email LIKE ?`;
      params.push(`%${filters.email}%`);
    }
    if (filters.address) {
      query += ` AND s.address LIKE ?`;
      params.push(`%${filters.address}%`);
    }

    query += ` GROUP BY s.id`;

    if (filters.sortBy) {
      const order = filters.sortOrder === "desc" ? "DESC" : "ASC";
      query += ` ORDER BY s.${filters.sortBy} ${order}`;
    }

    const [rows] = await database.getPool().query(query, params);
    return rows;
  }

  static async findById(id) {
    const query = `
      SELECT s.*, 
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.id = ?
      GROUP BY s.id
    `;
    const [rows] = await database.getPool().query(query, [id]);
    return rows[0] || null;
  }

  static async getStats() {
    const query = `SELECT COUNT(*) as total FROM stores`;
    const [rows] = await database.getPool().query(query);
    return rows[0].total;
  }

  static async getStoreRaters(storeId) {
    const query = `
      SELECT u.id, u.name, u.email, r.rating, r.created_at
      FROM users u
      JOIN ratings r ON u.id = r.user_id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
    `;
    const [rows] = await database.getPool().query(query, [storeId]);
    return rows;
  }
}

module.exports = Store;
