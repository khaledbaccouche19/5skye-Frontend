"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Globe, 
  MapPin, 
  Radio, 
  Battery, 
  Thermometer,
  Wifi,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize,
  X
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { cesiumManager } from "@/lib/cesium-manager"

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

interface SimpleCesiumGlobeProps {
  towers: Tower[]
  onTowerClick?: (tower: Tower) => void
  className?: string
}

export function SimpleCesiumGlobe({ towers, onTowerClick, className }: SimpleCesiumGlobeProps) {
  console.log('SimpleCesiumGlobe received props:', { towers: towers.length, onTowerClick: !!onTowerClick })
  const cesiumContainer = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<any>(null)
  const [selectedTower, setSelectedTower] = useState<Tower | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1.0)
  const containerId = useRef(`cesium-globe-${Math.random().toString(36).substr(2, 9)}`)

  useEffect(() => {
    if (!cesiumContainer.current) return

    const initCesium = async () => {
      try {
        console.log("Initializing Cesium with manager...")
        setError(null)
        setIsLoading(true)
        
        // Ensure container has proper dimensions
        if (cesiumContainer.current) {
          cesiumContainer.current.style.width = '100%'
          cesiumContainer.current.style.height = '100%'
          cesiumContainer.current.style.minHeight = '400px'
        }
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Cesium initialization timeout')), 15000)
        })
        
        // Use the Cesium manager to create the viewer with timeout
        const viewerPromise = cesiumManager.createViewer(
          containerId.current,
          cesiumContainer.current!,
          {}
        )
        
        const viewer = await Promise.race([viewerPromise, timeoutPromise])

        if (!viewer) {
          console.warn("Failed to create Cesium viewer")
          setError("Failed to create 3D viewer")
          setIsLoading(false)
          return
        }

        viewerRef.current = viewer

        // Import Cesium for additional operations
        const Cesium = await import("cesium")

        console.log("Setting camera position...")
        viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(0, 20, 10000000),
          orientation: {
            heading: 0.0,
            pitch: -Cesium.Math.PI_OVER_TWO,
            roll: 0.0,
          },
        })

        // Enable lighting and atmosphere for better visual appeal
        viewer.scene.globe.enableLighting = true
        viewer.scene.globe.atmosphereLightingIntensity = 0.1
        viewer.scene.fog.enabled = true
        viewer.scene.fog.density = 0.0001

        console.log("Adding tower markers...")
        console.log("Total towers to add:", towers.length)
        
        // Add tower entities with proper IDs for click handling
        for (const tower of towers) {
          console.log(`Adding entity for tower:`, tower.name, tower.id)
          try {
            viewer.entities.add({
              id: `tower-${tower.id}`,
              name: tower.name,
              position: Cesium.Cartesian3.fromDegrees(tower.location.lng, tower.location.lat),
              point: { 
                pixelSize: 12, 
                color: tower.status === "online" ? Cesium.Color.LIME : 
                       tower.status === "warning" ? Cesium.Color.YELLOW : 
                       Cesium.Color.RED, 
                outlineColor: Cesium.Color.WHITE, 
                outlineWidth: 2 
              },
              properties: { towerId: tower.id }
            })
          } catch (error) {
            console.error(`Error adding tower entity for ${tower.name}:`, error)
          }
        }

        // Set up click handler for tower navigation
        const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)
        handler.setInputAction((click: any) => {
          const picked = viewer.scene.pick(click.position)
          if (!picked) return
          
          const entity = picked.id ?? picked.primitive?.id
          const prop = entity?.properties?.towerId
          const towerId = typeof prop?.getValue === "function"
            ? prop.getValue(Cesium.JulianDate.now())
            : prop
            
          if (towerId) {
            console.log(`🎯 Tower clicked: ${towerId}`)
            // Find the tower data and call the callback
            const tower = towers.find(t => t.id === towerId)
            if (tower && onTowerClick) {
              onTowerClick(tower)
            }
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

        // Set up hover effect for pointer cursor
        viewer.screenSpaceEventHandler.setInputAction((m: any) => {
          const picked = viewer.scene.pick(m.endPosition)
          viewer.container.style.cursor = picked ? "pointer" : "default"
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

        console.log("CesiumJS initialized successfully!")
        console.log("Tower entities added:", towers.length)
        
        // Add a global click handler for debugging
        viewer.screenSpaceEventHandler.setInputAction((event: any) => {
          console.log('=== GLOBAL CLICK DEBUG ===')
          console.log('Click position:', event.position)
          console.log('All entities count:', viewer.entities.values.length)
          
          // List all entities
          const entities = viewer.entities.values
          for (let i = 0; i < entities.length; i++) {
            const entity = entities[i]
            console.log(`Entity ${i}:`, entity.id, entity.name)
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
        
        setIsLoading(false)

        // Force resize after initialization
        setTimeout(() => {
          if (viewer && viewer.canvas) {
            viewer.canvas.style.width = '100%'
            viewer.canvas.style.height = '100%'
            viewer.resize()
          }
        }, 100)

      } catch (error) {
        console.error("CesiumJS initialization failed:", error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        setError(`Failed to initialize 3D globe: ${errorMessage}`)
        setIsLoading(false)
        
        // Show fallback 2D map
        showFallbackMap()
      }
    }

    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(initCesium, 100)
    
    return () => {
      clearTimeout(timer)
      // Clean up using the manager
      cesiumManager.destroyViewer(containerId.current)
      viewerRef.current = null
    }
  }, [towers, onTowerClick])

  // Function to show fallback 2D map
  const showFallbackMap = () => {
    if (!cesiumContainer.current) return
    
    console.log("Showing fallback 2D map")
    cesiumContainer.current.innerHTML = `
      <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl relative overflow-hidden backdrop-blur-xl border border-white/5">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10"></div>
        <div class="text-center z-10">
          <div class="text-blue-400 mb-6">
            <svg class="h-20 w-20 mx-auto opacity-80" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          <p class="text-white/80 text-lg font-medium mb-2">2D Map View</p>
          <p class="text-white/50">3D globe unavailable</p>
        </div>
        
        <!-- Tower markers as simple divs -->
        <div class="absolute inset-0 pointer-events-none">
          ${towers.map(tower => {
            const left = 50 + (tower.location.lng / 180) * 40
            const top = 50 - (tower.location.lat / 90) * 40
            const statusColor = tower.status === "online" ? "#10B981" : tower.status === "warning" ? "#F59E0B" : "#EF4444"
            return `
              <div 
                class="absolute w-4 h-4 rounded-full cursor-pointer pointer-events-auto transform -translate-x-1/2 -translate-y-1/2"
                style="left: ${left}%; top: ${top}%; background: ${statusColor}; box-shadow: 0 0 10px ${statusColor};"
                title="${tower.name} - ${tower.status}"
                onclick="window.towerClick && window.towerClick('${tower.id}')"
              ></div>
            `
          }).join('')}
        </div>
      </div>
    `
    
    // Add click handlers for towers
    ;(window as any).towerClick = (towerId: string) => {
      const tower = towers.find(t => t.id === towerId)
      if (tower) {
        setSelectedTower(tower)
        onTowerClick?.(tower)
      }
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cesiumManager.destroyViewer(containerId.current)
      viewerRef.current = null
    }
  }, [])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const viewer = cesiumManager.getViewer(containerId.current)
      if (viewer) {
        viewer.resize()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])



  const resetView = async () => {
    const viewer = cesiumManager.getViewer(containerId.current)
    if (viewer) {
      const Cesium = await import("cesium")
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(0, 20, 10000000),
        orientation: {
          heading: 0.0,
          pitch: -Cesium.Math.PI_OVER_TWO,
          roll: 0.0,
        },
      })
    }
  }

  const zoomIn = () => {
    const viewer = cesiumManager.getViewer(containerId.current)
    if (viewer) {
      viewer.camera.zoomIn(1000000)
    }
  }

  const zoomOut = () => {
    const viewer = cesiumManager.getViewer(containerId.current)
    if (viewer) {
      viewer.camera.zoomOut(1000000)
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div className={cn("relative w-full h-full", className)}>
      <style jsx>{`
        .cesium-container canvas {
          width: 100% !important;
          height: 100% !important;
          min-height: 400px !important;
        }
        .cesium-container {
          width: 100% !important;
          height: 100% !important;
          min-height: 400px !important;
        }
        .cesium-container .cesium-viewer {
          width: 100% !important;
          height: 100% !important;
        }
        .cesium-container .cesium-viewer-canvas {
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>
      {/* Enhanced Map Controls */}
      <div className="absolute top-4 right-4 z-10 flex space-x-3">
        <Button 
          size="lg" 
          variant="outline" 
          className="bg-slate-700/90 backdrop-blur-xl border-slate-500/50 text-white hover:bg-slate-600/90 h-12 w-12 p-0" 
          onClick={resetView}
          title="Reset View"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
        <Button 
          size="lg" 
          variant="outline" 
          className="bg-slate-700/90 backdrop-blur-xl border-slate-500/50 text-white hover:bg-slate-600/90 h-12 w-12 p-0" 
          onClick={zoomIn}
          title="Zoom In"
        >
          <ZoomIn className="h-5 w-5" />
        </Button>
        <Button 
          size="lg" 
          variant="outline" 
          className="bg-slate-700/90 backdrop-blur-xl border-slate-500/50 text-white hover:bg-slate-600/90 h-12 w-12 p-0" 
          onClick={zoomOut}
          title="Zoom Out"
        >
          <ZoomOut className="h-5 w-5" />
        </Button>
        <Button 
          size="lg" 
          variant="outline" 
          className="bg-slate-700/90 backdrop-blur-xl border-slate-500/50 text-white hover:bg-slate-600/90 h-12 w-12 p-0" 
          onClick={toggleFullscreen}
          title="Toggle Fullscreen"
        >
          <Maximize className="h-5 w-5" />
        </Button>
      </div>

      {/* Enhanced Legend */}
      <div className="absolute top-4 left-4 z-10 bg-slate-700/90 backdrop-blur-xl border border-slate-500/50 rounded-2xl p-4 shadow-glass-lg">
        <h4 className="text-base font-semibold text-slate-100 mb-3">Tower Status</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-glow-green" />
            <span className="text-slate-200">Online</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-amber-400 rounded-full shadow-glow-green" />
            <span className="text-slate-200">Warning</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-400 rounded-full shadow-glow-green" />
            <span className="text-slate-200">Critical</span>
          </div>
        </div>
      </div>

      {/* Debug Panel - Only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 z-10 bg-slate-800/90 backdrop-blur-xl border border-slate-500/50 rounded-2xl p-3 shadow-glass-lg text-xs">
          <div className="text-slate-300 mb-2">Debug Info</div>
          <div className="space-y-1 text-slate-400">
            <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
            <div>Error: {error ? 'Yes' : 'No'}</div>
            <div>Viewer: {viewerRef.current ? 'Active' : 'None'}</div>
            <div>Towers: {towers.length}</div>
            <div>Container: {cesiumContainer.current ? 'Ready' : 'None'}</div>
          </div>
        </div>
      )}

             {/* Cesium Container */}
       <div
         ref={cesiumContainer}
         className={cn(
           "w-full rounded-2xl overflow-hidden cesium-container",
           isFullscreen ? "fixed inset-0 z-50" : "h-full min-h-[400px]"
         )}
         style={{ 
           background: "linear-gradient(to bottom, #1e293b, #0f172a)",
           minHeight: "400px",
           height: "100%",
           width: "100%"
         }}
       />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-white">Loading 3D Globe...</p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-900/20 backdrop-blur-sm rounded-2xl">
          <div className="text-center bg-red-900/80 p-6 rounded-2xl border border-red-500/50">
            <div className="text-red-400 mb-4">
              <Globe className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-red-100 mb-2">3D Globe Error</h3>
            <p className="text-red-200 text-sm mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="border-red-400 text-red-100 hover:bg-red-800/50"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Tower Details Panel */}
      <AnimatePresence>
        {selectedTower && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-4 right-4 z-20 w-80"
          >
            <Card className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-white/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{selectedTower.name}</CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedTower(null)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      selectedTower.status === "online"
                        ? "default"
                        : selectedTower.status === "warning"
                          ? "secondary"
                          : "destructive"
                    }
                    className="text-xs"
                  >
                    {selectedTower.status.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-slate-500">{selectedTower.id}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-slate-500">Location</p>
                      <p className="text-sm font-medium">{selectedTower.location.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Radio className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-xs text-slate-500">Use Case</p>
                      <p className="text-sm font-medium">{selectedTower.useCase}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Battery className="h-4 w-4 text-emerald-500" />
                    <div>
                      <p className="text-xs text-slate-500">Battery</p>
                      <p className="text-sm font-medium">{selectedTower.battery}%</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-xs text-slate-500">Temperature</p>
                      <p className="text-sm font-medium">{selectedTower.temperature}°C</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Wifi className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="text-xs text-slate-500">Network Load</p>
                      <p className="text-sm font-medium">{selectedTower.networkLoad}%</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-cyan-500" />
                    <div>
                      <p className="text-xs text-slate-500">Uptime</p>
                      <p className="text-sm font-medium">{selectedTower.uptime}%</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-slate-500 mb-2">Components</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedTower.components.map((component, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {component}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* View Details Button */}
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    if (onTowerClick) {
                      onTowerClick(selectedTower)
                    }
                  }}
                >
                  View Full Details
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Close Button */}
      {isFullscreen && (
        <Button
          className="absolute top-4 right-20 z-30 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm"
          variant="outline"
          size="sm"
          onClick={toggleFullscreen}
        >
          Exit Fullscreen
        </Button>
      )}
    </div>
  )
} 