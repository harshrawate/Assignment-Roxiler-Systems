import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Star, LogOut, Search, MapPin } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"

export default function UserDashboard() {
  const { user, logout } = useAuth()
  const [stores, setStores] = useState([])
  const [searchFilters, setSearchFilters] = useState({ name: "", address: "" })
  const [userRatings, setUserRatings] = useState({})
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    fetchStores()
  }, [user])

  const fetchStores = async () => {
    try {
      const queryParams = new URLSearchParams(searchFilters).toString()
      const response = await fetch(`http://localhost:5000/api/stores?${queryParams}`)
      const result = await response.json()
      if (result.success) {
        // Normalize ratings to numbers
        const normalizedStores = result.data.map(store => ({
          ...store,
          average_rating: Number(store.average_rating || 0),
          total_ratings: Number(store.total_ratings || 0),
        }))
        setStores(normalizedStores)
        fetchUserRatings(normalizedStores)
      }
    } catch (error) {
      console.error("Error fetching stores:", error)
    }
  }

  const fetchUserRatings = async (storeList) => {
    const ratings = {}
    for (const store of storeList) {
      try {
        const response = await fetch(`http://localhost:5000/api/ratings/user/${user.id}/store/${store.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        const result = await response.json()
        if (result.success && result.data) ratings[store.id] = result.data.rating
      } catch (error) {
        console.error("Error fetching user rating:", error)
      }
    }
    setUserRatings(ratings)
  }

  const handleRating = async (storeId, rating) => {
    try {
      const response = await fetch("http://localhost:5000/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ user_id: user.id, store_id: storeId, rating }),
      })
      const result = await response.json()
      if (result.success) {
        setUserRatings({ ...userRatings, [storeId]: rating })
        fetchStores()
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error("Error submitting rating:", error)
      alert("Failed to submit rating")
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

  const renderStars = (storeId, currentRating = 0) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} onClick={() => handleRating(storeId, star)} className="focus:outline-none">
          <Star
            className={`h-5 w-5 ${
              star <= currentRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 hover:text-yellow-400"
            }`}
          />
        </button>
      ))}
    </div>
  )

  if (!user) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">User Dashboard</h1>
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
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Find Stores</CardTitle>
            <CardDescription>Search for stores by name and address</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <Input
                placeholder="Search by store name"
                value={searchFilters.name}
                onChange={(e) => setSearchFilters({ ...searchFilters, name: e.target.value })}
                className="flex-1"
              />
              <Input
                placeholder="Search by address"
                value={searchFilters.address}
                onChange={(e) => setSearchFilters({ ...searchFilters, address: e.target.value })}
                className="flex-1"
              />
              <Button onClick={fetchStores}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stores Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <Card key={store.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-balance">{store.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-pretty">{store.address}</span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Overall Rating */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Rating:</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="font-medium">
                        {Number(store.average_rating).toFixed(1)}
                      </span>
                      <span className="text-muted-foreground ml-1">({store.total_ratings} reviews)</span>
                    </div>
                  </div>

                  {/* User Rating */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Your Rating:</span>
                      {userRatings[store.id] && <Badge variant="secondary">{userRatings[store.id]} stars</Badge>}
                    </div>
                    {renderStars(store.id, userRatings[store.id] || 0)}
                    <p className="text-xs text-muted-foreground mt-1">
                      {userRatings[store.id] ? "Click to update your rating" : "Click to rate this store"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {stores.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No stores found. Try adjusting your search criteria.</p>
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
