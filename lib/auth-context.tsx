"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "operator" | "viewer"
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const savedUser = localStorage.getItem("intelli-twin-user")
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser)
          setUser(parsedUser)
        }
      } catch (error) {
        console.error("Error parsing saved user:", error)
        localStorage.removeItem("intelli-twin-user")
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  // Handle routing based on auth state
  useEffect(() => {
    if (!isLoading) {
      const isAuthPage = pathname === "/landing" || pathname === "/auth/login"

      // Temporarily disable redirects to test login page
      console.log("Current pathname:", pathname, "isAuthPage:", isAuthPage, "user:", user)
      
      if (!user && !isAuthPage) {
        // Only redirect to landing if not on login page
        if (pathname !== "/auth/login") {
          console.log("Redirecting to landing from:", pathname)
          router.push("/landing")
        }
      } else if (user && isAuthPage) {
        console.log("Redirecting to dashboard from:", pathname)
        router.push("/")
      }
    }
  }, [user, isLoading, pathname, router])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Accept any non-empty email and password for demo
      if (email.trim() && password.trim()) {
        const mockUser: User = {
          id: Date.now().toString(),
          name: email.split("@")[0] || "User",
          email: email.trim(),
          role: "admin",
        }

        setUser(mockUser)
        localStorage.setItem("intelli-twin-user", JSON.stringify(mockUser))
        setIsLoading(false)

        // Navigate to dashboard
        router.push("/")
        return true
      }

      setIsLoading(false)
      return false
    } catch (error) {
      console.error("Login error:", error)
      setIsLoading(false)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("intelli-twin-user")
    router.push("/landing")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
