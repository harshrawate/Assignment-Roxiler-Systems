"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Star, Store, BarChart3 } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
  })
  const [error, setError] = useState("")

  const { login, register, user } = useAuth()

  // Redirect if user is already logged in
  if (user) {
    switch (user.role) {
      case "admin":
        window.location.href = "/admin/dashboard"
        break
      case "store_owner":
        window.location.href = "/store-owner/dashboard"
        break
      default:
        window.location.href = "/user/dashboard"
    }
    return null
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const result = await login(loginData.email, loginData.password)

    if (!result.success) {
      setError(result.message)
    }

    setIsLoading(false)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const result = await register(registerData)

    if (!result.success) {
      setError(result.message)
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/5 to-secondary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">Store Rating Platform</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Discover, rate, and review stores in your area. Join our community of users sharing their experiences.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center">
              <CardHeader>
                <Store className="h-12 w-12 text-primary mx-auto mb-2" />
                <CardTitle>Discover Stores</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Browse through hundreds of registered stores and find exactly what you're looking for.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Star className="h-12 w-12 text-secondary mx-auto mb-2" />
                <CardTitle>Rate & Review</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Share your experiences with a simple 1-5 star rating system and help others make informed decisions.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-accent mx-auto mb-2" />
                <CardTitle>Track Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Store owners can monitor their ratings and customer feedback to improve their services.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Authentication Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome Back</CardTitle>
                  <CardDescription>Sign in to your account to continue rating stores.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>Join our community and start rating stores today.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name (20-60 characters)"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        minLength={20}
                        maxLength={60}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="Enter your email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="8-16 chars, 1 uppercase, 1 special char"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        minLength={8}
                        maxLength={16}
                        pattern="^(?=.*[A-Z])(?=.*[!@#$%^&*]).*$"
                        title="Password must be 8-16 characters with at least one uppercase letter and one special character"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        type="text"
                        placeholder="Enter your address (max 400 characters)"
                        value={registerData.address}
                        onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                        maxLength={400}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
