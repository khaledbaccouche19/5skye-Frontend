"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Globe, Radio, AlertTriangle } from "lucide-react"
import { GlassMainLayout } from "@/components/layout/glass-main-layout"
import { GlassMetricCard } from "@/components/ui/glass-metric-card"
import { CesiumGlobeWrapper } from "@/components/ui/cesium-globe-wrapper"
import { RealTimeIndicator } from "@/components/ui/real-time-indicator"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { useTowers } from "@/lib/towers-context"
import { ApiClient } from "@/lib/api-client"
import { cn } from "@/lib/utils"

function DashboardContent() {
  const router = useRouter()
  const { getTowerById } = useTowers()
  const [towers, setTowers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Enhanced filter state
  const [cardFilter, setCardFilter] = useState<string | null>(null)
  const [filteredTowers, setFilteredTowers] = useState<any[]>([])

  // Apply filters when towers or cardFilter changes
  useEffect(() => {
    let filtered = towers

    // Apply card filter
    if (cardFilter) {
      switch (cardFilter) {
        case "online":
          filtered = filtered.filter(tower => tower.status === "online")
          break
        case "warning":
          filtered = filtered.filter(tower => tower.status === "warning")
          break
        case "critical":
          filtered = filtered.filter(tower => tower.status === "critical")
          break
        case "total":
          // Show all towers (no additional filtering)
          break
      }
    }

    setFilteredTowers(filtered)
  }, [towers, cardFilter])

  // Calculate metrics based on filtered towers
  const totalTowers = towers.length
  const onlineTowers = towers.filter(tower => tower.status === "online").length
  const warningTowers = towers.filter(tower => tower.status === "warning").length
  const criticalTowers = towers.filter(tower => tower.status === "critical").length

  // Handle card click to set filter
  const handleCardClick = (filterType: string) => {
    if (cardFilter === filterType) {
      // If clicking the same card, remove the filter
      setCardFilter(null)
    } else {
      // Set new card filter
      setCardFilter(filterType)
    }
  }

  // Clear all filters
  const clearAllFilters = () => {
    setCardFilter(null)
  }

  // Fetch data from real API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Fetch full tower data for dashboard (needed for globe coordinates)
        const towerData = await ApiClient.getTowers()
        console.log('Raw tower data from API:', towerData)
        
        // Transform backend data to match globe expectations (simplified since backend validates)
        const transformedTowers = towerData.map(tower => {
          console.log(`Transforming tower ${tower.name}:`, {
            id: tower.id,
            latitude: tower.latitude,
            longitude: tower.longitude,
            city: tower.city
          })
          
          return {
            ...tower,
            location: {
              lat: tower.latitude,
              lng: tower.longitude,
              city: tower.city || 'Unknown Location'
            }
          }
        })
        
        console.log('Towers ready for globe:', transformedTowers)
        console.log('Sample tower location:', transformedTowers[0]?.location)
        setTowers(transformedTowers)
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        setError('Failed to load dashboard data')
        // Fallback to empty array if API fails (backend validation ensures data integrity)
        setTowers([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (isLoading) {
    return (
      <GlassMainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">Loading dashboard...</p>
          </div>
        </div>
      </GlassMainLayout>
    )
  }

  if (error) {
    return (
      <GlassMainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Error Loading Dashboard</h2>
            <p className="text-white/60 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </GlassMainLayout>
    )
  }

  // Debug: Log towers before rendering
  console.log('Dashboard rendering with towers:', towers)
  
  return (
    <GlassMainLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent mb-2">
              Dashboard
            </h1>
            <p className="text-blue-50 text-lg">
              Monitor your infrastructure in real-time
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <RealTimeIndicator className="hidden md:flex" />
          </div>
        </motion.div>

        {/* Metrics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div 
            onClick={() => handleCardClick("total")}
            className="cursor-pointer transform transition-all duration-300 hover:scale-105"
          >
            <GlassMetricCard
              title="Total Towers"
              value={totalTowers}
              icon={Globe}
              status={cardFilter === "total" ? "success" : "neutral"}
              trend="up"
              trendValue="+2 this month"
              delay={0}
            />
          </div>
          
          <div 
            onClick={() => handleCardClick("online")}
            className="cursor-pointer transform transition-all duration-300 hover:scale-105"
          >
            <GlassMetricCard
              title="Online Towers"
              value={onlineTowers}
              unit=""
              icon={Radio}
              status={cardFilter === "online" ? "success" : "neutral"}
              trend="up"
              trendValue={`${Math.round((onlineTowers / totalTowers) * 100)}% uptime`}
              delay={1}
            />
          </div>
          
          <div 
            onClick={() => handleCardClick("warning")}
            className="cursor-pointer transform transition-all duration-300 hover:scale-105"
          >
            <GlassMetricCard 
              title="Warning Towers" 
              value={warningTowers} 
              icon={AlertTriangle} 
              status={cardFilter === "warning" ? "warning" : "neutral"} 
              delay={2}
            />
          </div>
          
          <div 
            onClick={() => handleCardClick("critical")}
            className="cursor-pointer transform transition-all duration-300 hover:scale-105"
          >
            <GlassMetricCard
              title="Critical Towers"
              value={criticalTowers}
              icon={AlertTriangle}
              status={cardFilter === "critical" ? "error" : "neutral"}
              delay={3}
            />
          </div>
        </motion.div>

        {/* Active Filters Display */}
        {cardFilter && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-white/60 text-sm">Active Filter:</span>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-200 border-blue-400/30">
                  {cardFilter.charAt(0).toUpperCase() + cardFilter.slice(1)}: {filteredTowers.length} towers
                </Badge>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearAllFilters}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                Clear Filter
              </Button>
            </div>
          </motion.div>
        )}

        {/* Global Tower Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="w-full mb-8"
        >
          <div className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 rounded-3xl p-4 shadow-glass-lg hover:shadow-[rgba(148,163,184,0.3)_0px_15px_30px] transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4 relative z-10">
              <motion.div
                className="p-3 rounded-2xl bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border border-blue-400/30 shadow-lg"
                whileHover={{ rotate: 5, scale: 1.05 }}
              >
                <Globe className="h-8 w-8 text-blue-200" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-blue-50">Global Tower Map</h2>
                <p className="text-sm text-blue-200/70">
                  {cardFilter ? `Showing ${filteredTowers.length} ${cardFilter} towers` : "Click on any tower to view details"}
                </p>
              </div>
            </div>
            <div className="h-[560px]">
              <CesiumGlobeWrapper 
                towers={filteredTowers} 
                onTowerClick={(tower) => {
                  console.log('Tower clicked on globe:', tower)
                  router.push(`/towers/${tower.id}`)
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex items-center justify-between"
        >
          <p className="text-white/60">
            Showing {filteredTowers.length} of {totalTowers} towers
            {cardFilter && ` (${cardFilter} status)`}
          </p>
          {filteredTowers.length === 0 && (
            <p className="text-yellow-400 text-sm">
              No towers match your current filter
            </p>
          )}
        </motion.div>


      </div>
    </GlassMainLayout>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
