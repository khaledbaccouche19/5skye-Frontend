"use client"

import { motion } from "framer-motion"
import { Globe, MapPin, Radio, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Tower {
  id: string
  name: string
  location: { lat: number; lng: number; city: string }
  status: "online" | "warning" | "critical"
  battery: number
  temperature: number
  uptime: number
  networkLoad: number
  useCase: string
  region: string
  components: string[]
}

interface FallbackGlobeProps {
  towers: Tower[]
  onTowerClick?: (tower: Tower) => void
  className?: string
}

export function FallbackGlobe({ towers, onTowerClick, className }: FallbackGlobeProps) {
  return (
    <div className={cn("relative", className)}>
                   <div className="h-full min-h-[500px] bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl flex items-center justify-center relative overflow-hidden backdrop-blur-xl border border-white/5">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10" />

        <motion.div
          className="text-center z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <Globe className="h-20 w-20 text-blue-400 mx-auto mb-6 opacity-80" />
          </motion.div>
          <p className="text-white/80 text-lg font-medium mb-2">Interactive 3D Globe</p>
          <p className="text-white/50">Click towers to view details</p>
        </motion.div>

        {/* Tower Markers with enhanced animations */}
        {towers.slice(0, 15).map((tower, index) => (
          <motion.button
            key={tower.id}
            className={cn(
              "absolute w-6 h-6 rounded-full border-2 border-white shadow-glow cursor-pointer backdrop-blur-sm group",
              tower.status === "online"
                ? "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.6)]"
                : tower.status === "warning"
                  ? "bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.6)]"
                  : "bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]",
            )}
            style={{
              left: `${8 + (index % 7) * 12}%`,
              top: `${12 + Math.floor(index / 7) * 18}%`,
            }}
            onClick={() => onTowerClick?.(tower)}
            whileHover={{ scale: 1.4, zIndex: 10 }}
            whileTap={{ scale: 0.9 }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: index * 0.2,
            }}
          >
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {tower.name}
                <div className="text-xs text-gray-300">{tower.location.city}</div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg p-3">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Tower Status</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full shadow-glow-green" />
            <span className="text-slate-600 dark:text-slate-400">Online</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full shadow-glow-yellow" />
            <span className="text-slate-600 dark:text-slate-400">Warning</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full shadow-glow-red" />
            <span className="text-slate-600 dark:text-slate-400">Critical</span>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="absolute bottom-4 right-4 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-2">
          <Globe className="h-4 w-4 text-blue-500" />
          <span className="text-xs font-medium text-slate-900 dark:text-white">Interactive Globe</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {towers.length} towers worldwide
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-500">
          Click markers for details
        </p>
      </div>
    </div>
  )
} 