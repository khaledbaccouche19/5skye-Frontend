"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Radio, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const [loginForm, setLoginForm] = useState({
    email: "admin@intellitwin.com",
    password: "demo123",
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
              onClick={() => router.push("/landing")}
              className="bg-slate-700/40 backdrop-blur-xl border-slate-500/40 text-blue-50 hover:bg-slate-600/50 hover:border-slate-400/50 rounded-2xl"
            >
              Sign Up
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
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <span className="text-blue-50">Digital Twin Platform</span>
                  <br />
                  <span className="text-blue-100/80">for Smart Infrastructure</span>
                </motion.h2>

                <motion.p
                  className="text-xl text-slate-300 leading-relaxed max-w-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  Monitor, manage, and optimize your Intelli-FarEdge towers with real-time 3D visualization, AI-powered insights, and comprehensive infrastructure management.
                </motion.p>
              </div>

              {/* Feature Cards */}
              <motion.div
                className="grid grid-cols-2 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                {[
                  {
                    title: "Global Monitoring",
                    description: "Monitor your infrastructure across multiple regions with real-time 3D visualization",
                    color: "from-blue-500/30 to-cyan-500/30 border-blue-500/40"
                  },
                  {
                    title: "AI-Powered Insights",
                    description: "Predictive analytics and intelligent recommendations for optimal performance",
                    color: "from-amber-500/30 to-yellow-500/30 border-amber-500/40"
                  },
                  {
                    title: "Enterprise Security",
                    description: "Bank-grade security with JWT authentication and role-based access control",
                    color: "from-emerald-500/30 to-green-500/30 border-emerald-500/40"
                  },
                  {
                    title: "Real-time Telemetry",
                    description: "Live data streaming with customizable alerts and threshold monitoring",
                    color: "from-red-500/30 to-rose-500/30 border-red-500/40"
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    className={`p-4 bg-gradient-to-br ${feature.color} backdrop-blur-2xl border rounded-2xl shadow-lg`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 rounded-xl bg-blue-600/50 backdrop-blur-sm">
                        <Radio className="h-5 w-5 text-blue-400" />
                      </div>
                      <h3 className="font-semibold text-blue-50 text-sm">{feature.title}</h3>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">{feature.description}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Stats */}
              <motion.div
                className="flex items-center space-x-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                {[
                  { value: "99.9%", label: "Uptime Guarantee", color: "text-emerald-400" },
                  { value: "500+", label: "Towers Managed", color: "text-blue-400" },
                  { value: "24/7", label: "Support Available", color: "text-purple-400" },
                  { value: "50ms", label: "Response Time", color: "text-amber-400" },
                ].map((stat, index) => (
                  <div key={stat.label} className="text-center">
                    <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                    <div className="text-slate-300 text-sm">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right side - Login Form */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Card className="w-full max-w-md bg-slate-700/40 backdrop-blur-xl border border-slate-500/40 rounded-3xl shadow-2xl">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-blue-50">Welcome Back</CardTitle>
                  <p className="text-slate-300">Sign in to access your dashboard</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleLogin} className="space-y-4">
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
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
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
                          placeholder="Enter your password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
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

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-red-500/20 backdrop-blur-xl border border-red-500/40 rounded-2xl text-red-200 text-sm text-center"
                      >
                        {error}
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
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>Sign In</span>
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      )}
                    </Button>
                  </form>

                  <div className="text-center">
                    <p className="text-slate-300 text-sm">
                      Don't have an account?{" "}
                      <button
                        onClick={() => router.push("/landing")}
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                      >
                        Sign up
                      </button>
                    </p>
                  </div>

                  {/* Demo Access */}
                  <Card className="bg-slate-600/50 backdrop-blur-xl border border-slate-500/40 rounded-2xl">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-blue-50 mb-2">Demo Access</h4>
                      <p className="text-slate-300 text-sm mb-3">Use any email and password to access the demo.</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Email:</span>
                          <span className="text-blue-50">admin@intellitwin.com</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Password:</span>
                          <span className="text-blue-50">demo123</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setLoginForm({ email: "admin@intellitwin.com", password: "demo123" })}
                        className="w-full mt-3 bg-slate-600/50 backdrop-blur-xl border-slate-500/40 text-blue-50 hover:bg-slate-500/50 rounded-2xl"
                        size="sm"
                      >
                        Use Demo Credentials
                      </Button>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
