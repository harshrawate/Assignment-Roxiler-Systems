"use client"

import { useAuth } from "./AuthProvider"

export function RoleGuard({ children, allowedRoles = [], fallback = null }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || (allowedRoles.length > 0 && !allowedRoles.includes(user.role))) {
    return fallback
  }

  return children
}
