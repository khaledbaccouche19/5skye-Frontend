"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Radio, Mail, Lock, Eye, EyeOff, ArrowRight, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"

export default function SignupPage() {
  const router = useRouter()
  const { signup, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [signupForm, setSignupForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  })

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (signupForm.password !== signupForm.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (signupForm.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    try {
      const success = await signup({
        username: signupForm.username,
        email: signupForm.email,
        password: signupForm.password,
        firstName: signupForm.firstName,
        lastName: signupForm.lastName,
        role: "USER"
      })
      
      if (success) {
        setSuccess("Account created successfully! Please login.")
        setTimeout(() => {
          router.push("/auth/login")
        }, 2000)
      } else {
        setError("Signup failed. Please try again.")
      }
    } catch (error) {
      setError("An error occurred during signup")
      console.error("Signup error:", error)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: `
        linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%),
        radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.08) 0%, transparent 50%)
      `
    }}>
      {/* Sophisticated layered background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 via-slate-700/15 to-slate-600/10" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-purple-500/15 to-transparent rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse" style={{animationDelay: '2s'}} />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-r from-emerald-500/10 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{animationDelay: '4s'}} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.header
          className="flex items-center justify-between p-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-2xl bg-blue-600/50 backdrop-blur-sm border border-blue-500/40">
              <Radio className="h-8 w-8 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
              Intelli-Twin
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-slate-700/40 backdrop-blur-xl border border-slate-500/40 text-blue-50 px-3 py-1 rounded-full text-sm">
              v2.1.0
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/auth/login")}
              className="bg-slate-700/40 backdrop-blur-xl border-slate-500/40 text-blue-50 hover:bg-slate-600/50 hover:border-slate-400/50 rounded-2xl"
            >
              Sign In
            </Button>
          </div>
        </motion.header>

        <div className="container mx-auto px-8 py-12">
          <div className="flex justify-center">
            <motion.div
              className="w-full max-w-md"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="w-full bg-slate-700/40 backdrop-blur-xl border border-slate-500/40 rounded-3xl shadow-2xl">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-blue-50">Create Account</CardTitle>
                  <p className="text-slate-300">Sign up to access your dashboard</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-blue-50 text-sm font-medium">
                          First Name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            id="firstName"
                            type="text"
                            placeholder="First name"
                            value={signupForm.firstName}
                            onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                            className="pl-10 bg-slate-600/50 backdrop-blur-xl border-slate-500/40 text-blue-50 placeholder:text-slate-400 rounded-2xl focus:border-blue-500/50 focus:ring-blue-500/20"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-blue-50 text-sm font-medium">
                          Last Name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            id="lastName"
                            type="text"
                            placeholder="Last name"
                            value={signupForm.lastName}
                            onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                            className="pl-10 bg-slate-600/50 backdrop-blur-xl border-slate-500/40 text-blue-50 placeholder:text-slate-400 rounded-2xl focus:border-blue-500/50 focus:ring-blue-500/20"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-blue-50 text-sm font-medium">
                        Username
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="username"
                          type="text"
                          placeholder="Choose a username"
                          value={signupForm.username}
                          onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })}
                          className="pl-10 bg-slate-600/50 backdrop-blur-xl border-slate-500/40 text-blue-50 placeholder:text-slate-400 rounded-2xl focus:border-blue-500/50 focus:ring-blue-500/20"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-blue-50 text-sm font-medium">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={signupForm.email}
                          onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                          className="pl-10 bg-slate-600/50 backdrop-blur-xl border-slate-500/40 text-blue-50 placeholder:text-slate-400 rounded-2xl focus:border-blue-500/50 focus:ring-blue-500/20"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-blue-50 text-sm font-medium">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          value={signupForm.password}
                          onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                          className="pl-10 pr-10 bg-slate-600/50 backdrop-blur-xl border-slate-500/40 text-blue-50 placeholder:text-slate-400 rounded-2xl focus:border-blue-500/50 focus:ring-blue-500/20"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-blue-50 text-sm font-medium">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={signupForm.confirmPassword}
                          onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                          className="pl-10 bg-slate-600/50 backdrop-blur-xl border-slate-500/40 text-blue-50 placeholder:text-slate-400 rounded-2xl focus:border-blue-500/50 focus:ring-blue-500/20"
                          required
                        />
                      </div>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-red-500/20 backdrop-blur-xl border border-red-500/40 rounded-2xl text-red-200 text-sm text-center"
                      >
                        {error}
                      </motion.div>
                    )}

                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-green-500/20 backdrop-blur-xl border border-green-500/40 rounded-2xl text-green-200 text-sm text-center"
                      >
                        {success}
                      </motion.div>
                    )}

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-2xl h-12 font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          <span>Creating Account...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>Create Account</span>
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      )}
                    </Button>
                  </form>

                  <div className="text-center">
                    <p className="text-slate-300 text-sm">
                      Already have an account?{" "}
                      <button
                        onClick={() => router.push("/auth/login")}
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                      >
                        Sign in
                      </button>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
