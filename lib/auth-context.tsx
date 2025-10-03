"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { ApiClient } from "./api-client"

interface User {
  id: string
  username: string
  name: string
  email: string
  firstName?: string
  lastName?: string
  role: "admin" | "operator" | "viewer" | "USER" | "ADMIN"
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  signup: (userData: {
    username: string
    email: string
    password: string
    firstName?: string
    lastName?: string
    role?: string
  }) => Promise<boolean>
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
      // Always set loading to false after checking
      setIsLoading(false)
    }

    // Add a small delay to ensure proper initialization
    const timer = setTimeout(checkAuth, 100)
    
    // Fallback timeout to ensure loading never gets stuck
    const fallbackTimer = setTimeout(() => {
      console.log("Auth loading fallback triggered")
      setIsLoading(false)
    }, 2000)
    
    return () => {
      clearTimeout(timer)
      clearTimeout(fallbackTimer)
    }
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

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      const response = await ApiClient.login(username, password)
      
      if (response.token) {
        const user: User = {
          id: Date.now().toString(),
          username: response.username,
          name: response.firstName ? `${response.firstName} ${response.lastName || ''}`.trim() : response.username,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
          role: response.role.toLowerCase() as "admin" | "operator" | "viewer" | "USER" | "ADMIN",
        }

        setUser(user)
        localStorage.setItem("intelli-twin-user", JSON.stringify(user))
        localStorage.setItem("intelli-twin-token", response.token)
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

  const signup = async (userData: {
    username: string
    email: string
    password: string
    firstName?: string
    lastName?: string
    role?: string
  }): Promise<boolean> => {
    try {
      setIsLoading(true)

      await ApiClient.signup(userData)
      setIsLoading(false)
      return true
    } catch (error) {
      console.error("Signup error:", error)
      setIsLoading(false)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("intelli-twin-user")
    localStorage.removeItem("intelli-twin-token")
    router.push("/landing")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
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
