"use client";

import { useState } from "react";
import { 
  Star, Store, BarChart3, Eye, EyeOff, Shield, Heart, Users, 
  CheckCircle, AlertCircle, Sparkles, Award, TrendingUp, MapPin,
  ArrowRight, Zap, Globe, Lock
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [loginErrors, setLoginErrors] = useState({});
  const [registerErrors, setRegisterErrors] = useState({});

  const { login, register, user } = useAuth();

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 4000);
  };

  // Enhanced validation
  const validateLoginData = (data) => {
    const errors = {};
    if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!data.password) {
      errors.password = "Password is required";
    }
    return errors;
  };

  const validateRegisterData = (data) => {
    const errors = {};
    
    if (!data.name || data.name.length < 20 || data.name.length > 60) {
      errors.name = "Name must be between 20-60 characters";
    }
    
    if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!data.password || data.password.length < 8 || data.password.length > 16) {
      errors.password = "Password must be 8-16 characters";
    } else if (!/(?=.*[A-Z])(?=.*[!@#$%^&*])/.test(data.password)) {
      errors.password = "Password must contain at least one uppercase letter and one special character";
    }
    
    if (!data.address || data.address.length > 400) {
      errors.address = "Address is required and must be under 400 characters";
    }
    
    return errors;
  };

  // Redirect if user is already logged in
  if (user) {
    switch (user.role) {
      case "admin":
        window.location.href = "/admin/dashboard";
        break;
      case "store_owner":
        window.location.href = "/store-owner/dashboard";
        break;
      default:
        window.location.href = "/user/dashboard";
    }
    return null;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setLoginErrors({});

    const errors = validateLoginData(loginData);
    if (Object.keys(errors).length > 0) {
      setLoginErrors(errors);
      setIsLoading(false);
      return;
    }

    const result = await login(loginData.email, loginData.password);

    if (!result.success) {
      setError(result.message);
      showNotification(result.message, "error");
    } else {
      showNotification("Welcome back! Redirecting to your dashboard...", "success");
    }

    setIsLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setRegisterErrors({});

    const errors = validateRegisterData(registerData);
    if (Object.keys(errors).length > 0) {
      setRegisterErrors(errors);
      setIsLoading(false);
      return;
    }

    const result = await register(registerData);

    if (!result.success) {
      setError(result.message);
      showNotification(result.message, "error");
    } else {
      showNotification("Account created successfully! Welcome to our community!", "success");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-gradient-to-br from-pink-400/10 to-blue-400/10 rounded-full blur-3xl translate-x-1/2 animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-br from-indigo-400/10 to-green-400/10 rounded-full blur-3xl translate-y-1/2 animate-pulse delay-2000"></div>
      </div>

      {/* Success/Error Notification */}
      {notification.show && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl border transition-all duration-500 transform ${
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

      {/* Enhanced Hero Section */}
      <div className="relative z-10 py-20 lg:py-32">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="flex items-center justify-center mb-8">
              <div className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl">
                <Star className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
              Store Rating
              <br />
              <span className="text-4xl md:text-6xl">Platform</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
              Discover amazing stores, share your experiences, and help build a community of informed shoppers. 
              Your voice matters in shaping the future of retail.
            </p>

            {/* Stats Row */}
            <div className="flex items-center justify-center gap-8 text-sm text-gray-600 mb-12">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-blue-600" />
                <span>1000+ Stores</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span>10K+ Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-600" />
                <span>50K+ Reviews</span>
              </div>
            </div>
          </div>

          {/* Enhanced Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {/* Discover Stores Card */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 text-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/90">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Store className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Discover Stores</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Browse through thousands of registered stores and find exactly what you're looking for in your area.
              </p>
              <div className="flex items-center justify-center text-blue-600 font-medium">
                <span className="mr-2">Explore now</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Rate & Review Card */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 text-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/90">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Rate & Review</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Share your experiences with our intuitive 5-star rating system and help others make informed decisions.
              </p>
              <div className="flex items-center justify-center text-yellow-600 font-medium">
                <span className="mr-2">Start rating</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Track Performance Card */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 text-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/90">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Track Performance</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Store owners can monitor ratings, customer feedback, and business insights in real-time.
              </p>
              <div className="flex items-center justify-center text-green-600 font-medium">
                <span className="mr-2">View analytics</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Community Impact Card */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 text-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/90">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Build Community</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Join a thriving community of shoppers sharing honest reviews and recommendations.
              </p>
              <div className="flex items-center justify-center text-purple-600 font-medium">
                <span className="mr-2">Join community</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Authentication Section */}
      <div className="relative z-10 pb-20">
        <div className="container max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
          {/* Error Display */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Enhanced Auth Card */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Tab Navigation with Enhanced Design */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 pb-6 border-b border-gray-100">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Started</h2>
                <p className="text-gray-600">Join thousands of users sharing their store experiences</p>
              </div>
              
              <div className="flex bg-white/60 p-1 rounded-2xl shadow-inner">
                <button
                  onClick={() => setActiveTab("login")}
                  className={`flex-1 py-3 px-6 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                    activeTab === "login"
                      ? 'bg-white text-blue-600 shadow-lg border border-blue-100'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <Lock className="h-4 w-4" />
                  Login
                </button>
                <button
                  onClick={() => setActiveTab("register")}
                  className={`flex-1 py-3 px-6 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                    activeTab === "register"
                      ? 'bg-white text-purple-600 shadow-lg border border-purple-100'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Register
                </button>
              </div>
            </div>

            {/* Login Tab with Enhanced Design */}
            {activeTab === "login" && (
              <div className="p-8">
                <div className="mb-8 text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h3>
                  <p className="text-gray-600">Sign in to continue your store rating journey</p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                      className={`w-full px-4 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 bg-white shadow-sm ${
                        loginErrors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {loginErrors.email && (
                      <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {loginErrors.email}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                        className={`w-full px-4 py-4 pr-12 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 bg-white shadow-sm ${
                          loginErrors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {loginErrors.password && (
                      <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {loginErrors.password}
                      </p>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Signing you in...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Zap className="h-5 w-5" />
                        Sign In to Continue
                      </div>
                    )}
                  </button>
                </form>
                
                <div className="mt-8 text-center">
                  <p className="text-gray-600">
                    New to our platform?{' '}
                    <button
                      onClick={() => setActiveTab("register")}
                      className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Create an account
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* Register Tab with Enhanced Design */}
            {activeTab === "register" && (
              <div className="p-8">
                <div className="mb-8 text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Join Our Community</h3>
                  <p className="text-gray-600">Create your account and start rating stores today</p>
                </div>
                
                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Full Name</label>
                    <input
                      type="text"
                      placeholder="Enter your full name (20-60 characters)"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      minLength={20}
                      maxLength={60}
                      required
                      className={`w-full px-4 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 bg-white shadow-sm ${
                        registerErrors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                      }`}
                    />
                    {registerErrors.name && (
                      <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {registerErrors.name}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                      className={`w-full px-4 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 bg-white shadow-sm ${
                        registerErrors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                      }`}
                    />
                    {registerErrors.email && (
                      <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {registerErrors.email}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Password</label>
                    <div className="relative">
                      <input
                        type={showRegisterPassword ? "text" : "password"}
                        placeholder="Create a secure password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        minLength={8}
                        maxLength={16}
                        required
                        className={`w-full px-4 py-4 pr-12 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 bg-white shadow-sm ${
                          registerErrors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showRegisterPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {registerErrors.password && (
                      <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {registerErrors.password}
                      </p>
                    )}
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-sm text-blue-800 font-medium mb-2">Password Requirements:</p>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${registerData.password.length >= 8 && registerData.password.length <= 16 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          8-16 characters long
                        </li>
                        <li className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(registerData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          At least one uppercase letter
                        </li>
                        <li className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${/[!@#$%^&*]/.test(registerData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          At least one special character (!@#$%^&*)
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Address</label>
                    <textarea
                      placeholder="Enter your full address (max 400 characters)"
                      value={registerData.address}
                      onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                      maxLength={400}
                      rows={4}
                      required
                      className={`w-full px-4 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 resize-none bg-white shadow-sm ${
                        registerErrors.address ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                      }`}
                    />
                    {registerErrors.address && (
                      <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {registerErrors.address}
                      </p>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Creating your account...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Create My Account
                      </div>
                    )}
                  </button>
                </form>
                
                <div className="mt-8 text-center">
                  <p className="text-gray-600">
                    Already have an account?{' '}
                    <button
                      onClick={() => setActiveTab("login")}
                      className="font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                    >
                      Sign in here
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-600" />
              <span>Trusted Platform</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-600" />
              <span>Verified Reviews</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
