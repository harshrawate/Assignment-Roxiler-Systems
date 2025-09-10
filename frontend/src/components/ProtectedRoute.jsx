import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

export function ProtectedRoute({ children, allowedRoles = [], redirectTo = "/" }) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // User not authenticated, redirect to login
        navigate(redirectTo, { replace: true })
        return
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // User doesn't have required role, redirect based on their role
        switch (user.role) {
          case "admin":
            navigate("/admin/dashboard", { replace: true })
            break
          case "store_owner":
            navigate("/store-owner/dashboard", { replace: true })
            break
          case "normal":
            navigate("/user/dashboard", { replace: true })
            break
          default:
            navigate("/", { replace: true })
        }
      }
    }
  }, [user, loading, allowedRoles, redirectTo, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Redirect handled in useEffect
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null // Redirect handled in useEffect
  }

  return children
}
