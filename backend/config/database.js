const mysql = require("mysql2/promise");

class Database {
  constructor() {
    this.pool = null;
  }

  async connect() {
    try {
      this.pool = mysql.createPool({
        host: "localhost", // change if needed
        user: "root", // your MySQL username
        password: "Harsh@1357", // your MySQL password
        database: "assignment", // your database name
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      console.log("✅ Connected to MySQL database");
      await this.initializeTables();
    } catch (err) {
      console.error("❌ Error connecting to MySQL:", err);
      throw err;
    }
  }

  async initializeTables() {
    try {
      const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(60) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(100) NOT NULL,
          address VARCHAR(400),
          role ENUM('admin', 'normal', 'store_owner') NOT NULL DEFAULT 'normal',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      const createStoresTable = `
        CREATE TABLE IF NOT EXISTS stores (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(60) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          address VARCHAR(400),
          owner_id INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (owner_id) REFERENCES users(id)
        )
      `;

      const createRatingsTable = `
        CREATE TABLE IF NOT EXISTS ratings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          store_id INT NOT NULL,
          rating INT NOT NULL CHECK(rating >= 1 AND rating <= 5),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE(user_id, store_id),
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (store_id) REFERENCES stores(id)
        )
      `;

      const createTransactionsTable = `
        CREATE TABLE IF NOT EXISTS transactions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL,
          category VARCHAR(100) NOT NULL,
          image VARCHAR(255),
          sold BOOLEAN DEFAULT 0,
          dateOfSale DATE NOT NULL,
          store_id INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (store_id) REFERENCES stores(id)
        )
      `;

      await this.pool.query(createUsersTable);
      await this.pool.query(createStoresTable);
      await this.pool.query(createRatingsTable);
      await this.pool.query(createTransactionsTable);

      console.log("✅ Tables created or already exist");

      await this.seedData();
    } catch (err) {
      console.error("❌ Error creating tables:", err);
      throw err;
    }
  }

  async seedData() {
    try {
      const [rows] = await this.pool.query("SELECT COUNT(*) as count FROM users");
      if (rows[0].count > 0) {
        console.log("⚡ Database already seeded");
        return;
      }

      const seedUsers = [
        ["System Administrator User", "admin@system.com", "Admin123!", "123 Admin Street, Admin City, AC 12345", "admin"],
        ["John Doe Normal User Account", "john@example.com", "User123!", "456 User Avenue, User City, UC 67890", "normal"],
        ["Jane Smith Store Owner Account", "jane@store.com", "Store123!", "789 Store Boulevard, Store City, SC 11111", "store_owner"],
      ];

      const insertUser = `INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)`;
      for (const user of seedUsers) {
        await this.pool.query(insertUser, user);
      }

      const seedStores = [
        ["Electronics Paradise Store", "contact@electronics.com", "100 Electronics Way, Tech City, TC 22222", 3],
        ["Fashion Forward Boutique Store", "info@fashion.com", "200 Fashion Street, Style City, SC 33333", 3],
      ];

      const insertStore = `INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)`;
      for (const store of seedStores) {
        await this.pool.query(insertStore, store);
      }

      const seedRatings = [
        [2, 1, 5],
        [2, 2, 4],
      ];

      const insertRating = `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)`;
      for (const rating of seedRatings) {
        await this.pool.query(insertRating, rating);
      }

      console.log("✅ Database seeded with sample data");
    } catch (err) {
      console.error("❌ Error seeding database:", err);
      throw err;
    }
  }

  getPool() {
    return this.pool;
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log("🔒 Database connection closed");
    }
  }
}

module.exports = new Database();
