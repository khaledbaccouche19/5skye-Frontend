"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Wifi, WifiOff, Clock } from "lucide-react"

interface RealTimeIndicatorProps {
  isConnected?: boolean
  lastUpdate?: Date
  className?: string
}

export function RealTimeIndicator({ 
  isConnected = true, 
  lastUpdate = new Date(),
  className = "" 
}: RealTimeIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState("")

  useEffect(() => {
    const updateTimeAgo = () => {
      const now = new Date()
      const diff = now.getTime() - lastUpdate.getTime()
      const seconds = Math.floor(diff / 1000)
      const minutes = Math.floor(seconds / 60)
      
      if (seconds < 60) {
        setTimeAgo(`${seconds}s ago`)
      } else if (minutes < 60) {
        setTimeAgo(`${minutes}m ago`)
      } else {
        const hours = Math.floor(minutes / 60)
        setTimeAgo(`${hours}h ago`)
      }
    }

    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 1000)
    return () => clearInterval(interval)
  }, [lastUpdate])

  return (
    <motion.div
      className={`flex items-center space-x-2 px-3 py-1.5 rounded-full backdrop-blur-xl border ${
        isConnected 
          ? "bg-green-500/10 border-green-500/20 text-green-400" 
          : "bg-red-500/10 border-red-500/20 text-red-400"
      } ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="wait">
        {isConnected ? (
          <motion.div
            key="connected"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Wifi className="h-3 w-3" />
          </motion.div>
        ) : (
          <motion.div
            key="disconnected"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <WifiOff className="h-3 w-3" />
          </motion.div>
        )}
      </AnimatePresence>
      
      <span className="text-xs font-medium">
        {isConnected ? "Live" : "Offline"}
      </span>
      
      <div className="flex items-center space-x-1 text-xs opacity-70">
        <Clock className="h-3 w-3" />
        <span>{timeAgo}</span>
      </div>
    </motion.div>
  )
} 