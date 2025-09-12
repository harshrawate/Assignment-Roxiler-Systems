import { useState, useEffect, useMemo } from "react";
import { 
  Users, Store, Star, Plus, LogOut, X, Filter, ArrowUpDown, ArrowUp, ArrowDown, 
  Sparkles, TrendingUp, Shield, CheckCircle
} from "lucide-react";
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
  
  // Sorting states
  const [userSortConfig, setUserSortConfig] = useState(null);
  const [storeSortConfig, setStoreSortConfig] = useState(null);
  
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

  // Validation states
  const [userErrors, setUserErrors] = useState({});
  const [storeErrors, setStoreErrors] = useState({});

  // Success notification state
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

 
  const sortData = (data, sortConfig) => {
    if (!sortConfig) return data;
    
    return [...data].sort((a, b) => {
      const { key, direction } = sortConfig;
      let aValue = a[key];
      let bValue = b[key];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      aValue = aValue.toString().toLowerCase();
      bValue = bValue.toString().toLowerCase();
      
      if (direction === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  };

  const sortedUsers = useMemo(() => {
    return sortData(users, userSortConfig);
  }, [users, userSortConfig]);

  const sortedStores = useMemo(() => {
    return sortData(stores, storeSortConfig);
  }, [stores, storeSortConfig]);

  const handleUserSort = (key) => {
    let direction = 'asc';
    if (userSortConfig && userSortConfig.key === key && userSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setUserSortConfig({ key, direction });
  };

  const handleStoreSort = (key) => {
    let direction = 'asc';
    if (storeSortConfig && storeSortConfig.key === key && storeSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setStoreSortConfig({ key, direction });
  };

  const SortIcon = ({ column, sortConfig }) => {
    if (!sortConfig || sortConfig.key !== column) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />;
    }
    
    if (sortConfig.direction === 'asc') {
      return <ArrowUp className="h-4 w-4 text-blue-600" />;
    } else {
      return <ArrowDown className="h-4 w-4 text-blue-600" />;
    }
  };

  
  const validateUser = (userData) => {
    const errors = {};
    
    if (!userData.name || userData.name.length < 20 || userData.name.length > 60) {
      errors.name = "Name must be between 20-60 characters";
    }
    
    if (!userData.email || !/\S+@\S+\.\S+/.test(userData.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!userData.password || userData.password.length < 8 || userData.password.length > 16) {
      errors.password = "Password must be 8-16 characters";
    } else if (!/(?=.*[A-Z])(?=.*[!@#$%^&*])/.test(userData.password)) {
      errors.password = "Password must contain at least one uppercase letter and one special character";
    }
    
    if (!userData.address || userData.address.length > 400) {
      errors.address = "Address is required and must be under 400 characters";
    }
    
    return errors;
  };

  const validateStore = (storeData) => {
    const errors = {};
    
    if (!storeData.name || storeData.name.length < 20 || storeData.name.length > 60) {
      errors.name = "Store name must be between 20-60 characters";
    }
    
    if (!storeData.email || !/\S+@\S+\.\S+/.test(storeData.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!storeData.address || storeData.address.length > 400) {
      errors.address = "Address is required and must be under 400 characters";
    }
    
    return errors;
  };

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 4000);
  };

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchUsers();
      fetchStores();
    }
  }, [user]);

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
    
    const errors = validateUser(newUser);
    setUserErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }

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
        setUserErrors({});
        fetchUsers();
        fetchStats();
        showNotification("User created successfully! 🎉");
      } else {
        showNotification(result.message, "error");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      showNotification("Error creating user. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    
    const errors = validateStore(newStore);
    setStoreErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }

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
        setStoreErrors({});
        fetchStores();
        fetchStats();
        showNotification("Store created successfully! 🏪");
      } else {
        showNotification(result.message, "error");
      }
    } catch (error) {
      console.error("Error creating store:", error);
      showNotification("Error creating store. Please try again.", "error");
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-t-4 border-purple-400 mx-auto animate-pulse"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Success Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border transition-all duration-300 transform ${
          notification.type === "success" 
            ? "bg-green-50 border-green-200 text-green-800" 
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          <div className="flex items-center gap-3">
            {notification.type === "success" ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <X className="h-5 w-5 text-red-600" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  Welcome back, <span className="font-semibold text-gray-800">{user.name}</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={logout}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium border border-gray-200 bg-white/80 text-gray-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Users Card */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl border border-blue-200/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white/90 mb-2">Total Users</h3>
                  <p className="text-4xl font-bold text-white mb-1">{stats.totalUsers.toLocaleString()}</p>
                  <div className="flex items-center gap-2 text-blue-100">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">Active users</span>
                  </div>
                </div>
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Stores Card */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl shadow-xl border border-green-200/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white/90 mb-2">Total Stores</h3>
                  <p className="text-4xl font-bold text-white mb-1">{stats.totalStores.toLocaleString()}</p>
                  <div className="flex items-center gap-2 text-green-100">
                    <Store className="h-4 w-4" />
                    <span className="text-sm">Registered stores</span>
                  </div>
                </div>
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <Store className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Ratings Card */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-xl border border-yellow-200/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white/90 mb-2">Total Ratings</h3>
                  <p className="text-4xl font-bold text-white mb-1">{stats.totalRatings.toLocaleString()}</p>
                  <div className="flex items-center gap-2 text-yellow-100">
                    <Star className="h-4 w-4" />
                    <span className="text-sm">Customer reviews</span>
                  </div>
                </div>
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <Star className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        
        <div className="flex space-x-2 bg-white/60 backdrop-blur-sm p-2 rounded-2xl mb-8 shadow-lg border border-white/20">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 py-4 px-6 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 ${
              activeTab === "users" 
                ? 'bg-white text-blue-600 shadow-lg border border-blue-100' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <Users className="h-5 w-5" />
            User Management
          </button>
          <button
            onClick={() => setActiveTab("stores")}
            className={`flex-1 py-4 px-6 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 ${
              activeTab === "stores" 
                ? 'bg-white text-green-600 shadow-lg border border-green-100' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <Store className="h-5 w-5" />
            Store Management
          </button>
        </div>

        {/* Users Tab Content  */}
        {activeTab === "users" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
            <div className="p-8 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    User Management
                  </h3>
                  <p className="text-gray-600 mt-2 text-lg">
                    Manage and monitor all users in the system
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateUser(true)}
                  className="inline-flex items-center gap-3 px-6 py-3 text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <Plus className="h-5 w-5" />
                  Add New User
                </button>
              </div>
            </div>
            
            <div className="px-8 pb-8">
              {/*  User Filters */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl mb-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Filter className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="font-semibold text-gray-800 text-lg">Advanced Filters</span>
                  <button
                    onClick={clearFilters}
                    className="ml-auto px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 border border-gray-200 hover:border-red-200"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Search by name</label>
                    <input
                      type="text"
                      placeholder="Enter name..."
                      value={filters.name}
                      onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Search by email</label>
                    <input
                      type="text"
                      placeholder="Enter email..."
                      value={filters.email}
                      onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Search by address</label>
                    <input
                      type="text"
                      placeholder="Enter address..."
                      value={filters.address}
                      onChange={(e) => setFilters({ ...filters, address: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Filter by role</label>
                    <select
                      value={filters.role}
                      onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="normal">Normal User</option>
                      <option value="store_owner">Store Owner</option>
                    </select>
                  </div>
                </div>
              </div>

              {/*  Users Table with Fixed Column Widths */}
              {sortedUsers.length === 0 ? (
                <div className="text-center py-16">
                  <div className="mb-6">
                    <Users className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-500 mb-2">No users found</h3>
                    <p className="text-gray-400 max-w-md mx-auto">Try adjusting your filters or add a new user to get started.</p>
                  </div>
                  <button
                    onClick={() => setShowCreateUser(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    Add First User
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-lg">
                  <table className="min-w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed' }}>
                    <colgroup>
                      <col style={{ width: '25%' }} />  {/* Name - Increased from 15% to 25% */}
                      <col style={{ width: '25%' }} />  {/* Email */}
                      <col style={{ width: '20%' }} />  {/* Address - Decreased from 25% to 20% */}
                      <col style={{ width: '12%' }} />  {/* Role - Decreased from 15% to 12% */}
                      <col style={{ width: '18%' }} />  {/* Created Date - Decreased from 25% to 18% */}
                    </colgroup>
                    <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                      <tr>
                        <th 
                          onClick={() => handleUserSort('name')}
                          className="group px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-blue-100 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            Name
                            <SortIcon column="name" sortConfig={userSortConfig} />
                          </div>
                        </th>
                        <th 
                          onClick={() => handleUserSort('email')}
                          className="group px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-blue-100 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            Email
                            <SortIcon column="email" sortConfig={userSortConfig} />
                          </div>
                        </th>
                        <th 
                          onClick={() => handleUserSort('address')}
                          className="group px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-blue-100 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            Address
                            <SortIcon column="address" sortConfig={userSortConfig} />
                          </div>
                        </th>
                        <th 
                          onClick={() => handleUserSort('role')}
                          className="group px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-blue-100 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            Role
                            <SortIcon column="role" sortConfig={userSortConfig} />
                          </div>
                        </th>
                        <th 
                          onClick={() => handleUserSort('created_at')}
                          className="group px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-blue-100 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            Created Date
                            <SortIcon column="created_at" sortConfig={userSortConfig} />
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {sortedUsers.map((user, index) => (
                        <tr key={user.id} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                          <td className="px-6 py-6" style={{ maxWidth: '0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="text-sm font-semibold text-gray-900" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }} title={user.name}>
                                {user.name}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-sm text-gray-600 font-medium" style={{ maxWidth: '0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={user.email}>
                            {user.email}
                          </td>
                          <td className="px-6 py-6 text-sm text-gray-600" style={{ maxWidth: '0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={user.address}>
                            {user.address}
                          </td>
                          <td className="px-6 py-6 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              user.role === "admin"
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : user.role === "store_owner"
                                ? "bg-purple-100 text-purple-800 border border-purple-200"
                                : "bg-gray-100 text-gray-800 border border-gray-200"
                            }`}>
                              {user.role.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-6 whitespace-nowrap" style={{ fontVariantNumeric: 'tabular-nums' }}>
                            <div className="text-sm font-bold text-gray-900">
                              {new Date(user.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(user.created_at).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </div>
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

        {/* Stores Tab Content remains the same... */}
        {activeTab === "stores" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
            <div className="p-8 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-xl">
                      <Store className="h-6 w-6 text-green-600" />
                    </div>
                    Store Management
                  </h3>
                  <p className="text-gray-600 mt-2 text-lg">
                    Manage and monitor all stores in the system
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateStore(true)}
                  className="inline-flex items-center gap-3 px-6 py-3 text-sm font-semibold bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <Plus className="h-5 w-5" />
                  Add New Store
                </button>
              </div>
            </div>
            
            <div className="px-8 pb-8">
              {/*  Store Filters */}
              <div className="bg-gradient-to-r from-gray-50 to-green-50 p-6 rounded-xl mb-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Filter className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="font-semibold text-gray-800 text-lg">Advanced Filters</span>
                  <button
                    onClick={clearStoreFilters}
                    className="ml-auto px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 border border-gray-200 hover:border-red-200"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Search by name</label>
                    <input
                      type="text"
                      placeholder="Enter store name..."
                      value={storeFilters.name}
                      onChange={(e) => setStoreFilters({ ...storeFilters, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Search by email</label>
                    <input
                      type="text"
                      placeholder="Enter email..."
                      value={storeFilters.email}
                      onChange={(e) => setStoreFilters({ ...storeFilters, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Search by address</label>
                    <input
                      type="text"
                      placeholder="Enter address..."
                      value={storeFilters.address}
                      onChange={(e) => setStoreFilters({ ...storeFilters, address: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/*  Stores Table */}
              {sortedStores.length === 0 ? (
                <div className="text-center py-16">
                  <div className="mb-6">
                    <Store className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-500 mb-2">No stores found</h3>
                    <p className="text-gray-400 max-w-md mx-auto">Try adjusting your filters or add a new store to get started.</p>
                  </div>
                  <button
                    onClick={() => setShowCreateStore(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    Add First Store
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-lg">
                  <table className="min-w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed' }}>
                    <colgroup>
                      <col style={{ width: '25%' }} />  {/* Store Name */}
                      <col style={{ width: '25%' }} />  {/* Email */}
                      <col style={{ width: '25%' }} />  {/* Address */}
                      <col style={{ width: '12.5%' }} />  {/* Rating */}
                      <col style={{ width: '12.5%' }} />  {/* Total Ratings */}
                    </colgroup>
                    <thead className="bg-gradient-to-r from-gray-50 to-green-50">
                      <tr>
                        <th 
                          onClick={() => handleStoreSort('name')}
                          className="group px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-green-100 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            Name
                            <SortIcon column="name" sortConfig={storeSortConfig} />
                          </div>
                        </th>
                        <th 
                          onClick={() => handleStoreSort('email')}
                          className="group px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-green-100 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            Email
                            <SortIcon column="email" sortConfig={storeSortConfig} />
                          </div>
                        </th>
                        <th 
                          onClick={() => handleStoreSort('address')}
                          className="group px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-green-100 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            Address
                            <SortIcon column="address" sortConfig={storeSortConfig} />
                          </div>
                        </th>
                        <th 
                          onClick={() => handleStoreSort('average_rating')}
                          className="group px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-green-100 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            Rating
                            <SortIcon column="average_rating" sortConfig={storeSortConfig} />
                          </div>
                        </th>
                        <th 
                          onClick={() => handleStoreSort('total_ratings')}
                          className="group px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-green-100 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            Total Ratings
                            <SortIcon column="total_ratings" sortConfig={storeSortConfig} />
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {sortedStores.map((store, index) => (
                        <tr key={store.id} className={`hover:bg-green-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                          <td className="px-6 py-6" style={{ maxWidth: '0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                {store.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="text-sm font-semibold text-gray-900" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }} title={store.name}>
                                {store.name}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-sm text-gray-600 font-medium" style={{ maxWidth: '0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={store.email}>
                            {store.email}
                          </td>
                          <td className="px-6 py-6 text-sm text-gray-600" style={{ maxWidth: '0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={store.address}>
                            {store.address}
                          </td>
                          <td className="px-6 py-6 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Star className="h-5 w-5 text-yellow-400 fill-current" />
                              <span className="font-semibold text-gray-900">
                                {store.average_rating != null &&
                                !isNaN(Number(store.average_rating))
                                  ? Number(store.average_rating).toFixed(1)
                                  : "0.0"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-6 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                              {store.total_ratings} reviews
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

      
      {showCreateUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div 
              className="fixed inset-0 transition-opacity bg-black/50 backdrop-blur-sm" 
              onClick={() => setShowCreateUser(false)}
              aria-hidden="true"
            ></div>
            
            <div className="inline-block w-full max-w-lg p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-3xl relative z-50 border border-white/20">
              <div className="flex items-center justify-between p-8 pb-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  Create New User
                </h3>
                <button
                  onClick={() => setShowCreateUser(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-xl hover:bg-white/50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-8 max-h-96 overflow-y-auto">
                <form onSubmit={handleCreateUser} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Full Name</label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      minLength={20}
                      maxLength={60}
                      required
                      placeholder="Enter user's full name (20-60 characters)"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                        userErrors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {userErrors.name && <p className="text-red-600 text-sm font-medium">{userErrors.name}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      required
                      placeholder="user@example.com"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                        userErrors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {userErrors.email && <p className="text-red-600 text-sm font-medium">{userErrors.email}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Password</label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      minLength={8}
                      maxLength={16}
                      required
                      placeholder="Must contain uppercase & special character"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                        userErrors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {userErrors.password && <p className="text-red-600 text-sm font-medium">{userErrors.password}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Address</label>
                    <textarea
                      value={newUser.address}
                      onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                      maxLength={400}
                      required
                      rows={3}
                      placeholder="Enter full address (max 400 characters)"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${
                        userErrors.address ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {userErrors.address && <p className="text-red-600 text-sm font-medium">{userErrors.address}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Role</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="normal">Normal User</option>
                      <option value="store_owner">Store Owner</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-4 pt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 inline-flex items-center justify-center px-6 py-3 text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Create User
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateUser(false)}
                      disabled={loading}
                      className="px-6 py-3 text-sm font-semibold border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200"
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

      {/*  Create Store Modal */}
      {showCreateStore && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div 
              className="fixed inset-0 transition-opacity bg-black/50 backdrop-blur-sm" 
              onClick={() => setShowCreateStore(false)}
              aria-hidden="true"
            ></div>
            
            <div className="inline-block w-full max-w-lg p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-3xl relative z-50 border border-white/20">
              <div className="flex items-center justify-between p-8 pb-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <Store className="h-6 w-6 text-green-600" />
                  </div>
                  Create New Store
                </h3>
                <button
                  onClick={() => setShowCreateStore(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-xl hover:bg-white/50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-8 max-h-96 overflow-y-auto">
                <form onSubmit={handleCreateStore} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Store Name</label>
                    <input
                      type="text"
                      value={newStore.name}
                      onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                      minLength={20}
                      maxLength={60}
                      required
                      placeholder="Enter store name (20-60 characters)"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                        storeErrors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                      }`}
                    />
                    {storeErrors.name && <p className="text-red-600 text-sm font-medium">{storeErrors.name}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                    <input
                      type="email"
                      value={newStore.email}
                      onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
                      required
                      placeholder="store@example.com"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                        storeErrors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                      }`}
                    />
                    {storeErrors.email && <p className="text-red-600 text-sm font-medium">{storeErrors.email}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Address</label>
                    <textarea
                      value={newStore.address}
                      onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
                      maxLength={400}
                      required
                      rows={3}
                      placeholder="Enter full store address (max 400 characters)"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${
                        storeErrors.address ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                      }`}
                    />
                    {storeErrors.address && <p className="text-red-600 text-sm font-medium">{storeErrors.address}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Owner ID (Optional)</label>
                    <input
                      type="number"
                      value={newStore.owner_id}
                      onChange={(e) => setNewStore({ ...newStore, owner_id: e.target.value })}
                      placeholder="Leave empty if no owner assigned"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                    />
                  </div>
                  
                  <div className="flex gap-4 pt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 inline-flex items-center justify-center px-6 py-3 text-sm font-semibold bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Create Store
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateStore(false)}
                      disabled={loading}
                      className="px-6 py-3 text-sm font-semibold border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200"
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
