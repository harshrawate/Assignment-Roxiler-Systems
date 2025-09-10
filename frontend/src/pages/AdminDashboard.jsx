"use client";

import { useState, useEffect } from "react";
import { Users, Store, Star, Plus, LogOut, X, Filter } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
  });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    address: "",
    role: "all",
  });
  const [storeFilters, setStoreFilters] = useState({
    name: "",
    email: "",
    address: "",
  });
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateStore, setShowCreateStore] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "normal",
  });
  const [newStore, setNewStore] = useState({
    name: "",
    email: "",
    address: "",
    owner_id: "",
  });

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchUsers();
      fetchStores();
    }
  }, [user]);

  // Auto-apply filters when they change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [filters]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchStores();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [storeFilters]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:5000/api/dashboard/stats",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const result = await response.json();
      if (result.success) setStats(result.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => value !== "" && value !== "all")
      );
      const queryParams = new URLSearchParams(cleanFilters).toString();
      const response = await fetch(
        `http://localhost:5000/api/users?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const result = await response.json();
      if (result.success) setUsers(result.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  const fetchStores = async () => {
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(storeFilters).filter(([key, value]) => value !== "")
      );
      const queryParams = new URLSearchParams(cleanFilters).toString();
      const response = await fetch(
        `http://localhost:5000/api/stores?${queryParams}`
      );
      const result = await response.json();
      if (result.success) setStores(result.data || []);
    } catch (error) {
      console.error("Error fetching stores:", error);
      setStores([]);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newUser),
      });
      const result = await response.json();
      if (result.success) {
        setShowCreateUser(false);
        setNewUser({
          name: "",
          email: "",
          password: "",
          address: "",
          role: "normal",
        });
        fetchUsers();
        fetchStats();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Error creating user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/stores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newStore),
      });
      const result = await response.json();
      if (result.success) {
        setShowCreateStore(false);
        setNewStore({ name: "", email: "", address: "", owner_id: "" });
        fetchStores();
        fetchStats();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error creating store:", error);
      alert("Error creating store. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      name: "",
      email: "",
      address: "",
      role: "all",
    });
  };

  const clearStoreFilters = () => {
    setStoreFilters({
      name: "",
      email: "",
      address: "",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold  bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back, <span className="font-semibold">{user.name}</span>
              </p>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Users Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl shadow-sm">
            <div className="p-6 pb-4 flex flex-row items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-800">Total Users</h3>
                <p className="text-2xl font-bold text-blue-900 mt-2">{stats.totalUsers}</p>
              </div>
              <div className="p-3 bg-blue-600 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Stores Card */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl shadow-sm">
            <div className="p-6 pb-4 flex flex-row items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-800">Total Stores</h3>
                <p className="text-2xl font-bold text-green-900 mt-2">{stats.totalStores}</p>
              </div>
              <div className="p-3 bg-green-600 rounded-xl">
                <Store className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Ratings Card */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl shadow-sm">
            <div className="p-6 pb-4 flex flex-row items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">Total Ratings</h3>
                <p className="text-2xl font-bold text-yellow-900 mt-2">{stats.totalRatings}</p>
              </div>
              <div className="p-3 bg-yellow-600 rounded-xl">
                <Star className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === "users" 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab("stores")}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === "stores" 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Store Management
          </button>
        </div>

        {/* Users Tab Content */}
        {activeTab === "users" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    User Management
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage and monitor all users in the system
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateUser(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add User
                </button>
              </div>
            </div>
            <div className="px-6 pb-6">
              {/* User Filters */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-gray-700">Filters</span>
                  <button
                    onClick={clearFilters}
                    className="ml-auto px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={filters.name}
                    onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <input
                    type="text"
                    placeholder="Search by email..."
                    value={filters.email}
                    onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <input
                    type="text"
                    placeholder="Search by address..."
                    value={filters.address}
                    onChange={(e) => setFilters({ ...filters, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <select
                    value={filters.role}
                    onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="normal">Normal User</option>
                    <option value="store_owner">Store Owner</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              {users.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No users found</p>
                  <p className="text-gray-400">Try adjusting your filters or add a new user</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-xs truncate">
                            {user.address}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === "admin"
                                ? "bg-blue-100 text-blue-800"
                                : user.role === "store_owner"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              {user.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stores Tab Content */}
        {activeTab === "stores" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Store className="h-5 w-5 text-green-600" />
                    Store Management
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage and monitor all stores in the system
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateStore(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Store
                </button>
              </div>
            </div>
            <div className="px-6 pb-6">
              {/* Store Filters */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-gray-700">Filters</span>
                  <button
                    onClick={clearStoreFilters}
                    className="ml-auto px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={storeFilters.name}
                    onChange={(e) => setStoreFilters({ ...storeFilters, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <input
                    type="text"
                    placeholder="Search by email..."
                    value={storeFilters.email}
                    onChange={(e) => setStoreFilters({ ...storeFilters, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <input
                    type="text"
                    placeholder="Search by address..."
                    value={storeFilters.address}
                    onChange={(e) => setStoreFilters({ ...storeFilters, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Stores Table */}
              {stores.length === 0 ? (
                <div className="text-center py-12">
                  <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No stores found</p>
                  <p className="text-gray-400">Try adjusting your filters or add a new store</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rating
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Ratings
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stores.map((store) => (
                        <tr key={store.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {store.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {store.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-xs truncate">
                            {store.address}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="font-medium">
                                {store.average_rating != null &&
                                !isNaN(Number(store.average_rating))
                                  ? Number(store.average_rating).toFixed(1)
                                  : "0.0"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {store.total_ratings}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-800 bg-opacity-50 opacity-50" 
              onClick={() => setShowCreateUser(false)}
              aria-hidden="true"
            ></div>
            
            {/* Modal */}
            <div className="inline-block w-full max-w-lg p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative z-50">
              <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Create New User</h3>
                <button
                  onClick={() => setShowCreateUser(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      minLength={20}
                      maxLength={60}
                      required
                      placeholder="Enter user's full name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      required
                      placeholder="user@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      minLength={8}
                      maxLength={16}
                      required
                      placeholder="Must contain uppercase & special character"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                      type="text"
                      value={newUser.address}
                      onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                      maxLength={400}
                      required
                      placeholder="Full address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="normal">Normal User</option>
                      <option value="store_owner">Store Owner</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Creating..." : "Create User"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateUser(false)}
                      disabled={loading}
                      className="px-4 py-2 text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Store Modal */}
      {showCreateStore && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50 opacity-50" 
              onClick={() => setShowCreateStore(false)}
              aria-hidden="true"
            ></div>
            
            {/* Modal */}
            <div className="inline-block w-full max-w-lg p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative z-50">
              <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Create New Store</h3>
                <button
                  onClick={() => setShowCreateStore(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                <form onSubmit={handleCreateStore} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Store Name</label>
                    <input
                      type="text"
                      value={newStore.name}
                      onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                      minLength={20}
                      maxLength={60}
                      required
                      placeholder="Enter store name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input
                      type="email"
                      value={newStore.email}
                      onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
                      required
                      placeholder="store@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                      type="text"
                      value={newStore.address}
                      onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
                      maxLength={400}
                      required
                      placeholder="Full store address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Owner ID (Optional)</label>
                    <input
                      type="number"
                      value={newStore.owner_id}
                      onChange={(e) => setNewStore({ ...newStore, owner_id: e.target.value })}
                      placeholder="Leave empty if no owner assigned"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Creating..." : "Create Store"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateStore(false)}
                      disabled={loading}
                      className="px-4 py-2 text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
