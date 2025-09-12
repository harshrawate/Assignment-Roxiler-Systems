import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Star, LogOut, Search, MapPin, X, Store, Heart, TrendingUp, 
  Award, Sparkles, Shield, CheckCircle, AlertCircle, Filter, 
  Users, ChevronDown, ChevronUp, Eye, Calendar, Clock,
  UserCheck, Zap, ArrowUp, Gift, Target, Camera
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const [stores, setStores] = useState([]);
  const [searchFilters, setSearchFilters] = useState({ name: "", address: "" });
  const [userRatings, setUserRatings] = useState({});
  const [storeRatings, setStoreRatings] = useState({});
  const [expandedRatings, setExpandedRatings] = useState({});
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [hoveredStar, setHoveredStar] = useState({ storeId: null, star: 0 });
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    fetchStores();
    
    setTimeout(() => setShowWelcomeAnimation(false), 3000);
  }, [user]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchStores();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchFilters]);

  useEffect(() => {
    if (stores.length > 0) {
      const storeIds = stores.map(store => store.id);
      fetchAllRatingsForStores(storeIds);
    }
  }, [stores]);

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

  const fetchAllRatingsForStores = async (storeIds) => {
    try {
      const ratingRequests = storeIds.map(storeId => 
        fetch(`http://localhost:5000/api/ratings/store/${storeId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then(response => response.json())
        .then(result => ({
          storeId,
          ratings: result.success ? result.data || [] : []
        }))
        .catch(error => {
          console.error(`Error fetching ratings for store ${storeId}:`, error);
          return { storeId, ratings: [] };
        })
      );

      const results = await Promise.all(ratingRequests);
      
      const ratingsData = {};
      results.forEach(({ storeId, ratings }) => {
        ratingsData[storeId] = ratings.map(rating => ({
          ...rating,
          name: rating.name || rating.user_name || `User ${rating.user_id}`,
          created_at: rating.created_at || new Date().toISOString()
        }));
      });
      
      setStoreRatings(ratingsData);
    } catch (error) {
      console.error("Error fetching store ratings:", error);
      showNotification("Failed to load store ratings.", "error");
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
        fetchAllRatingsForStores([storeId]);
        
        // Enhanced success message with confetti effect
        const confettiMessage = rating === 5 ? "🎉 Fantastic! Perfect 5-star rating!" : 
                               rating === 4 ? "🌟 Excellent! Thanks for the 4-star rating!" :
                               rating === 3 ? "👍 Great! Thanks for the 3-star rating!" :
                               rating === 2 ? "💫 Thanks for the honest 2-star feedback!" :
                               "⭐ Thanks for your 1-star feedback!";
        
        showNotification(confettiMessage, "success");
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

  const renderStars = (storeId, currentRating = 0, isInteractive = true) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={isInteractive ? () => handleRating(storeId, star) : undefined}
          onMouseEnter={isInteractive ? () => setHoveredStar({ storeId, star }) : undefined}
          onMouseLeave={isInteractive ? () => setHoveredStar({ storeId: null, star: 0 }) : undefined}
          className={`focus:outline-none transition-all duration-300 ${isInteractive ? 'transform hover:scale-125 hover:rotate-12 cursor-pointer' : 'cursor-default'}`}
          disabled={!isInteractive}
        >
          <Star
            className={`h-${isInteractive ? '6' : '3'} w-${isInteractive ? '6' : '3'} transition-all duration-300 ${
              star <= (isInteractive && hoveredStar.storeId === storeId ? hoveredStar.star : currentRating)
                ? "text-yellow-400 fill-yellow-400 drop-shadow-lg filter brightness-110"
                : "text-gray-300 hover:text-yellow-300"
            }`}
          />
        </button>
      ))}
    </div>
  );

  const renderIndividualRatings = (storeId) => {
    const ratings = storeRatings[storeId] || [];
    const isExpanded = expandedRatings[storeId];
    const displayRatings = isExpanded ? ratings : ratings.slice(0, 3);

    if (ratings.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="relative">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-200 rounded-full animate-bounce"></div>
          </div>
          <p className="text-gray-500 text-sm font-medium">No reviews yet</p>
          <p className="text-gray-400 text-xs mt-1">Be the first to share your experience!</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-gray-800 flex items-center gap-2 text-base">
            <div className="p-1.5 bg-indigo-100 rounded-lg">
              <Eye className="h-4 w-4 text-indigo-600" />
            </div>
            Customer Reviews ({ratings.length})
          </h4>
          {ratings.length > 3 && (
            <button
              onClick={() => setExpandedRatings(prev => ({ ...prev, [storeId]: !isExpanded }))}
              className="group flex items-center gap-2 px-3 py-2 text-indigo-600 hover:text-indigo-700 text-sm font-semibold bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all duration-200"
            >
              {isExpanded ? (
                <>
                  Show Less <ChevronUp className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
                </>
              ) : (
                <>
                  View All <ChevronDown className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
                </>
              )}
            </button>
          )}
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-1">
          <div className="bg-white rounded-lg shadow-sm max-h-48 overflow-y-auto custom-scrollbar">
            <div className="divide-y divide-gray-100">
              {displayRatings.map((rating, index) => (
                <div key={rating.id || index} className="p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 via-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          {rating.name ? rating.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        {rating.user_id === user.id && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                            <UserCheck className="h-2.5 w-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {rating.name || 'Anonymous User'}
                          </p>
                          {rating.user_id === user.id && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200">
                              You
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(rating.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3.5 w-3.5 transition-all duration-200 ${
                              star <= rating.rating
                                ? "text-yellow-400 fill-yellow-400 drop-shadow-sm"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full">
                        <span className="text-xs font-bold text-orange-700">
                          {rating.rating}.0
                        </span>
                        <Zap className="h-3 w-3 text-orange-500" />
                      </div>
                    </div>
                  </div>
                  
                  {rating.comment && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border-l-3 border-blue-300">
                      <p className="text-gray-700 text-sm italic leading-relaxed">
                        "{rating.comment}"
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const clearFilters = () => {
    setSearchFilters({ name: "", address: "" });
  };

  const getRatingText = (rating) => {
    const texts = {
      1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good", 5: "Excellent"
    };
    return texts[rating] || "";
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-200 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-20 w-20 border-t-4 border-purple-600 mx-auto animate-spin"></div>
            <div className="absolute inset-3 rounded-full h-14 w-14 border-2 border-blue-200 mx-auto animate-ping"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-800">Loading your dashboard...</h2>
            <p className="text-gray-600">Preparing your personalized experience</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-10 right-10 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-10 left-1/2 w-32 h-32 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Success/Error Notification */}
      {notification.show && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-2xl border transition-all duration-500 transform ${
          notification.type === "success" 
            ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800" 
            : "bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-800"
        } backdrop-blur-lg`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl ${
              notification.type === "success" ? "bg-green-100" : "bg-red-100"
            }`}>
              {notification.type === "success" ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div>
              <span className="font-semibold text-sm block">{notification.message}</span>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Header with Welcome Animation */}
      <header className="bg-white/90 backdrop-blur-xl shadow-xl border-b border-white/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-2xl shadow-xl">
                  <Heart className="h-8 w-8 text-white animate-pulse" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <div className={`transition-all duration-1000 ${showWelcomeAnimation ? 'animate-slide-in-right' : ''}`}>
                  <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Store Explorer
                  </h1>
                </div>
                <div className={`transition-all duration-1000 delay-300 ${showWelcomeAnimation ? 'animate-slide-in-right' : ''}`}>
                  <p className="text-gray-700 font-medium flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-purple-500" />
                      <span>{getGreeting()},</span>
                    </div>
                    <span className="font-bold text-gray-900 px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full border border-purple-200">
                      {user.name}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowPasswordUpdate(true)}
                className="group inline-flex items-center gap-3 px-5 py-3 text-sm font-bold border-2 border-purple-200 bg-gradient-to-r from-white to-purple-50 text-purple-700 hover:from-purple-50 hover:to-purple-100 hover:border-purple-300 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Enhanced Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              icon: Store, 
              label: "Available Stores", 
              value: stores.length, 
              color: "from-purple-500 to-purple-600", 
              bg: "from-purple-50 to-purple-100",
              description: "Discover amazing places"
            },
            { 
              icon: Star, 
              label: "Your Reviews", 
              value: Object.keys(userRatings).length, 
              color: "from-blue-500 to-blue-600", 
              bg: "from-blue-50 to-blue-100",
              description: "Share your experiences"
            },
            { 
              icon: Award, 
              label: "Average Rating", 
              value: Object.values(userRatings).length > 0 
                ? (Object.values(userRatings).reduce((a, b) => a + b, 0) / Object.values(userRatings).length).toFixed(1)
                : "0.0", 
              color: "from-indigo-500 to-indigo-600", 
              bg: "from-indigo-50 to-indigo-100",
              description: "Your rating average"
            }
          ].map((stat, index) => (
            <div
              key={index}
              className="group relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl"></div>
              
              <div className="flex items-center justify-between mb-6">
                <div className={`p-4 bg-gradient-to-br ${stat.color} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className={`px-4 py-2 bg-gradient-to-r ${stat.bg} rounded-full border-2 border-white shadow-sm`}>
                  <Target className="h-4 w-4 text-gray-600" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-gray-900">{stat.label}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-gray-900 group-hover:text-purple-600 transition-colors">
                    {stat.value}
                  </span>
                  <ArrowUp className="h-4 w-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-sm text-gray-600 font-medium">{stat.description}</p>
              </div>
              
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <stat.icon className="h-16 w-16 text-gray-400" />
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Search Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 p-8">
            <div className="flex items-center gap-4 text-white">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Search className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-3xl font-bold mb-2">Discover Amazing Stores</h3>
                <p className="text-blue-100 text-lg">Find your next favorite shopping destination</p>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border-2 border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Filter className="h-6 w-6 text-purple-600" />
                  <span className="font-bold text-gray-900 text-xl">Smart Filters</span>
                </div>
                <button
                  onClick={clearFilters}
                  className="group flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 border-2 border-gray-200 hover:border-red-200"
                >
                  <X className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                  Clear All
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Store Name", placeholder: "Search by store name...", key: "name" },
                  { label: "Location", placeholder: "Search by address...", key: "address" }
                ].map((field) => (
                  <div key={field.key} className="space-y-3">
                    <label className=" text-sm font-bold text-gray-700 flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      {field.label}
                    </label>
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={searchFilters[field.key]}
                      onChange={(e) => setSearchFilters({ ...searchFilters, [field.key]: e.target.value })}
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white shadow-sm text-gray-900 font-medium placeholder-gray-400"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stores Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 mx-auto"></div>
                <div className="absolute inset-0 rounded-full h-16 w-16 border-t-4 border-purple-600 mx-auto animate-spin"></div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-800">Discovering Amazing Stores</h3>
                <p className="text-gray-600">Curating the best shopping experiences for you...</p>
              </div>
            </div>
          </div>
        ) : stores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stores.map((store) => (
              <div
                key={store.id}
                className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:rotate-1 overflow-hidden"
                onMouseEnter={() => setHoveredCard(store.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Store Header with Gradient */}
                <div className="relative p-8 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-500">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                  <div className="relative flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl border-2 border-white/50">
                        <span className="text-2xl font-black text-purple-600">
                          {store.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center border-2 border-white">
                        <Camera className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-black text-white mb-2 group-hover:text-yellow-200 transition-colors">
                        {store.name}
                      </h3>
                      <div className="flex items-center text-blue-100 group-hover:text-white transition-colors">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{store.address}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  {/* Overall Rating with Enhanced Design */}
                  <div className="relative p-6 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-2xl border-2 border-yellow-200 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/50 to-orange-100/50 opacity-50"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                          Overall Rating
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-5 w-5 ${
                                  star <= Math.round(store.average_rating)
                                    ? "text-yellow-500 fill-yellow-500 drop-shadow-lg"
                                    : "text-gray-300"
                                } transition-all duration-200`}
                              />
                            ))}
                          </div>
                          <div className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full shadow-lg">
                            <span className="font-black text-white text-sm">
                              {Number(store.average_rating).toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-700 font-semibold">
                          {store.total_ratings} review{store.total_ratings !== 1 ? 's' : ''}
                        </span>
                        <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full border border-green-200">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-700 font-bold">Trending</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Individual Customer Ratings */}
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200">
                    {renderIndividualRatings(store.id)}
                  </div>

                  {/* User Rating Section with Enhanced Interactivity */}
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-100/30 to-pink-100/30"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                          Your Rating
                        </span>
                        {userRatings[store.id] && (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg border-2 border-white">
                              {userRatings[store.id]} ⭐ {getRatingText(userRatings[store.id])}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-center p-6 bg-white rounded-2xl border-2 border-gray-100 shadow-inner">
                        {renderStars(store.id, userRatings[store.id] || 0)}
                      </div>
                      
                      <p className="text-xs text-gray-700 mt-4 text-center font-bold">
                        {userRatings[store.id]
                          ? "✨ Tap stars to update your rating"
                          : "🌟 Rate this store to help others"
                        }
                      </p>
                      
                      {hoveredStar.storeId === store.id && hoveredStar.star > 0 && (
                        <div className="text-center mt-4 animate-bounce">
                          <span className="inline-flex items-center px-4 py-2 rounded-2xl text-sm font-bold bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-xl border-2 border-white">
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
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30">
            <div className="text-center py-24">
              <div className="mb-8 relative">
                <Store className="h-24 w-24 text-gray-300 mx-auto mb-6 animate-pulse" />
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                  <div className="w-4 h-4 bg-gray-200 rounded-full animate-bounce"></div>
                </div>
              </div>
              <div className="space-y-4 mb-8">
                <h3 className="text-2xl font-bold text-gray-600">No Stores Found</h3>
                <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                  We couldn't find any stores matching your search criteria. Try adjusting your filters or explore all available stores.
                </p>
              </div>
              <button
                onClick={() => setSearchFilters({ name: "", address: "" })}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <Search className="h-5 w-5 group-hover:scale-110 transition-transform" />
                Discover All Stores
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
              className="fixed inset-0 transition-opacity bg-black/60 backdrop-blur-lg"
              onClick={() => setShowPasswordUpdate(false)}
              aria-hidden="true"
            ></div>

            <div className="inline-block w-full max-w-md p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-3xl relative z-50 border border-white/20">
              <div className="relative p-8 pb-6 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-500 text-white">
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
                    <label className="block text-sm font-bold text-gray-800">
                      New Password
                    </label>
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
                          : 'border-gray-200 focus:ring-purple-500/20 focus:border-purple-500'
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
                      className="flex-1 inline-flex items-center justify-center px-8 py-4 text-sm font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        @keyframes slide-in-right {
          0% {
            transform: translateX(100px);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.8s ease-out;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #8b5cf6, #3b82f6);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #7c3aed, #2563eb);
        }
      `}</style>
    </div>
  );
}
