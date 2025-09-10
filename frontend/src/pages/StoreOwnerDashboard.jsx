"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import { Star, LogOut, Users, TrendingUp } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"

export default function StoreOwnerDashboard() {
  const { user, logout } = useAuth()
  const [myStore, setMyStore] = useState(null)
  const [storeRaters, setStoreRaters] = useState([])
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false)
  const [newPassword, setNewPassword] = useState("")

  useEffect(() => {
    if (user) {
      fetchMyStore(user.id)
    }
  }, [user])

  const fetchMyStore = async (userId) => {
    try {
      const response = await fetch("http://localhost:5000/api/stores")
      const result = await response.json()
      if (result.success) {
        const userStore = result.data.find((store) => store.owner_id === userId)
        if (userStore) {
          setMyStore(userStore)
          fetchStoreRaters(userStore.id)
        }
      }
    } catch (error) {
      console.error("Error fetching store:", error)
    }
  }

  const fetchStoreRaters = async (storeId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/stores/${storeId}/raters`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const result = await response.json()
      if (result.success) {
        setStoreRaters(result.data)
      }
    } catch (error) {
      console.error("Error fetching store raters:", error)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.id}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ newPassword }),
      })
      const result = await response.json()
      if (result.success) {
        setShowPasswordUpdate(false)
        setNewPassword("")
        alert("Password updated successfully")
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error("Error updating password:", error)
      alert("Failed to update password")
    }
  }

  const renderStars = (rating) => (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  )

  if (!user) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Store Owner Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user.name}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowPasswordUpdate(true)} variant="outline">
                Update Password
              </Button>
              <Button onClick={logout} variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {myStore ? (
          <>
            {/* Store Overview */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Store Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{myStore.average_rating ? myStore.average_rating.toFixed(1) : "0.0"}</div>
                  <p className="text-xs text-muted-foreground">Average rating</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{myStore.total_ratings}</div>
                  <p className="text-xs text-muted-foreground">Customer reviews</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Performance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {myStore.average_rating >= 4
                      ? "Excellent"
                      : myStore.average_rating >= 3
                      ? "Good"
                      : myStore.average_rating >= 2
                      ? "Fair"
                      : "Needs Improvement"}
                  </div>
                  <p className="text-xs text-muted-foreground">Overall performance</p>
                </CardContent>
              </Card>
            </div>

            {/* Store Details */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Store Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-foreground">Store Name</h3>
                    <p className="text-muted-foreground">{myStore.name}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Email</h3>
                    <p className="text-muted-foreground">{myStore.email}</p>
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="font-medium text-foreground">Address</h3>
                    <p className="text-muted-foreground">{myStore.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
                <CardDescription>Users who have rated your store</CardDescription>
              </CardHeader>
              <CardContent>
                {storeRaters.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {storeRaters.map((rater) => (
                        <TableRow key={rater.id}>
                          <TableCell className="font-medium">{rater.name}</TableCell>
                          <TableCell>{rater.email}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {renderStars(rater.rating)}
                              <Badge variant="outline">{rater.rating}/5</Badge>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(rater.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No reviews yet. Encourage customers to rate your store!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                No store found for your account. Please contact an administrator to set up your store.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Password Update Modal */}
      {showPasswordUpdate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Update Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    maxLength={16}
                    pattern="^(?=.*[A-Z])(?=.*[!@#$%^&*]).*$"
                    title="Password must be 8-16 characters with at least one uppercase letter and one special character"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Password must be 8-16 characters with at least one uppercase letter and one special character
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Update Password
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowPasswordUpdate(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
