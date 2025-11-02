"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Globe, Radio, Brain, Wrench, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/translation-context"

const getNavigation = (t: any) => [
  { name: t.dashboard, href: "/", icon: Globe },
  { name: t.towers, href: "/towers", icon: Radio },
  { name: t.maintenance, href: "/maintenance", icon: Wrench },
  { name: t.analytics, href: "/ai-analytics", icon: Brain },
]

export function GlassSidebar() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const pathname = usePathname()
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout>()
  
  const navigation = getNavigation(t)

  const isExpanded = isHovered || isOpen

  // Set CSS custom property for layout
  React.useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', isExpanded ? '256px' : '64px')
  }, [isExpanded])

  // Set initial CSS custom property on mount
  React.useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', '64px')
  }, [])

  // Handle hover with delay to prevent flickering
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true)
    }, 150) // 150ms delay
  }

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false)
    }, 300) // 300ms delay to prevent flickering when moving mouse
  }

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  return (
    <>
      {/* Mobile menu button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-6 left-6 z-50 p-2 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Menu className="h-6 w-6" />
      </motion.button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-16 lg:w-16 transition-all duration-300 ease-in-out",
          isExpanded && "lg:w-64",
          isOpen ? "translate-x-0" : "lg:translate-x-0 -translate-x-full"
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="h-full bg-white/5 backdrop-blur-2xl border-r border-white/10 flex flex-col">
          {/* Logo */}
          <div className="h-16 border-b border-white/10 flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Globe className="h-5 w-5 text-white" />
              </div>
              {isExpanded && (
                <div className="animate-in slide-in-from-left-2 duration-300">
                  <h1 className="text-lg font-bold text-white">Intelli-Twin</h1>
                  <p className="text-xs text-white/60">Platform</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4">
            <div className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center mx-2 rounded-lg transition-all duration-200 group",
                      isActive 
                        ? "bg-blue-500/20 text-blue-400" 
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-12 h-12 rounded-lg",
                      isExpanded ? "mr-3" : "mx-auto"
                    )}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    {isExpanded && (
                      <span className="animate-in slide-in-from-left-2 duration-300 font-medium">
                        {item.name}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center justify-center">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center relative">
                <span className="text-white font-bold text-sm">1</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full"></div>
              </div>
              {isExpanded && (
                <span className="ml-3 animate-in slide-in-from-left-2 duration-300 text-xs text-white/60">
                  Issue
                </span>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Close button for mobile */}
      {isOpen && (
        <motion.button
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed top-6 right-6 z-50 p-2 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <X className="h-6 w-6" />
        </motion.button>
      )}
    </>
  )
}