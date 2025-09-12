const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

class Database {
  constructor() {
    this.pool = null;
  }

  async connect() {
    try {
      this.pool = mysql.createPool({
        host: "localhost",
        user: "root",
        password: "Harsh@1357",
        database: "assignment",
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
          password VARCHAR(255) NOT NULL,
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
          FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
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
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
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
          FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE SET NULL
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
      // Check if database is already seeded
      const [rows] = await this.pool.query("SELECT COUNT(*) as count FROM users");
      if (rows[0].count > 0) {
        console.log("⚡ Database already seeded");
        return;
      }

      console.log("🌱 Seeding database with sample data...");

      // Hash passwords before storing
      const saltRounds = 10;
      const seedUsers = [
        {
          name: "System Administrator User",
          email: "admin@system.com", 
          password: await bcrypt.hash("Admin123!", saltRounds),
          address: "123 Admin Street, Admin City, AC 12345",
          role: "admin"
        },
        {
          name: "John Doe Normal User Account",
          email: "john@example.com",
          password: await bcrypt.hash("User123!", saltRounds), 
          address: "456 User Avenue, User City, UC 67890",
          role: "normal"
        },
        {
          name: "Jane Smith Store Owner Account", 
          email: "jane@store.com",
          password: await bcrypt.hash("Store123!", saltRounds),
          address: "789 Store Boulevard, Store City, SC 11111",
          role: "store_owner"
        }
      ];

      // Insert users and get their IDs
      const insertUser = `INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)`;
      const userIds = [];
      
      for (const user of seedUsers) {
        const [result] = await this.pool.query(insertUser, [
          user.name, user.email, user.password, user.address, user.role
        ]);
        userIds.push(result.insertId);
        console.log(`👤 Created user: ${user.email} (ID: ${result.insertId})`);
      }

      // Get the store owner ID (Jane - 3rd user)
      const storeOwnerID = userIds[2];

      // Insert stores
      const seedStores = [
        {
          name: "Electronics Paradise Store",
          email: "contact@electronics.com", 
          address: "100 Electronics Way, Tech City, TC 22222",
          owner_id: storeOwnerID
        },
        {
          name: "Fashion Forward Boutique Store",
          email: "info@fashion.com",
          address: "200 Fashion Street, Style City, SC 33333", 
          owner_id: storeOwnerID
        }
      ];

      const insertStore = `INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)`;
      const storeIds = [];
      
      for (const store of seedStores) {
        const [result] = await this.pool.query(insertStore, [
          store.name, store.email, store.address, store.owner_id
        ]);
        storeIds.push(result.insertId);
        console.log(`🏪 Created store: ${store.name} (ID: ${result.insertId})`);
      }

      // Insert ratings (John rates both stores)
      const johnID = userIds[1]; // John's ID
      const seedRatings = [
        { user_id: johnID, store_id: storeIds[0], rating: 5 },
        { user_id: johnID, store_id: storeIds[1], rating: 4 }
      ];

      const insertRating = `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)`;
      for (const rating of seedRatings) {
        await this.pool.query(insertRating, [rating.user_id, rating.store_id, rating.rating]);
        console.log(`⭐ Created rating: User ${rating.user_id} gave ${rating.rating} stars to Store ${rating.store_id}`);
      }

      console.log("✅ Database seeded successfully!");
      console.log("🔐 Test Login Credentials:");
      console.log("   Admin: admin@system.com / Admin123!");
      console.log("   User:  john@example.com / User123!");
      console.log("   Owner: jane@store.com / Store123!");

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
