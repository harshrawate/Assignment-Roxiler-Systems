import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Star, LogOut, Search, MapPin, X, Store, Heart, TrendingUp, 
  Award, Sparkles, Shield, CheckCircle, AlertCircle, Filter
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const [stores, setStores] = useState([]);
  const [searchFilters, setSearchFilters] = useState({ name: "", address: "" });
  const [userRatings, setUserRatings] = useState({});
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [hoveredStar, setHoveredStar] = useState({ storeId: null, star: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    fetchStores();
  }, [user]);

  // Auto-apply search filters (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchStores();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchFilters]);

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 4000);
  };

  // Enhanced password validation
  const validatePassword = (password) => {
    const errors = {};
    
    if (!password || password.length < 8 || password.length > 16) {
      errors.password = "Password must be 8-16 characters";
    } else if (!/(?=.*[A-Z])(?=.*[!@#$%^&*])/.test(password)) {
      errors.password = "Password must contain at least one uppercase letter and one special character";
    }
    
    return errors;
  };

  const fetchStores = async () => {
    try {
      setLoading(true);
      const cleanFilters = Object.fromEntries(
        Object.entries(searchFilters).filter(([key, value]) => value !== "")
      );
      const queryParams = new URLSearchParams(cleanFilters).toString();
      const response = await fetch(`http://localhost:5000/api/stores?${queryParams}`);
      const result = await response.json();
      if (result.success) {
        const normalizedStores = result.data.map((store) => ({
          ...store,
          average_rating: Number(store.average_rating || 0),
          total_ratings: Number(store.total_ratings || 0),
        }));
        setStores(normalizedStores);
        fetchUserRatings(normalizedStores);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      setStores([]);
      showNotification("Failed to load stores. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRatings = async (storeList) => {
    const ratings = {};
    for (const store of storeList) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/ratings/user/${user.id}/store/${store.id}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        const result = await response.json();
        if (result.success && result.data) ratings[store.id] = result.data.rating;
      } catch (error) {
        console.error("Error fetching user rating:", error);
      }
    }
    setUserRatings(ratings);
  };

  const handleRating = async (storeId, rating) => {
    try {
      const response = await fetch("http://localhost:5000/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ user_id: user.id, store_id: storeId, rating }),
      });
      const result = await response.json();
      if (result.success) {
        setUserRatings({ ...userRatings, [storeId]: rating });
        fetchStores();
        showNotification(`Thanks for rating! Your ${rating}-star review has been submitted. ⭐`, "success");
      } else {
        showNotification(result.message, "error");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      showNotification("Failed to submit rating. Please try again.", "error");
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    const errors = validatePassword(newPassword);
    setPasswordErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/users/${user.id}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ newPassword }),
      });
      const result = await response.json();
      if (result.success) {
        setShowPasswordUpdate(false);
        setNewPassword("");
        setPasswordErrors({});
        showNotification("Password updated successfully! 🔒", "success");
      } else {
        showNotification(result.message, "error");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      showNotification("Failed to update password. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (storeId, currentRating = 0) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => handleRating(storeId, star)}
          onMouseEnter={() => setHoveredStar({ storeId, star })}
          onMouseLeave={() => setHoveredStar({ storeId: null, star: 0 })}
          className="focus:outline-none transition-all duration-200 transform hover:scale-110"
        >
          <Star
            className={`h-6 w-6 transition-all duration-200 ${
              star <= (hoveredStar.storeId === storeId ? hoveredStar.star : currentRating)
                ? "text-yellow-400 fill-yellow-400 drop-shadow-sm"
                : "text-gray-300 hover:text-yellow-300"
            }`}
          />
        </button>
      ))}
    </div>
  );

  const clearFilters = () => {
    setSearchFilters({ name: "", address: "" });
  };

  const getRatingText = (rating) => {
    const texts = {
      1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good", 5: "Excellent"
    };
    return texts[rating] || "";
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-t-4 border-blue-400 mx-auto animate-pulse"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      {/* Success/Error Notification */}
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
              <AlertCircle className="h-5 w-5 text-red-600" />
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
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  User Dashboard
                </h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  Welcome back, <span className="font-semibold text-gray-800">{user.name}</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowPasswordUpdate(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 bg-white/80 text-gray-700 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-600 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Shield className="h-4 w-4" />
                Update Password
              </button>
              
              <div className="h-8 w-px bg-gray-200"></div>
              
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
        {/* Enhanced Stats Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Store className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Available Stores</p>
                <p className="text-2xl font-bold text-gray-900">{stores.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Your Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(userRatings).length}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Award className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg. Rating Given</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.values(userRatings).length > 0 
                    ? (Object.values(userRatings).reduce((a, b) => a + b, 0) / Object.values(userRatings).length).toFixed(1)
                    : "0.0"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8">
          <div className="p-8 pb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl">
                <Search className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Discover Stores</h3>
                <p className="text-gray-600 mt-1">Find the perfect stores for your needs</p>
              </div>
            </div>
          </div>
          <div className="px-8 pb-8">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-100">
              <div className="flex items-center gap-3 mb-4">
                <Filter className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-gray-800">Search Filters</span>
                <button
                  onClick={clearFilters}
                  className="ml-auto px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-200 hover:border-red-200"
                >
                  Clear All
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Store Name</label>
                  <input
                    type="text"
                    placeholder="Search by store name..."
                    value={searchFilters.name}
                    onChange={(e) => setSearchFilters({ ...searchFilters, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    placeholder="Search by address..."
                    value={searchFilters.address}
                    onChange={(e) => setSearchFilters({ ...searchFilters, address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stores Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto"></div>
                <div className="absolute inset-0 rounded-full h-12 w-12 border-t-4 border-blue-400 mx-auto animate-pulse"></div>
              </div>
              <p className="mt-4 text-gray-600 font-medium">Finding stores for you...</p>
            </div>
          </div>
        ) : stores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stores.map((store) => (
              <div
                key={store.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-purple-200"
              >
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                          {store.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {store.name}
                          </h3>
                          <div className="flex items-center text-gray-600">
                            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="text-sm line-clamp-2">{store.address}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Overall Rating */}
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Overall Rating</span>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= Math.round(store.average_rating)
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-bold text-gray-900">
                            {Number(store.average_rating).toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">
                          Based on {store.total_ratings} review{store.total_ratings !== 1 ? 's' : ''}
                        </span>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-600 font-medium">Popular</span>
                        </div>
                      </div>
                    </div>

                    {/* User Rating */}
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-gray-700">Your Rating</span>
                        {userRatings[store.id] && (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                              {userRatings[store.id]} ⭐ {getRatingText(userRatings[store.id])}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-center p-3 bg-white rounded-lg border border-gray-100">
                        {renderStars(store.id, userRatings[store.id] || 0)}
                      </div>
                      
                      <p className="text-xs text-gray-600 mt-3 text-center font-medium">
                        {userRatings[store.id]
                          ? "Click stars to update your rating"
                          : "Rate this store to help others"
                        }
                      </p>
                      
                      {hoveredStar.storeId === store.id && hoveredStar.star > 0 && (
                        <div className="text-center mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-800">
                            {hoveredStar.star} Star{hoveredStar.star !== 1 ? 's' : ''} - {getRatingText(hoveredStar.star)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
            <div className="text-center py-16">
              <div className="mb-6">
                <Store className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-500 mb-2">No Stores Found</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  No stores found matching your search criteria. Try adjusting your search terms or explore all available stores.
                </p>
              </div>
              <button
                onClick={() => setSearchFilters({ name: "", address: "" })}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
              >
                <Search className="h-4 w-4" />
                View All Stores
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Password Update Modal */}
      {showPasswordUpdate && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div
              className="fixed inset-0 transition-opacity bg-black/50 backdrop-blur-sm"
              onClick={() => setShowPasswordUpdate(false)}
              aria-hidden="true"
            ></div>

            <div className="inline-block w-full max-w-md p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-3xl relative z-50 border border-white/20">
              <div className="flex items-center justify-between p-8 pb-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                  Update Password
                </h3>
                <button
                  onClick={() => {
                    setShowPasswordUpdate(false);
                    setPasswordErrors({});
                    setNewPassword("");
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-xl hover:bg-white/50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-8">
                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      minLength={8}
                      maxLength={16}
                      required
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                        passwordErrors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                      }`}
                    />
                    {passwordErrors.password && (
                      <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {passwordErrors.password}
                      </p>
                    )}
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-sm text-blue-800 font-medium mb-2">Password Requirements:</p>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${newPassword.length >= 8 && newPassword.length <= 16 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          8-16 characters long
                        </li>
                        <li className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          At least one uppercase letter
                        </li>
                        <li className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${/[!@#$%^&*]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          At least one special character (!@#$%^&*)
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 inline-flex items-center justify-center px-6 py-3 text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Update Password
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordUpdate(false);
                        setPasswordErrors({});
                        setNewPassword("");
                      }}
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
