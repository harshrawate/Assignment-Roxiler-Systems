import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import HomePage from "./pages/HomePage"
import AdminDashboard from "./pages/AdminDashboard"
import UserDashboard from "./pages/UserDashboard"
import StoreOwnerDashboard from "./pages/StoreOwnerDashboard"
import { ProtectedRoute } from "./components/ProtectedRoute"

import "./App.css"

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/dashboard"
              element={
                <ProtectedRoute allowedRoles={["normal"]}>
                  <UserDashboard />
                 </ProtectedRoute>
              }
            />
            <Route
              path="/store-owner/dashboard"
              element={
                <ProtectedRoute allowedRoles={["store_owner"]}>
                  <StoreOwnerDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
