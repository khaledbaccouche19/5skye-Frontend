"use client"

import { Suspense, lazy, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Globe, MapPin, Radio } from "lucide-react"
import { FallbackGlobe } from "./fallback-globe"
import { cesiumManager } from "@/lib/cesium-manager"

// Dynamically import the simplified CesiumGlobe component
const SimpleCesiumGlobe = lazy(() => import("./simple-cesium-globe").then(mod => ({ default: mod.SimpleCesiumGlobe })))

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

interface CesiumGlobeWrapperProps {
  towers: Tower[]
  onTowerClick?: (tower: Tower) => void
  className?: string
}

function LoadingFallback() {
  return (
    <div className="h-96 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl flex items-center justify-center relative overflow-hidden backdrop-blur-xl border border-white/5">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10" />
      
      <motion.div
        className="text-center z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        >
          <Globe className="h-20 w-20 text-blue-400 mx-auto mb-6 opacity-80" />
        </motion.div>
        <p className="text-white/80 text-lg font-medium mb-2">Loading 3D Globe...</p>
        <p className="text-white/50">Initializing CesiumJS</p>
      </motion.div>
    </div>
  )
}

export function CesiumGlobeWrapper({ towers, onTowerClick, className }: CesiumGlobeWrapperProps) {
  console.log('CesiumGlobeWrapper received props:', { towers: towers.length, onTowerClick: !!onTowerClick })
  const [hasError, setHasError] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)

  useEffect(() => {
    // Check if CesiumJS is available and try to use it
    const checkCesium = async () => {
      try {
        console.log("Attempting to import CesiumJS...")
        const cesium = await import("cesium")
        console.log("CesiumJS imported successfully:", cesium)
        
        // Check if there are any active Cesium viewers
        const activeViewers = cesiumManager.getActiveViewerCount?.() || 0
        if (activeViewers > 0) {
          console.warn("Other Cesium viewers are active, using fallback")
          setHasError(true)
          return
        }
        
        console.log("CesiumJS available, attempting to use 3D globe")
        setHasError(false)
      } catch (error) {
        console.error("CesiumJS import failed:", error)
        console.warn("CesiumJS not available, using fallback")
        setHasError(true)
      }
    }
    checkCesium()
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up any Cesium viewers when this component unmounts
      if (!hasError) {
        cesiumManager.destroyAllViewers()
      }
    }
  }, [hasError])

  return (
    <Suspense fallback={<LoadingFallback />}>
      {hasError ? (
        <FallbackGlobe towers={towers} onTowerClick={onTowerClick} className={className} />
      ) : (
        <SimpleCesiumGlobe 
          towers={towers}
          onTowerClick={onTowerClick}
          className={className}
        />
      )}
    </Suspense>
  )
} 