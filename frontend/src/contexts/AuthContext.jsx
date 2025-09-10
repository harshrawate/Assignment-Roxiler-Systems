import { createContext, useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token")
      const userData = localStorage.getItem("user")

      if (token && userData) {
        const parsedUser = JSON.parse(userData)

        const response = await fetch("http://localhost:5000/api/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setUser(result.data)
          } else {
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            setUser(null)
          }
        } else {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          setUser(null)
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (result.success) {
        localStorage.setItem("token", result.data.token)
        localStorage.setItem("user", JSON.stringify(result.data.user))
        setUser(result.data.user)

        // Redirect based on role
        switch (result.data.user.role) {
          case "admin":
            navigate("/admin/dashboard")
            break
          case "store_owner":
            navigate("/store-owner/dashboard")
            break
          default:
            navigate("/user/dashboard")
        }

        return { success: true }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: "Login failed. Please try again." }
    }
  }

  const register = async (userData) => {
    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const result = await response.json()

      if (result.success) {
        localStorage.setItem("token", result.data.token)
        localStorage.setItem("user", JSON.stringify(result.data.user))
        setUser(result.data.user)
        navigate("/user/dashboard")
        return { success: true }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, message: "Registration failed. Please try again." }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    navigate("/")
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
