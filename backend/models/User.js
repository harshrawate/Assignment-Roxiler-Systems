const database = require("../config/database");

class User {
  static async create(userData) {
    return new Promise(async (resolve, reject) => {
      try {
        const { name, email, password, address, role = "normal" } = userData;
        const query = `
          INSERT INTO users (name, email, password, address, role)
          VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await database.getPool().execute(query, [name, email, password, address, role]);
        resolve({ id: result.insertId, ...userData });
      } catch (err) {
        reject(err);
      }
    });
  }

  static async findById(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const [rows] = await database.getPool().execute("SELECT * FROM users WHERE id = ?", [id]);
        resolve(rows[0]);
      } catch (err) {
        reject(err);
      }
    });
  }

  static async findByEmail(email) {
    return new Promise(async (resolve, reject) => {
      try {
        const [rows] = await database.getPool().execute("SELECT * FROM users WHERE email = ?", [email]);
        resolve(rows[0]);
      } catch (err) {
        reject(err);
      }
    });
  }

  static async findAll(filters = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        let query = `SELECT id, name, email, address, role, created_at FROM users WHERE 1=1`;
        const params = [];

        if (filters.name) {
          query += ` AND name LIKE ?`;
          params.push(`%${filters.name}%`);
        }
        if (filters.email) {
          query += ` AND email LIKE ?`;
          params.push(`%${filters.email}%`);
        }
        if (filters.address) {
          query += ` AND address LIKE ?`;
          params.push(`%${filters.address}%`);
        }
        if (filters.role) {
          query += ` AND role = ?`;
          params.push(filters.role);
        }

        if (filters.sortBy) {
          const order = filters.sortOrder === "desc" ? "DESC" : "ASC";
          query += ` ORDER BY ${filters.sortBy} ${order}`;
        }

        const [rows] = await database.getPool().execute(query, params);
        resolve(rows);
      } catch (err) {
        reject(err);
      }
    });
  }

  static async updatePassword(id, newPassword) {
    return new Promise(async (resolve, reject) => {
      try {
        const [result] = await database.getPool().execute("UPDATE users SET password = ? WHERE id = ?", [newPassword, id]);
        resolve({ changes: result.affectedRows });
      } catch (err) {
        reject(err);
      }
    });
  }

  static async getStats() {
    return new Promise(async (resolve, reject) => {
      try {
        const [rows] = await database.getPool().execute("SELECT COUNT(*) as total FROM users");
        resolve(rows[0].total);
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = User;
