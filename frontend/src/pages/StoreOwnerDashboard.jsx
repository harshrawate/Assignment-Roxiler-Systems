"use client";

import { useState, useEffect } from "react";
import { Star, LogOut, Users, TrendingUp, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function StoreOwnerDashboard() {
  const { user, logout } = useAuth();
  const [myStore, setMyStore] = useState(null);
  const [storeRaters, setStoreRaters] = useState([]);
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMyStore(user.id);
    }
  }, [user]);

  const fetchMyStore = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/stores");
      const result = await response.json();
      if (result.success) {
        const userStore = result.data.find((store) => store.owner_id === userId);
        if (userStore) {
          // Normalize the data to handle null/undefined values
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
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
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
        alert("Password updated successfully");
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
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
    if (safeRating >= 4) return "Excellent";
    if (safeRating >= 3) return "Good";
    if (safeRating >= 2) return "Fair";
    return "Needs Improvement";
  };

  const getPerformanceColor = (rating) => {
    const safeRating = getRating(rating);
    if (safeRating >= 4) return "text-green-600";
    if (safeRating >= 3) return "text-blue-600";
    if (safeRating >= 2) return "text-yellow-600";
    return "text-red-600";
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
      {/* Enhanced Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Store Owner Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back, <span className="font-semibold">{user.name}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPasswordUpdate(true)}
                className="px-4 py-2 text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Update Password
              </button>
              <button
                onClick={logout}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Store Rating Card */}
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl shadow-sm">
                <div className="p-6 pb-4 flex flex-row items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Store Rating</h3>
                    <div className="text-2xl font-bold text-yellow-900 mt-2">
                      {getRating(myStore.average_rating).toFixed(1)}
                    </div>
                    <p className="text-xs text-yellow-700 mt-1">Average rating</p>
                  </div>
                  <div className="p-3 bg-yellow-600 rounded-xl">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              {/* Total Reviews Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl shadow-sm">
                <div className="p-6 pb-4 flex flex-row items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">Total Reviews</h3>
                    <div className="text-2xl font-bold text-blue-900 mt-2">
                      {myStore.total_ratings || 0}
                    </div>
                    <p className="text-xs text-blue-700 mt-1">Customer reviews</p>
                  </div>
                  <div className="p-3 bg-blue-600 rounded-xl">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              {/* Performance Card */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl shadow-sm">
                <div className="p-6 pb-4 flex flex-row items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-green-800">Performance</h3>
                    <div className={`text-2xl font-bold mt-2 ${getPerformanceColor(myStore.average_rating)}`}>
                      {getPerformanceText(myStore.average_rating)}
                    </div>
                    <p className="text-xs text-green-700 mt-1">Overall performance</p>
                  </div>
                  <div className="p-3 bg-green-600 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Store Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
              <div className="p-6 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  Store Information
                </h3>
              </div>
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">Store Name</h4>
                      <p className="text-gray-600 mt-1">{myStore.name}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">Email</h4>
                      <p className="text-gray-600 mt-1">{myStore.email}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">Average Rating</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(Math.round(getRating(myStore.average_rating)))}
                        <span className="text-gray-600">
                          ({getRating(myStore.average_rating).toFixed(1)}/5.0)
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">Total Ratings</h4>
                      <p className="text-gray-600 mt-1">{myStore.total_ratings || 0} reviews</p>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="font-medium text-gray-900 text-sm">Address</h4>
                    <p className="text-gray-600 mt-1">{myStore.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Customer Reviews */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Star className="h-5 w-5 text-blue-600" />
                  </div>
                  Customer Reviews
                </h3>
                <p className="text-sm text-gray-600 mt-1">Users who have rated your store</p>
              </div>
              <div className="px-6 pb-6">
                {storeRaters.length > 0 ? (
                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rating
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {storeRaters.map((rater) => (
                          <tr key={rater.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {rater.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {rater.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center gap-2">
                                {renderStars(rater.rating)}
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {rater.rating}/5
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {new Date(rater.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No reviews yet</p>
                    <p className="text-gray-400">Encourage customers to rate your store!</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Store Found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                No store found for your account. Please contact an administrator to set up your store.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Password Update Modal */}
      {showPasswordUpdate && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50" 
              onClick={() => setShowPasswordUpdate(false)}
              aria-hidden="true"
            ></div>
            
            {/* Modal */}
            <div className="inline-block w-full max-w-md p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative z-50">
              <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Update Password</h3>
                <button
                  onClick={() => setShowPasswordUpdate(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      minLength={8}
                      maxLength={16}
                      pattern="^(?=.*[A-Z])(?=.*[!@#$%^&*]).*$"
                      title="Password must be 8-16 characters with at least one uppercase letter and one special character"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    <p className="text-xs text-gray-500">
                      Password must be 8-16 characters with at least one uppercase letter and one special character
                    </p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Updating..." : "Update Password"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPasswordUpdate(false)}
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
