"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Globe, Radio, AlertTriangle, Brain } from "lucide-react"
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
  const [recentAlerts, setRecentAlerts] = useState<any[]>([])
  const [aiInsights, setAiInsights] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [filteredTowers, setFilteredTowers] = useState<any[]>([])

  // Apply filters when towers or statusFilter changes
  useEffect(() => {
    if (statusFilter) {
      const filtered = towers.filter(tower => tower.status === statusFilter)
      setFilteredTowers(filtered)
    } else {
      setFilteredTowers(towers)
    }
  }, [towers, statusFilter])

  // Calculate metrics based on filtered towers
  const totalTowers = filteredTowers.length
  const onlineTowers = filteredTowers.filter(tower => tower.status === "online").length
  const warningTowers = filteredTowers.filter(tower => tower.status === "warning").length
  const criticalTowers = filteredTowers.filter(tower => tower.status === "critical").length
  const criticalAlerts = recentAlerts.filter(alert => alert.severity === "critical").length

  // Handle status card clicks
  const handleStatusCardClick = (status: string | null) => {
    if (statusFilter === status) {
      // If clicking the same status, clear the filter
      setStatusFilter(null)
    } else {
      // Set new filter
      setStatusFilter(status)
    }
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
        
        // Fetch recent alerts
        const alertsData = await ApiClient.getRecentAlerts()
        setRecentAlerts(alertsData)
        
        // For now, keep AI insights as dummy data since there's no API endpoint
        setAiInsights([
          {
            id: "AI-001",
            towerId: "TWR-003",
            towerName: "Tower Gamma",
            prediction: "Battery will fail in 4 days",
            recommendation: "Schedule immediate battery replacement",
            confidence: 94,
            riskType: "Hardware Failure",
            urgency: "critical",
          },
          {
            id: "AI-002",
            towerId: "TWR-002",
            towerName: "Tower Beta",
            prediction: "CPU overload risk: 87%",
            recommendation: "Optimize workload distribution",
            confidence: 87,
            riskType: "Performance",
            urgency: "warning",
          },
        ])
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
          <GlassMetricCard
            title="Total Towers"
            value={towers.length}
            icon={Globe}
            status="success"
            trend="up"
            trendValue="+2 this month"
            delay={0}
            onClick={() => handleStatusCardClick(null)}
            isActive={statusFilter === null}
            clickable={true}
          />
          <GlassMetricCard
            title="Online Towers"
            value={towers.filter(tower => tower.status === "online").length}
            unit=""
            icon={Radio}
            status="success"
            trend="up"
            trendValue={`${Math.round((towers.filter(tower => tower.status === "online").length / towers.length) * 100)}% uptime`}
            delay={1}
            onClick={() => handleStatusCardClick("online")}
            isActive={statusFilter === "online"}
            clickable={true}
          />
          <GlassMetricCard 
            title="Warning Towers" 
            value={towers.filter(tower => tower.status === "warning").length} 
            icon={AlertTriangle} 
            status="warning" 
            delay={2}
            onClick={() => handleStatusCardClick("warning")}
            isActive={statusFilter === "warning"}
            clickable={true}
          />
          <GlassMetricCard
            title="Critical Towers"
            value={towers.filter(tower => tower.status === "critical").length}
            icon={AlertTriangle}
            status="error"
            delay={2}
            onClick={() => handleStatusCardClick("critical")}
            isActive={statusFilter === "warning"}
            clickable={true}
          />
        </motion.div>

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
                <p className="text-sm text-blue-200/70">Click on any tower to view details</p>
              </div>
            </div>
            <div className="h-[560px]">
              <CesiumGlobeWrapper 
                towers={towers} 
                onTowerClick={(tower) => {
                  console.log('Tower clicked on globe:', tower)
                  router.push(`/towers/${tower.id}`)
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Tower Status Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="w-full mb-8"
        >
          <div className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 rounded-3xl p-6 shadow-glass-lg">
            <h2 className="text-xl font-bold text-slate-50 mb-6">Tower Status</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredTowers.slice(0, 6).map((tower, index) => (
                <motion.div
                  key={tower.id}
                  className="p-4 bg-slate-600/50 backdrop-blur-xl border border-slate-500/40 rounded-2xl cursor-pointer hover:bg-slate-500/60 hover:border-slate-400/50 transition-all duration-300 group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
                  onClick={() => router.push(`/towers/${tower.id}`)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-blue-50 group-hover:text-blue-200 transition-colors">
                      {tower.name}
                    </h4>
                    <Badge
                      variant={
                        tower.status === "online"
                          ? "default"
                          : tower.status === "warning"
                            ? "secondary"
                            : "destructive"
                      }
                      className="backdrop-blur-xl"
                    >
                      {tower.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-blue-100/80 text-sm mb-3">
                    {tower.location?.city || tower.city || "Unknown Location"}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="flex justify-between">
                      <span className="text-blue-100/70">Battery:</span>
                      <span
                        className={cn(
                          "font-medium",
                          (tower.battery || 0) > 50
                            ? "text-emerald-400"
                            : (tower.battery || 0) > 20
                              ? "text-amber-400"
                              : "text-red-400",
                        )}
                      >
                        {tower.battery || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-100/70">Temp:</span>
                      <span className="text-blue-50 font-medium">{tower.temperature || 0}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-100/70">Uptime:</span>
                      <span className="text-emerald-400 font-medium">{tower.uptime || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-100/70">Load:</span>
                      <span className="text-blue-50 font-medium">{tower.networkLoad || 0}%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              <Button
                variant="outline"
                className="w-full bg-blue-700/40 backdrop-blur-xl border-blue-300/40 text-white hover:bg-blue-600/50 hover:border-blue-200/50 rounded-2xl transition-all duration-300"
                size="sm"
                onClick={() => router.push("/towers")}
              >
                View All Towers ({totalTowers})
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Recent Alerts & AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <div className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 rounded-3xl p-6 shadow-glass-lg">
              <div className="flex items-center space-x-3 mb-6">
                <motion.div
                  className="p-3 rounded-2xl bg-gradient-to-r from-slate-600/60 to-slate-500/60"
                  whileHover={{ rotate: 5, scale: 1.05 }}
                >
                  <AlertTriangle className="h-5 w-5 text-slate-200" />
                </motion.div>
                <h2 className="text-xl font-bold text-slate-50">Recent Alerts</h2>
              </div>

              <div className="space-y-4">
                {recentAlerts.slice(0, 3).map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    className="flex items-start space-x-4 p-4 bg-slate-600/50 backdrop-blur-xl border border-slate-500/40 rounded-2xl hover:bg-slate-500/60 transition-all duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.1, duration: 0.4 }}
                  >
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full mt-2 shadow-glow",
                        alert.severity === "critical"
                          ? "bg-red-500"
                          : alert.severity === "warning"
                            ? "bg-amber-500"
                            : "bg-blue-500",
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-50 mb-1">{alert.message}</p>
                      <p className="text-xs text-slate-300/70">
                        {alert.towerName} • {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
                <Button
                  variant="outline"
                  className="w-full bg-slate-700/40 backdrop-blur-xl border-slate-500/40 text-white hover:bg-slate-600/50 hover:border-blue-200/50 rounded-2xl transition-all duration-300"
                  size="sm"
                  onClick={() => router.push("/alerts")}
                >
                  View All Alerts
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
          >
            <div className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 rounded-3xl p-6 shadow-glass-lg">
              <div className="flex items-center space-x-3 mb-6">
                <motion.div
                  className="p-3 rounded-2xl bg-gradient-to-r from-slate-600/60 to-slate-500/60"
                  whileHover={{ rotate: 5, scale: 1.05 }}
                >
                  <Brain className="h-5 w-5 text-slate-200" />
                </motion.div>
                <h2 className="text-xl font-bold text-slate-50">AI Insights</h2>
              </div>

              <div className="space-y-4">
                {aiInsights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    className="p-4 bg-slate-600/50 backdrop-blur-xl border border-slate-500/40 rounded-2xl hover:bg-slate-500/60 transition-all duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 + index * 0.1, duration: 0.4 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge
                        variant={
                          insight.urgency === "critical"
                            ? "destructive"
                            : insight.urgency === "warning"
                              ? "secondary"
                              : "default"
                        }
                        className="text-xs"
                      >
                        {insight.urgency.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-slate-300/70">{insight.confidence}% confidence</span>
                    </div>
                    <h4 className="font-medium text-slate-100 mb-1">{insight.prediction}</h4>
                    <p className="text-xs text-slate-300/70 mb-2">{insight.towerName}</p>
                    <p className="text-xs text-slate-300/70">{insight.recommendation}</p>
                  </motion.div>
                ))}
                <Button
                  variant="outline"
                  className="w-full bg-slate-700/40 backdrop-blur-xl border-slate-500/40 text-white hover:bg-slate-600/50 hover:border-blue-200/50 rounded-2xl transition-all duration-300"
                  size="sm"
                  onClick={() => router.push("/ai-insights")}
                >
                  View All Insights
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
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
