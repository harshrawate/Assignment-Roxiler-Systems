import React, { useState, useEffect } from "react";
import { 
  Star, LogOut, Users, TrendingUp, X, Shield, Store, Award, Calendar, 
  BarChart3, Sparkles, CheckCircle, AlertCircle, Heart, Target, Plus, 
  MapPin, Mail, Zap
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function StoreOwnerDashboard() {
  const { user, logout } = useAuth();
  // ✨ CHANGED: Now handling multiple stores instead of single store
  const [myStores, setMyStores] = useState([]);
  const [storeRatings, setStoreRatings] = useState({});
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [passwordErrors, setPasswordErrors] = useState({});

  useEffect(() => {
    if (user) {
      fetchMyStores(user.id);
    }
  }, [user]);

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 4000);
  };

  const validatePassword = (password) => {
    const errors = {};
    
    if (!password || password.length < 8 || password.length > 16) {
      errors.password = "Password must be 8-16 characters";
    } else if (!/(?=.*[A-Z])(?=.*[!@#$%^&*])/.test(password)) {
      errors.password = "Password must contain at least one uppercase letter and one special character";
    }
    
    return errors;
  };

  // ✨ UPDATED: Fetch all stores owned by the user
  // ✨ BEST SOLUTION: Handle both owner_id and email matching
const fetchMyStores = async (userId) => {
  try {
    setLoading(true);
    const response = await fetch("http://localhost:5000/api/stores");
    const result = await response.json();
    if (result.success) {
      // Find stores by:
      // 1. owner_id matches user ID (proper foreign key relationship)
      // 2. OR store email matches user email (fallback for NULL owner_id)
      const userStores = result.data.filter((store) => {
        return store.owner_id === userId || store.email === user.email;
      });
      
      if (userStores.length > 0) {
        const normalizedStores = userStores.map(store => ({
          ...store,
          average_rating: Number(store.average_rating) || 0,
          total_ratings: Number(store.total_ratings) || 0
        }));
        
        setMyStores(normalizedStores);
        
        normalizedStores.forEach(store => {
          fetchStoreRaters(store.id);
        });
      }
    }
  } catch (error) {
    console.error("Error fetching stores:", error);
    showNotification("Failed to load store data. Please try again.", "error");
  } finally {
    setLoading(false);
  }
};


  // ✨ UPDATED: Store ratings by store ID
  const fetchStoreRaters = async (storeId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/stores/${storeId}/raters`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        setStoreRatings(prev => ({
          ...prev,
          [storeId]: result.data || []
        }));
      }
    } catch (error) {
      console.error("Error fetching store raters:", error);
      setStoreRatings(prev => ({
        ...prev,
        [storeId]: []
      }));
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
        showNotification("🔒 Password updated successfully! Your account is now more secure.", "success");
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

  const renderStars = (rating) => (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 transition-colors ${
            star <= rating ? "text-yellow-400 fill-yellow-400 drop-shadow-sm" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );

  const getRating = (rating) => {
    const num = Number(rating);
    return isNaN(num) ? 0 : num;
  };

  const getPerformanceText = (rating) => {
    const safeRating = getRating(rating);
    if (safeRating >= 4.5) return "Outstanding";
    if (safeRating >= 4) return "Excellent";
    if (safeRating >= 3) return "Good";
    if (safeRating >= 2) return "Fair";
    return "Needs Improvement";
  };

  const getPerformanceColor = (rating) => {
    const safeRating = getRating(rating);
    if (safeRating >= 4.5) return "text-emerald-600 bg-emerald-100";
    if (safeRating >= 4) return "text-green-600 bg-green-100";
    if (safeRating >= 3) return "text-blue-600 bg-blue-100";
    if (safeRating >= 2) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  // ✨ Calculate overall stats across all stores
  const getOverallStats = () => {
    if (myStores.length === 0) {
      return {
        totalStores: 0,
        averageRating: 0,
        totalReviews: 0,
        bestPerforming: null
      };
    }

    const totalReviews = myStores.reduce((sum, store) => sum + (store.total_ratings || 0), 0);
    const weightedRatingSum = myStores.reduce((sum, store) => 
      sum + (getRating(store.average_rating) * (store.total_ratings || 0)), 0
    );
    const averageRating = totalReviews > 0 ? weightedRatingSum / totalReviews : 0;
    const bestPerforming = myStores.reduce((best, store) => 
      getRating(store.average_rating) > getRating(best.average_rating) ? store : best
    , myStores[0]);

    return {
      totalStores: myStores.length,
      averageRating,
      totalReviews,
      bestPerforming
    };
  };

  const stats = getOverallStats();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-t-4 border-blue-400 mx-auto animate-pulse"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading your store dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-50">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-lg border transition-all duration-300 transform ${
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
      <header className="bg-white/90 backdrop-blur-lg shadow-xl border-b border-white/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 via-blue-600 to-indigo-600 rounded-2xl shadow-xl">
                  <Store className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center border-2 border-white">
                  <span className="text-xs font-black text-white">{stats.totalStores}</span>
                </div>
              </div>
              <div className="space-y-1">
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-green-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Store Owner Hub
                </h1>
                <p className="text-gray-700 font-medium flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-green-500" />
                  Welcome back, <span className="font-bold text-gray-900">{user.name}</span>
                  <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-blue-100 rounded-full text-sm border border-green-200">
                    {stats.totalStores} Store{stats.totalStores !== 1 ? 's' : ''}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowPasswordUpdate(true)}
                className="group inline-flex items-center gap-3 px-5 py-3 text-sm font-bold border-2 border-green-200 bg-gradient-to-r from-white to-green-50 text-green-700 hover:from-green-50 hover:to-green-100 hover:border-green-300 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Shield className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                Update Password
              </button>
              
              <div className="h-10 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
              
              <button
                onClick={logout}
                className="group inline-flex items-center gap-3 px-6 py-3 text-sm font-bold border-2 border-red-200 bg-gradient-to-r from-white to-red-50 text-red-700 hover:from-red-50 hover:to-red-100 hover:border-red-300 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {myStores.length > 0 ? (
          <>
            {/* ✨ Enhanced Overall Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
              <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white/90 mb-2">Total Stores</h3>
                      <p className="text-4xl font-black text-white mb-1">{stats.totalStores}</p>
                      <div className="flex items-center gap-2 text-purple-100">
                        <Store className="h-4 w-4" />
                        <span className="text-sm">Business locations</span>
                      </div>
                    </div>
                    <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <Store className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden bg-gradient-to-br from-yellow-500 to-orange-600 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white/90 mb-2">Avg Rating</h3>
                      <p className="text-4xl font-black text-white mb-1">{stats.averageRating.toFixed(1)}</p>
                      <div className="flex items-center gap-2 text-yellow-100">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm">Across all stores</span>
                      </div>
                    </div>
                    <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <Star className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white/90 mb-2">Total Reviews</h3>
                      <p className="text-4xl font-black text-white mb-1">{stats.totalReviews}</p>
                      <div className="flex items-center gap-2 text-blue-100">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">Customer feedback</span>
                      </div>
                    </div>
                    <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white/90 mb-2">Top Store</h3>
                      <p className="text-lg font-black text-white mb-1 truncate">{stats.bestPerforming?.name || 'N/A'}</p>
                      <div className="flex items-center gap-2 text-green-100">
                        <Award className="h-4 w-4" />
                        <span className="text-sm">{getRating(stats.bestPerforming?.average_rating).toFixed(1)} rating</span>
                      </div>
                    </div>
                    <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <Award className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ✨ Individual Store Cards */}
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl">
                  <Store className="h-8 w-8 text-blue-600" />
                </div>
                Your Stores
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {myStores.map((store, index) => (
                  <div
                    key={store.id}
                    className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden"
                  >
                    {/* Store Header */}
                    <div className={`relative p-8 bg-gradient-to-br ${
                      index % 4 === 0 ? 'from-purple-500 to-indigo-600' :
                      index % 4 === 1 ? 'from-blue-500 to-cyan-600' :
                      index % 4 === 2 ? 'from-green-500 to-emerald-600' :
                      'from-orange-500 to-red-600'
                    }`}>
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                      <div className="relative flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-2xl font-black text-white mb-2 group-hover:text-yellow-200 transition-colors">
                            {store.name}
                          </h3>
                          <div className="space-y-2">
                            <div className="flex items-center text-white/90">
                              <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span className="text-sm font-medium truncate">{store.email}</span>
                            </div>
                            <div className="flex items-center text-white/90">
                              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span className="text-sm font-medium">{store.address}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
                            <span className="text-2xl font-black text-white">
                              {getRating(store.average_rating).toFixed(1)}
                            </span>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-bold ${getPerformanceColor(store.average_rating)} border-2 border-white/50`}>
                            {getPerformanceText(store.average_rating)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Store Stats */}
                    <div className="p-8">
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
                          <div className="flex items-center justify-center mb-2">
                            {renderStars(Math.round(getRating(store.average_rating)))}
                          </div>
                          <p className="text-sm font-bold text-gray-800">Customer Rating</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            <span className="text-xl font-black text-blue-600">{store.total_ratings || 0}</span>
                          </div>
                          <p className="text-sm font-bold text-gray-800">Reviews</p>
                        </div>
                      </div>

                      {/* Customer Reviews */}
                      <div className="border-t border-gray-100 pt-6">
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <Heart className="h-5 w-5 text-red-500" />
                          Customer Reviews
                        </h4>

                        {storeRatings[store.id] && storeRatings[store.id].length > 0 ? (
                          <div className="space-y-3 max-h-60 overflow-y-auto">
                            {storeRatings[store.id].slice(0, 3).map((rater, ratingIndex) => (
                              <div key={rater.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {rater.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-gray-900 text-sm truncate">{rater.name}</p>
                                    <p className="text-xs text-gray-500">{rater.email}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex">
                                    {renderStars(rater.rating)}
                                  </div>
                                  <div className="px-2 py-1 bg-yellow-100 rounded-full border border-yellow-200">
                                    <span className="text-xs font-bold text-yellow-800">{rater.rating}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {storeRatings[store.id].length > 3 && (
                              <p className="text-center text-sm text-gray-500 font-medium">
                                +{storeRatings[store.id].length - 3} more reviews
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <Heart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm font-semibold text-gray-500">No reviews yet</p>
                            <p className="text-xs text-gray-400">Encourage customers to leave feedback!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30">
            <div className="text-center py-24">
              <div className="mb-8 relative">
                <Store className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                  <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="space-y-4 mb-8">
                <h3 className="text-3xl font-bold text-gray-600">No Stores Found</h3>
                <p className="text-gray-500 max-w-lg mx-auto text-lg leading-relaxed">
                  You don't have any stores associated with your account yet. Contact an administrator to set up your stores and start managing your business.
                </p>
              </div>
              <div className="flex items-center justify-center gap-8 text-sm text-gray-500 mt-12">
                <div className="flex flex-col items-center gap-2">
                  <Users className="h-6 w-6 text-gray-400" />
                  <span className="font-medium">Manage Customers</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Star className="h-6 w-6 text-gray-400" />
                  <span className="font-medium">Track Ratings</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-gray-400" />
                  <span className="font-medium">View Analytics</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Password Update Modal - Same as before */}
      {showPasswordUpdate && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div 
              className="fixed inset-0 transition-opacity bg-black/60 backdrop-blur-lg" 
              onClick={() => {
                setShowPasswordUpdate(false);
                setPasswordErrors({});
                setNewPassword("");
              }}
              aria-hidden="true"
            ></div>
            
            <div className="inline-block w-full max-w-md p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-3xl relative z-50 border border-white/20">
              <div className="relative p-8 pb-6 bg-gradient-to-br from-green-500 via-blue-500 to-indigo-500 text-white">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative flex items-center justify-between">
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <Shield className="h-6 w-6" />
                    </div>
                    Secure Your Account
                  </h3>
                  <button
                    onClick={() => {
                      setShowPasswordUpdate(false);
                      setPasswordErrors({});
                      setNewPassword("");
                    }}
                    className="text-white/80 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/10"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-8">
                <form onSubmit={handlePasswordUpdate} className="space-y-8">
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-800">New Password</label>
                    <input
                      type="password"
                      placeholder="Enter your new secure password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      minLength={8}
                      maxLength={16}
                      required
                      className={`w-full px-6 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all duration-300 ${
                        passwordErrors.password 
                          ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                          : 'border-gray-200 focus:ring-green-500/20 focus:border-green-500'
                      } text-gray-900 font-medium`}
                    />
                    {passwordErrors.password && (
                      <p className="text-red-600 text-sm font-semibold flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-200">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        {passwordErrors.password}
                      </p>
                    )}
                    
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-100">
                      <p className="text-sm text-blue-800 font-bold mb-4 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Security Requirements:
                      </p>
                      <ul className="space-y-3">
                        {[
                          { check: newPassword.length >= 8 && newPassword.length <= 16, text: "8-16 characters long" },
                          { check: /[A-Z]/.test(newPassword), text: "At least one uppercase letter" },
                          { check: /[!@#$%^&*]/.test(newPassword), text: "At least one special character" }
                        ].map((requirement, index) => (
                          <li key={index} className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full transition-all duration-300 ${
                              requirement.check ? 'bg-green-500 scale-110' : 'bg-gray-300'
                            }`}>
                              {requirement.check && <CheckCircle className="h-4 w-4 text-white" />}
                            </div>
                            <span className={`text-sm font-medium transition-colors ${
                              requirement.check ? 'text-green-700' : 'text-gray-600'
                            }`}>
                              {requirement.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 inline-flex items-center justify-center px-8 py-4 text-sm font-bold bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                          Securing Account...
                        </>
                      ) : (
                        <>
                          <Shield className="h-5 w-5 mr-3" />
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
                      className="px-8 py-4 text-sm font-bold border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-2xl transition-all duration-300"
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
