"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Activity, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!email || !password) {
      setError("Please enter your email and password.")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const payload = await response.json()

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || "Unable to sign in. Please try again.")
      }

      const accessToken = payload?.user?.session?.access_token
      if (accessToken) {
        localStorage.setItem("gv-token", accessToken)
      }

      const rawRole = payload?.user?.role
      const userRole = typeof rawRole === "string" ? rawRole.toLowerCase() : null

      if (userRole === "student" || userRole === "instructor") {
        localStorage.setItem("gv-role", userRole)
        localStorage.setItem("gv-email", email)
        localStorage.setItem("gv-user-id", payload.user.id)
      }

      // Redirect to dashboard - it will show role-specific content
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during sign in.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/30">
            <Activity className="h-8 w-8 text-white animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">GitVitals</h1>
          <p className="text-sm text-muted-foreground font-medium">Clinical Management System</p>
        </div>

        <Card className="border-border shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <CardHeader className="pb-4 space-y-1">
            <CardTitle className="text-center text-3xl text-foreground font-bold">Welcome back</CardTitle>
            <CardDescription className="text-center text-base">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full py-6 text-base font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg shadow-teal-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-800 px-2 text-muted-foreground">
                  New here?
                </span>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              {"Don't have an account? "}
              <Link href="/register" className="font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors">
                Create one now →
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
