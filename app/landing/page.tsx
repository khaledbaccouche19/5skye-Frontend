"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Globe,
  Radio,
  Brain,
  Shield,
  Zap,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"

export default function LandingPage() {
  const { login, isLoading } = useAuth()
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const [loginForm, setLoginForm] = useState({
    email: "admin@intellitwin.com",
    password: "demo123",
  })

  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      setError("Please enter both email and password")
      return
    }

    try {
      const success = await login(loginForm.email, loginForm.password)
      if (!success) {
        setError("Login failed. Please try again.")
      }
    } catch (error) {
      setError("An error occurred during login")
      console.error("Login error:", error)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!signupForm.name.trim() || !signupForm.email.trim() || !signupForm.password.trim()) {
      setError("Please fill in all fields")
      return
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      const success = await login(signupForm.email, signupForm.password)
      if (!success) {
        setError("Signup failed. Please try again.")
      }
    } catch (error) {
      setError("An error occurred during signup")
      console.error("Signup error:", error)
    }
  }

  const features = [
    {
      icon: Globe,
      title: "Global Monitoring",
      description: "Monitor your infrastructure across multiple regions with real-time 3D visualization",
    },
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Predictive analytics and intelligent recommendations for optimal performance",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade security with JWT authentication and role-based access control",
    },
    {
      icon: Zap,
      title: "Real-time Telemetry",
      description: "Live data streaming with customizable alerts and threshold monitoring",
    },
  ]

  const stats = [
    { value: "99.9%", label: "Uptime Guarantee" },
    { value: "500+", label: "Towers Managed" },
    { value: "24/7", label: "Support Available" },
    { value: "50ms", label: "Response Time" },
  ]

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
            <Badge variant="outline" className="bg-slate-700/40 backdrop-blur-xl border-slate-500/40 text-blue-50">
              v2.1.0
            </Badge>
            <Button
              variant="outline"
              onClick={() => {
                setIsLoginMode(!isLoginMode)
                setError("")
              }}
              className="bg-slate-700/40 backdrop-blur-xl border-slate-500/40 text-blue-50 hover:bg-slate-600/50 hover:border-slate-400/50 rounded-2xl"
            >
              {isLoginMode ? "Sign Up" : "Login"}
            </Button>
          </div>
        </motion.header>

        <div className="container mx-auto px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Hero content */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="space-y-6">
                <motion.h2
                  className="text-6xl font-bold leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <span className="text-blue-50">
                    Digital Twin Platform
                  </span>
                  <br />
                  <span className="text-blue-100/80 text-4xl">for Smart Infrastructure</span>
                </motion.h2>

                <motion.p
                  className="text-xl text-slate-300 leading-relaxed max-w-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  Monitor, manage, and optimize your Intelli-FarEdge towers with real-time 3D visualization, AI-powered
                  insights, and comprehensive infrastructure management.
                </motion.p>
              </div>

              {/* Features grid */}
              <motion.div
                className="grid grid-cols-2 gap-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    className="p-4 bg-slate-700/40 backdrop-blur-xl border border-slate-500/40 rounded-2xl hover:bg-slate-600/50 hover:border-slate-400/50 transition-all duration-300"
                    whileHover={{ scale: 1.02, y: -2 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 1 + index * 0.1 }}
                  >
                    <feature.icon className="h-8 w-8 text-blue-400 mb-3" />
                    <h3 className="text-blue-50 font-semibold mb-2">{feature.title}</h3>
                    <p className="text-slate-300 text-sm">{feature.description}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Stats */}
              <motion.div
                className="flex items-center space-x-8 pt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                {stats.map((stat, index) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{stat.value}</div>
                    <div className="text-slate-300 text-sm">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right side - Login/Signup form */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Card className="w-full max-w-md bg-slate-700/40 backdrop-blur-xl border border-slate-500/40 rounded-3xl shadow-2xl">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <motion.h3
                      className="text-2xl font-bold text-blue-50 mb-2"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.6 }}
                    >
                      {isLoginMode ? "Welcome Back" : "Create Account"}
                    </motion.h3>
                    <motion.p
                      className="text-slate-300"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.7 }}
                    >
                      {isLoginMode
                        ? "Sign in to access your dashboard"
                        : "Join the future of infrastructure management"}
                    </motion.p>
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        className="mb-6 p-3 bg-red-500/20 backdrop-blur-xl border border-red-500/40 rounded-2xl flex items-center space-x-2"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <AlertCircle className="h-4 w-4 text-red-400" />
                        <span className="text-red-400 text-sm">{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence mode="wait">
                    {isLoginMode ? (
                      <motion.form
                        key="login"
                        onSubmit={handleLogin}
                        className="space-y-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="email" className="text-blue-50 mb-2 block">
                              Email Address
                            </Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                              <Input
                                id="email"
                                type="email"
                                value={loginForm.email}
                                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                                className="pl-10 bg-slate-600/50 backdrop-blur-xl border-slate-500/40 text-blue-50 placeholder:text-slate-400 rounded-2xl h-12 focus:bg-slate-500/50 focus:border-blue-500/50"
                                placeholder="admin@intellitwin.com"
                                required
                                disabled={isLoading}
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="password" className="text-blue-50 mb-2 block">
                              Password
                            </Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                              <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={loginForm.password}
                                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                className="pl-10 pr-10 bg-slate-600/50 backdrop-blur-xl border-slate-500/40 text-blue-50 placeholder:text-slate-400 rounded-2xl h-12 focus:bg-slate-500/50 focus:border-blue-500/50"
                                placeholder="Enter your password"
                                required
                                disabled={isLoading}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                                disabled={isLoading}
                              >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 rounded-2xl h-12 font-semibold shadow-lg hover:shadow-xl"
                        >
                          {isLoading ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Signing In...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span>Sign In</span>
                              <ArrowRight className="h-4 w-4" />
                            </div>
                          )}
                        </Button>

                        <div className="text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setIsLoginMode(false)
                              setError("")
                            }}
                            className="text-slate-300 hover:text-blue-50 text-sm transition-colors"
                            disabled={isLoading}
                          >
                            Don't have an account? <span className="text-blue-400">Sign up</span>
                          </button>
                        </div>
                      </motion.form>
                    ) : (
                      <motion.form
                        key="signup"
                        onSubmit={handleSignup}
                        className="space-y-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="name" className="text-blue-50 mb-2 block">
                              Full Name
                            </Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                              <Input
                                id="name"
                                type="text"
                                value={signupForm.name}
                                onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                                className="pl-10 bg-slate-600/50 backdrop-blur-xl border-slate-500/40 text-blue-50 placeholder:text-slate-400 rounded-2xl h-12 focus:bg-slate-500/50 focus:border-blue-500/50"
                                placeholder="Enter your full name"
                                required
                                disabled={isLoading}
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="signup-email" className="text-blue-50 mb-2 block">
                              Email Address
                            </Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                              <Input
                                id="signup-email"
                                type="email"
                                value={signupForm.email}
                                onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                                className="pl-10 bg-slate-600/50 backdrop-blur-xl border-slate-500/40 text-blue-50 placeholder:text-slate-400 rounded-2xl h-12 focus:bg-slate-500/50 focus:border-blue-500/50"
                                placeholder="Enter your email"
                                required
                                disabled={isLoading}
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="signup-password" className="text-blue-50 mb-2 block">
                              Password
                            </Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                              <Input
                                id="signup-password"
                                type={showPassword ? "text" : "password"}
                                value={signupForm.password}
                                onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                                className="pl-10 pr-10 bg-slate-600/50 backdrop-blur-xl border-slate-500/40 text-blue-50 placeholder:text-slate-400 rounded-2xl h-12 focus:bg-slate-500/50 focus:border-blue-500/50"
                                placeholder="Create a password"
                                required
                                disabled={isLoading}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                                disabled={isLoading}
                              >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="confirm-password" className="text-blue-50 mb-2 block">
                              Confirm Password
                            </Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                              <Input
                                id="confirm-password"
                                type="password"
                                value={signupForm.confirmPassword}
                                onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                                className="pl-10 bg-slate-600/50 backdrop-blur-xl border-slate-500/40 text-blue-50 placeholder:text-slate-400 rounded-2xl h-12 focus:bg-slate-500/50 focus:border-blue-500/50"
                                placeholder="Confirm your password"
                                required
                                disabled={isLoading}
                              />
                              {signupForm.confirmPassword && signupForm.password === signupForm.confirmPassword && (
                                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400 h-5 w-5" />
                              )}
                            </div>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          disabled={isLoading || signupForm.password !== signupForm.confirmPassword}
                          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 rounded-2xl h-12 font-semibold shadow-lg hover:shadow-xl"
                        >
                          {isLoading ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Creating Account...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span>Create Account</span>
                              <ArrowRight className="h-4 w-4" />
                            </div>
                          )}
                        </Button>

                        <div className="text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setIsLoginMode(true)
                              setError("")
                            }}
                            className="text-slate-300 hover:text-blue-50 text-sm transition-colors"
                            disabled={isLoading}
                          >
                            Already have an account? <span className="text-blue-400">Sign in</span>
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* Demo credentials */}
                  <motion.div
                    className="mt-8 p-4 bg-slate-600/50 backdrop-blur-xl border border-slate-500/40 rounded-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.8 }}
                  >
                    <h4 className="text-blue-400 font-semibold mb-2 text-sm">Demo Access</h4>
                    <p className="text-slate-300 text-xs mb-2">Use any email and password to access the demo</p>
                    <div className="text-xs text-slate-400">
                      <div>Email: admin@intellitwin.com</div>
                      <div>Password: demo123</div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLoginForm({
                          email: "admin@intellitwin.com",
                          password: "demo123",
                        })
                        setIsLoginMode(true)
                        setError("")
                      }}
                      className="mt-2 w-full bg-slate-600/50 border-slate-500/40 text-blue-50 hover:bg-slate-500/50 rounded-xl text-xs"
                      disabled={isLoading}
                    >
                      Use Demo Credentials
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.footer
          className="text-center py-8 border-t border-slate-500/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.6 }}
        >
          <p className="text-slate-400 text-sm">
            © 2024 Intelli-Twin Platform. Built for the future of smart infrastructure.
          </p>
        </motion.footer>
      </div>
    </div>
  )
}
