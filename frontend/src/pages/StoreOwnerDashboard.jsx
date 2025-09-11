"use client";

import React,{ useState, useEffect } from "react";
import { 
  Star, LogOut, Users, TrendingUp, X, Shield, Store, Award, Calendar, 
  BarChart3, Sparkles, CheckCircle, AlertCircle, Heart, Target
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function StoreOwnerDashboard() {
  const { user, logout } = useAuth();
  const [myStore, setMyStore] = useState(null);
  const [storeRaters, setStoreRaters] = useState([]);
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [passwordErrors, setPasswordErrors] = useState({});

  useEffect(() => {
    if (user) {
      fetchMyStore(user.id);
    }
  }, [user]);

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

  const fetchMyStore = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/stores");
      const result = await response.json();
      if (result.success) {
        const userStore = result.data.find((store) => store.owner_id === userId);
        if (userStore) {
          const normalizedStore = {
            ...userStore,
            average_rating: Number(userStore.average_rating) || 0,
            total_ratings: Number(userStore.total_ratings) || 0
          };
          setMyStore(normalizedStore);
          fetchStoreRaters(normalizedStore.id);
        }
      }
    } catch (error) {
      console.error("Error fetching store:", error);
      showNotification("Failed to load store data. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreRaters = async (storeId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/stores/${storeId}/raters`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        setStoreRaters(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching store raters:", error);
      setStoreRaters([]);
      showNotification("Failed to load customer reviews.", "error");
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

  // Helper function to safely get rating value
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
    if (safeRating >= 4.5) return "text-emerald-600";
    if (safeRating >= 4) return "text-green-600";
    if (safeRating >= 3) return "text-blue-600";
    if (safeRating >= 2) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceIcon = (rating) => {
    const safeRating = getRating(rating);
    if (safeRating >= 4) return Award;
    if (safeRating >= 3) return Target;
    return TrendingUp;
  };

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
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-600 to-blue-600 rounded-xl shadow-lg">
                <Store className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Store Owner Dashboard
                </h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-green-500" />
                  Welcome back, <span className="font-semibold text-gray-800">{user.name}</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowPasswordUpdate(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 bg-white/80 text-gray-700 hover:bg-green-50 hover:border-green-200 hover:text-green-600 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
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
        {myStore ? (
          <>
            {/* Enhanced Store Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              {/* Store Rating Card */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-xl border border-yellow-200/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white/90 mb-2">Store Rating</h3>
                      <p className="text-4xl font-bold text-white mb-1">
                        {getRating(myStore.average_rating).toFixed(1)}
                      </p>
                      <div className="flex items-center gap-2 text-yellow-100">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm">Average rating</span>
                      </div>
                    </div>
                    <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <Star className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Reviews Card */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl border border-blue-200/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white/90 mb-2">Total Reviews</h3>
                      <p className="text-4xl font-bold text-white mb-1">
                        {myStore.total_ratings || 0}
                      </p>
                      <div className="flex items-center gap-2 text-blue-100">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">Customer reviews</span>
                      </div>
                    </div>
                    <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Card */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl shadow-xl border border-green-200/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white/90 mb-2">Performance</h3>
                      <p className="text-2xl font-bold text-white mb-1">
                        {getPerformanceText(myStore.average_rating)}
                      </p>
                      <div className="flex items-center gap-2 text-green-100">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm">Overall status</span>
                      </div>
                    </div>
                    <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                      {React.createElement(getPerformanceIcon(myStore.average_rating), {
                        className: "h-8 w-8 text-white"
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Store Details */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 mb-8">
              <div className="p-8 pb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Store className="h-6 w-6 text-green-600" />
                  </div>
                  Store Information
                </h3>
                <p className="text-gray-600 mt-2 text-lg">Your store details and performance metrics</p>
              </div>
              <div className="px-8 pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100">
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">Store Name</h4>
                      <p className="text-gray-700 font-medium">{myStore.name}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl border border-gray-100">
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">Contact Email</h4>
                      <p className="text-gray-700">{myStore.email}</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100">
                      <h4 className="font-semibold text-gray-900 text-sm mb-3">Customer Rating</h4>
                      <div className="flex items-center gap-3">
                        {renderStars(Math.round(getRating(myStore.average_rating)))}
                        <span className="text-gray-700 font-medium">
                          ({getRating(myStore.average_rating).toFixed(1)}/5.0)
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">Review Count</h4>
                      <p className="text-gray-700 font-medium">{myStore.total_ratings || 0} customer reviews</p>
                    </div>
                  </div>
                  <div className="lg:col-span-2">
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">Store Address</h4>
                      <p className="text-gray-700">{myStore.address}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Customer Reviews */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
              <div className="p-8 pb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Heart className="h-6 w-6 text-blue-600" />
                  </div>
                  Customer Reviews
                </h3>
                <p className="text-gray-600 mt-2 text-lg">See what your customers are saying about your store</p>
              </div>
              <div className="px-8 pb-8">
                {storeRaters.length > 0 ? (
                  <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                        <tr>
                          <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Rating
                          </th>
                          <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {storeRaters.map((rater, index) => (
                          <tr key={rater.id} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                            <td className="px-8 py-6 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm">
                                  {rater.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {rater.name}
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-600 font-medium">
                              {rater.email}
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                {renderStars(rater.rating)}
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
                                  {rater.rating}/5 Stars
                                </span>
                              </div>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">
                                {new Date(rater.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(rater.created_at).toLocaleTimeString('en-US', {
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
                ) : (
                  <div className="text-center py-16">
                    <div className="mb-6">
                      <Heart className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-500 mb-2">No Reviews Yet</h3>
                      <p className="text-gray-400 max-w-md mx-auto">
                        Your store hasn't received any customer reviews yet. Encourage customers to rate your store to build trust and credibility!
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        <span>Build reputation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Attract customers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span>Grow business</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
            <div className="text-center py-16">
              <div className="mb-6">
                <Store className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-500 mb-2">No Store Found</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  No store found for your account. Please contact an administrator to set up your store and start managing your business.
                </p>
              </div>
              <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mt-8">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Manage customers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <span>Track ratings</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>View analytics</span>
                </div>
              </div>
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
              onClick={() => {
                setShowPasswordUpdate(false);
                setPasswordErrors({});
                setNewPassword("");
              }}
              aria-hidden="true"
            ></div>
            
            <div className="inline-block w-full max-w-md p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-3xl relative z-50 border border-white/20">
              <div className="flex items-center justify-between p-8 pb-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-blue-50">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <Shield className="h-6 w-6 text-green-600" />
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
                        passwordErrors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
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
                      className="flex-1 inline-flex items-center justify-center px-6 py-3 text-sm font-semibold bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
