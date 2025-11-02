"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Bell, User, Globe, ChevronDown, LogOut, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { useTranslation } from "@/lib/translation-context"

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
]

interface Alert {
  id: number
  message: string
  severity: string
  timestamp: string
  towerId: number
  resolved: boolean
}

export function GlassTopbar() {
  const { language, setLanguage, t } = useTranslation()
  const { user, logout } = useAuth()
  const [searchFocused, setSearchFocused] = useState(false)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch alerts from backend
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch('http://localhost:8088/api/alerts')
        if (response.ok) {
          const data = await response.json()
          // Sort by timestamp descending and take the first 10
          const recentAlerts = data
            .sort((a: Alert, b: Alert) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10)
          setAlerts(recentAlerts)
          setUnreadCount(recentAlerts.filter((alert: Alert) => !alert.resolved).length)
        }
      } catch (error) {
        console.error('Error fetching alerts:', error)
      }
    }

    fetchAlerts()
    // Refresh alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000)
    return () => clearInterval(interval)
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-red-500'
      case 'high': return 'text-orange-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-blue-500'
      default: return 'text-gray-500'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <CheckCircle className="w-4 h-4" />
    }
  }


  return (
    <motion.header
      className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-6"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Search */}
      <div className="flex items-center flex-1 max-w-md relative">
        <motion.div
          className="relative w-full"
          whileFocus={{ scale: 1.02 }}
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder={t.searchPlaceholder}
            className="pl-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </motion.div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center space-x-4">
        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {languages.find(lang => lang.code === language)?.name || languages[0].name}
                </span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className="flex items-center space-x-2"
              >
                <span>{lang.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <motion.span
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </Button>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-3 py-2 border-b">
              <h3 className="font-semibold text-sm">{t.notifications}</h3>
              <p className="text-xs text-gray-500">{unreadCount} unread {t.alerts.toLowerCase()}</p>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="px-3 py-4 text-center text-sm text-gray-500">
                  No {t.alerts.toLowerCase()} available
                </div>
              ) : (
                alerts.map((alert) => (
                  <DropdownMenuItem key={alert.id} className="flex flex-col items-start p-3 space-y-1">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-2">
                        <div className={getSeverityColor(alert.severity)}>
                          {getSeverityIcon(alert.severity)}
                        </div>
                        <span className="text-xs font-medium text-gray-700">
                          Tower {alert.towerId || 'Unknown'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : 'No timestamp'}
                      </span>
                    </div>
                    <p className="text-sm font-medium">
                      {alert.message.length > 80 
                        ? alert.message.substring(0, 77) + "..." 
                        : alert.message}
                    </p>
                  </DropdownMenuItem>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="hidden sm:inline">{user?.name || "Admin"}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700">
              <p className="font-medium">{user?.name || "Admin User"}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{user?.email || "admin@intellitwin.com"}</p>
            </div>
            <DropdownMenuItem>Profile Settings</DropdownMenuItem>
            <DropdownMenuItem>Account Preferences</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-500">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  )
}
