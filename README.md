# 🏪 Store Rating System

## 🎯 **Project Overview**
This project is a modern web application that allows users to discover stores, rate them, and manage business operations through different user roles. Built with React frontend, Node.js backend, and MySQL database with automatic database creation and seeding.

### **Key Features**
- 🔐 **Role-based Authentication** (Admin, Store Owner, Normal User)
- 🏪 **Store Management** with CRUD operations
- ⭐ **Rating System** with real-time updates
- 👥 **User Management** with different privilege levels
- 📊 **Analytics Dashboard** for admins and store owners
- 🎨 **Modern UI/UX** with responsive design
- 🔍 **Search & Filter** functionality
- 🚀 **Auto Database Setup** - Zero configuration required


## 🛠 **Technology Stack**

### **Frontend**
- **React 18.2.0** - Modern UI library
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Context API** - State management

### **Backend**
- **Node.js 18.x** - Runtime environment
- **Express.js** - Web framework
- **MySQL2** - Database driver
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **dotenv** - Environment variables
- **cors** - Cross-origin requests

## 🚀 **Quick Start Guide**

### **Prerequisites**
- **Node.js 18.x** or higher
- **MySQL 8.0** or higher
- **npm** or **yarn** package manager

### **⚡ Super Fast Setup (5 Minutes)**

1. **Clone the Repository**

git clone https://github.com/harshrawate/Assignment-Roxiler-Systems.git

2. **Backend Setup**

```bash
cd backend
npm install
```

## Environment Variables

Create a `.env` file inside `backend/` with:

```env
PORT=5000
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
JWT_SECRET=replace_with_a_strong_secret
```

4. **Start Backend Server(Express on port 5000)**

```bash
npm run dev
```

5. **Frontend Setup ( (Vite on port 5173))** (New terminal window)

```bash
cd frontend
npm install
npm run dev
```


6. **Open Application**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`


## ⚠️ **Very Important Usage Notes **
#### **Existing Store Emails (DO NOT use for creating new stores)**
- **Unique Email Requirement**: Each store must have a unique email address
- **Do Not Use jane@store.com Mail for Store Creation create new user and then use that email**

## 🔐 **Demo Login Credentials**

After setup, use these credentials to test the application:

| Role | Email | Password | Features |
|------|-------|----------|----------|
| **👑 Admin** | admin@system.com | Admin123! | Full system control, user & store management |
| **👤 User** | john@example.com | User123! | Browse stores, submit ratings |
| **🏪 Store Owner** | jane@store.com | Store123! | Manage owned stores, view analytics |

## 📊 **Database Schema**

The application automatically creates the following tables:

### **Core Tables**
- **`users`** - User accounts with roles (admin, normal, store_owner)
- **`stores`** - Store information with owner relationships
- **`ratings`** - User ratings for stores (1-5 stars)
- **`transactions`** - Store transaction records

### **Auto-Generated Demo Data**
- 3 users (one for each role)
- 2 sample stores owned by Jane
- Sample ratings and transactions

## 🎮 **How to Use**

### **For Normal Users**
1. **Browse Stores** - View all available stores with ratings
2. **Rate Stores** - Give 1-5 star ratings with comments
3. **Search & Filter** - Find stores by name, location
4. **View Reviews** - See what other customers think
5. **Manage Profile** - Update password and details

### **For Store Owners**
1. **Dashboard** - View store performance metrics
2. **Multiple Stores** - Manage multiple store locations
3. **Customer Reviews** - See detailed customer feedback
4. **Analytics** - Track rating trends and statistics

### **For Administrators**
1. **User Management** - Create, view, and manage all users
2. **Store Oversight** - Monitor all stores in the system
3. **System Analytics** - View platform-wide statistics
4. **Role Assignment** - Assign roles to users

## 🌐 **API Endpoints**

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### **Users** (Admin only)
- `GET /api/users` - Get all users with filtering
- `POST /api/users` - Create new user
- `PUT /api/users/:id/password` - Update user password

### **Stores**
- `GET /api/stores` - Get all stores with filtering
- `POST /api/stores` - Create store (Admin only)
- `GET /api/stores/:id/raters` - Get store ratings

### **Ratings**
- `POST /api/ratings` - Submit rating
- `GET /api/ratings/user/:userId/store/:storeId` - Get specific user rating
- `GET /api/ratings/store/:storeId` - Get all store ratings

