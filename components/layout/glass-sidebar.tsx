"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Globe, Radio, BarChart3, AlertTriangle, Brain, Wrench, FileText, Menu, X, TrendingUp, Wifi, Activity, Cloud } from "lucide-react"
import { cn } from "@/lib/utils"
import { useThemeSafe } from "@/hooks/use-theme-safe"

const navigation = [
  { name: "Dashboard", href: "/", icon: Globe },
  { name: "Towers", href: "/towers", icon: Radio },
  { name: "Performance", href: "/performance", icon: TrendingUp },
  { name: "Telemetry", href: "/telemetry", icon: BarChart3 },

  { name: "AI Analytics", href: "/ai-analytics", icon: Brain },
  { name: "Maintenance", href: "/maintenance", icon: Wrench },
  { name: "Alerts", href: "/alerts", icon: AlertTriangle },

]

export function GlassSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { theme } = useThemeSafe()

  return (
    <>
      {/* Mobile menu button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-6 left-6 z-50 p-2 rounded-xl glass glass-hover text-theme-primary"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Menu className="h-6 w-6" />
      </motion.button>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full glass backdrop-blur-2xl border-r border-theme">
          {/* Logo */}
          <div className="flex items-center justify-center h-20 border-b border-theme">
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-glow">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div className="hidden lg:block">
                <h1 className="text-xl font-bold text-theme-primary">Intelli-Twin</h1>
                <p className="text-xs text-theme-secondary">Platform</p>
              </div>
            </motion.div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item, index) => {
              const isActive = pathname === item.href
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                      isActive
                        ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 text-blue-400 shadow-glow"
                        : "text-theme-secondary hover:text-theme-primary hover:bg-white/5"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 transition-all duration-200",
                        isActive ? "text-blue-400" : "text-theme-muted group-hover:text-theme-primary"
                      )}
                    />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </motion.div>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="mt-auto p-4 border-t border-white/10">
            <div className="text-center text-white/60 text-xs">
              {/* Trademark text removed */}
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Overlay */}
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Close button for mobile */}
      {isOpen && (
        <motion.button
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed top-6 right-6 z-50 p-2 rounded-xl glass glass-hover text-theme-primary"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <X className="h-6 w-6" />
        </motion.button>
      )}
    </>
  )
}
