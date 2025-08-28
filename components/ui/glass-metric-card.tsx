"use client"

import { motion } from "framer-motion"
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useThemeSafe } from "@/hooks/use-theme-safe"

interface GlassMetricCardProps {
  title: string
  value: number | string
  unit?: string
  icon: LucideIcon
  status?: "success" | "warning" | "error" | "neutral"
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  delay?: number
  onClick?: () => void
  isActive?: boolean
  clickable?: boolean
}

export function GlassMetricCard({
  title,
  value,
  unit,
  icon: Icon,
  status = "neutral",
  trend = "neutral",
  trendValue,
  delay = 0,
}: GlassMetricCardProps) {
  const { theme } = useThemeSafe()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-400"
      case "warning":
        return "text-yellow-400"
      case "error":
        return "text-red-400"
      default:
        return "text-blue-400"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-400" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-400" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-400"
      case "down":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  return (
    <motion.div
      className="glass rounded-3xl p-6 backdrop-blur-2xl border border-theme hover:glass-hover transition-all duration-300 group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.5 }}
      whileHover={{ y: -5, scale: 1.02 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={cn(
            "p-3 rounded-2xl transition-all duration-300 group-hover:scale-110",
            theme === 'dark' ? "bg-blue-500/20" : "bg-blue-100/50"
          )}>
            <Icon className={cn("h-6 w-6", getStatusColor(status))} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-theme-secondary">{title}</h3>
          </div>
        </div>
        
        {trend !== "neutral" && (
          <div className="flex items-center space-x-1">
            {getTrendIcon(trend)}
            {trendValue && (
              <span className={cn("text-xs font-medium", getTrendColor(trend))}>
                {trendValue}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mb-2">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-theme-primary">
            {value}
          </span>
          {unit && (
            <span className="text-lg font-medium text-theme-secondary">
              {unit}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            status === "success" ? "bg-green-400" :
            status === "warning" ? "bg-yellow-400" :
            status === "error" ? "bg-red-400" : "bg-blue-400"
          )} />
          <span className={cn(
            "text-xs font-medium capitalize",
            status === "success" ? "text-green-400" :
            status === "warning" ? "text-yellow-400" :
            status === "error" ? "text-red-400" : "text-blue-400"
          )}>
            {status}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
