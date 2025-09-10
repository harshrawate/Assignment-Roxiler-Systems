import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, LogOut, Search, MapPin, X, Store } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const [stores, setStores] = useState([]);
  const [searchFilters, setSearchFilters] = useState({ name: "", address: "" });
  const [userRatings, setUserRatings] = useState({});
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
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

  const fetchStores = async () => {
    try {
      setLoading(true);
      // Filter out empty values
      const cleanFilters = Object.fromEntries(
        Object.entries(searchFilters).filter(([key, value]) => value !== "")
      );
      const queryParams = new URLSearchParams(cleanFilters).toString();
      const response = await fetch(`http://localhost:5000/api/stores?${queryParams}`);
      const result = await response.json();
      if (result.success) {
        // Normalize ratings to numbers
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
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Failed to submit rating");
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

  const renderStars = (storeId, currentRating = 0) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => handleRating(storeId, star)}
          className="focus:outline-none transition-colors"
        >
          <Star
            className={`h-5 w-5 transition-colors ${
              star <= currentRating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300 hover:text-yellow-400"
            }`}
          />
        </button>
      ))}
    </div>
  );

  const clearFilters = () => {
    setSearchFilters({ name: "", address: "" });
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
              <h1 className="text-3xl font-bold  bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                User Dashboard
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
        {/* Enhanced Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="p-6 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Search className="h-5 w-5 text-purple-600" />
              </div>
              Find Stores
            </h3>
            <p className="text-sm text-gray-600 mt-1">Search for stores by name and address</p>
          </div>
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by store name..."
                  value={searchFilters.name}
                  onChange={(e) => setSearchFilters({ ...searchFilters, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by address..."
                  value={searchFilters.address}
                  onChange={(e) => setSearchFilters({ ...searchFilters, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Stores Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : stores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <div
                key={store.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 hover:border-gray-200"
              >
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
                        {store.name}
                      </h3>
                      <div className="flex items-start text-gray-600 text-sm">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{store.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <div className="space-y-4">
                    {/* Overall Rating */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Overall Rating:</span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                          <span className="font-semibold text-gray-900">
                            {Number(store.average_rating).toFixed(1)}
                          </span>
                          <span className="text-gray-500 ml-1 text-sm">
                            ({store.total_ratings} reviews)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* User Rating */}
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">Your Rating:</span>
                        {userRatings[store.id] && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {userRatings[store.id]} stars
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-center p-2 bg-gray-50 rounded-lg">
                        {renderStars(store.id, userRatings[store.id] || 0)}
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        {userRatings[store.id]
                          ? "Click to update your rating"
                          : "Click to rate this store"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-center py-12">
              <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Stores Found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                No stores found matching your search criteria. Try adjusting your search terms.
              </p>
              <button
                onClick={() => setSearchFilters({ name: "", address: "" })}
                className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              >
                Clear Search
              </button>
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
