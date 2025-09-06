"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Plus, Search, Filter, Globe, Radio, AlertTriangle, Brain, Edit, Trash2, RefreshCw } from "lucide-react"
import { GlassMainLayout } from "@/components/layout/glass-main-layout"
import { GlassMetricCard } from "@/components/ui/glass-metric-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ConnectionStatusBadge, getTowerDataSource, isTowerConnected } from "@/components/ui/connection-status-badge"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ApiClient } from "@/lib/api-client"
import { cn } from "@/lib/utils"

function TowersContent() {
  const router = useRouter()
  const [towers, setTowers] = useState<any[]>([])
  const [filteredTowers, setFilteredTowers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [regionFilter, setRegionFilter] = useState("all")
  const [cardFilter, setCardFilter] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch towers from real API
  const fetchTowers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const towersData = await ApiClient.getTowers()
      setTowers(towersData)
      setFilteredTowers(towersData)
    } catch (err) {
      console.error('Failed to fetch towers:', err)
      setError('Failed to load towers')
      // Fallback to empty array if API fails
      setTowers([])
      setFilteredTowers([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTowers()
  }, [])

  // Filter towers based on search, filters, and card selection
  useEffect(() => {
    let filtered = towers

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((tower) =>
        tower.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tower.location?.city || tower.city || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tower.useCase || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((tower) => tower.status === statusFilter)
    }

    // Apply region filter
    if (regionFilter !== "all") {
      filtered = filtered.filter((tower) => (tower.region || "") === regionFilter)
    }

    // Apply card filter (overrides status filter when active)
    if (cardFilter) {
      switch (cardFilter) {
        case "online":
          filtered = filtered.filter((tower) => tower.status === "online")
          break
        case "warning":
          filtered = filtered.filter((tower) => tower.status === "warning")
          break
        case "critical":
          filtered = filtered.filter((tower) => tower.status === "critical")
          break
        case "total":
          // Show all towers (no additional filtering)
          break
      }
    }

    setFilteredTowers(filtered)
  }, [towers, searchQuery, statusFilter, regionFilter, cardFilter])

  const totalTowers = towers.length
  const onlineTowers = towers.filter((tower) => tower.status === "online").length
  const warningTowers = towers.filter((tower) => tower.status === "warning").length
  const criticalTowers = towers.filter((tower) => tower.status === "critical").length

  // Handle card click to set filter
  const handleCardClick = (filterType: string) => {
    if (cardFilter === filterType) {
      // If clicking the same card, remove the filter
      setCardFilter(null)
      setStatusFilter("all")
    } else {
      // Set new card filter and update status filter accordingly
      setCardFilter(filterType)
      if (filterType !== "total") {
        setStatusFilter(filterType)
      } else {
        setStatusFilter("all")
      }
    }
  }

  // Clear all filters
  const clearAllFilters = () => {
    setCardFilter(null)
    setStatusFilter("all")
    setRegionFilter("all")
    setSearchQuery("")
  }

  if (isLoading) {
    return (
      <GlassMainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">Loading towers...</p>
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
            <h2 className="text-2xl font-bold text-white mb-2">Error Loading Towers</h2>
            <p className="text-white/60 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </GlassMainLayout>
    )
  }

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
              Towers
            </h1>
            <p className="text-blue-50 text-lg">
              Manage and monitor your infrastructure towers
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              size="lg"
              variant="outline"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-2xl"
              onClick={fetchTowers}
              disabled={isLoading}
            >
              <RefreshCw className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl"
              onClick={() => router.push("/towers/new")}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Tower
            </Button>
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
              title="Online"
              value={onlineTowers}
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
              title="Warning"
              value={warningTowers}
              icon={AlertTriangle}
              status={cardFilter === "warning" ? "warning" : "neutral"}
              trend="neutral"
              delay={2}

            />
          </div>
          
          <div 
            onClick={() => handleCardClick("critical")}
            className="cursor-pointer transform transition-all duration-300 hover:scale-105"
          >
            <GlassMetricCard
              title="Critical"
              value={criticalTowers}
              icon={AlertTriangle}
              status={cardFilter === "critical" ? "error" : "neutral"}
              trend="down"
              delay={3}
            />
          </div>
        </motion.div>

        {/* Active Filters Display */}
        {(cardFilter || statusFilter !== "all" || regionFilter !== "all" || searchQuery) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-white/60 text-sm">Active Filters:</span>
                {cardFilter && (
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-200 border-blue-400/30">
                    {cardFilter.charAt(0).toUpperCase() + cardFilter.slice(1)}: {filteredTowers.length} towers
                  </Badge>
                )}
                {statusFilter !== "all" && (
                  <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                    Status: {statusFilter}
                  </Badge>
                )}
                {regionFilter !== "all" && (
                  <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                    Region: {regionFilter}
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                    Search: "{searchQuery}"
                  </Badge>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearAllFilters}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                Clear All
              </Button>
            </div>
          </motion.div>
        )}

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
              <Input
                placeholder="Search towers by name, city, or use case..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="online">Online</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
                <option value="offline">Offline</option>
              </select>

              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Regions</option>
                <option value="Middle East">Middle East</option>
                <option value="Europe">Europe</option>
                <option value="Asia Pacific">Asia Pacific</option>
                <option value="North America">North America</option>
                <option value="South America">South America</option>
                <option value="Africa">Africa</option>
              </select>
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
          </p>
          {filteredTowers.length === 0 && (
            <p className="text-yellow-400 text-sm">
              No towers match your current filters
            </p>
          )}
        </motion.div>

        {/* Towers Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredTowers.map((tower, index) => (
            <motion.div
              key={tower.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
              className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border border-blue-400/30">
                    <Globe className="h-6 w-6 text-blue-200" />
                  </div>
                  <div>
                    <h3 
                      className="font-bold text-white group-hover:text-blue-200 transition-colors cursor-pointer hover:text-blue-200 hover:underline"
                      onClick={() => router.push(`/towers/${tower.id}`)}
                    >
                      {tower.name}
                    </h3>
                    <p className="text-sm text-white/60">
                      {tower.location?.city || tower.city || "Unknown Location"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
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
                  <ConnectionStatusBadge
                    isConnected={isTowerConnected(tower)}
                    dataSource={getTowerDataSource(tower)}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Use Case:</span>
                  <span className="text-white font-medium">{tower.useCase || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Region:</span>
                  <span className="text-white font-medium">{tower.region || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Last Maintenance:</span>
                  <span className="text-white font-medium">
                    {tower.lastMaintenance ? new Date(tower.lastMaintenance).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-center p-3 bg-white/5 rounded-2xl">
                  <div className="text-2xl font-bold text-blue-200">{tower.battery || 0}%</div>
                  <div className="text-white/60">Battery</div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-2xl">
                  <div className="text-2xl font-bold text-green-200">{tower.temperature || 0}°C</div>
                  <div className="text-white/60">Temperature</div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-2xl">
                  <div className="text-2xl font-bold text-purple-200">{tower.uptime || 0}%</div>
                  <div className="text-white/60">Uptime</div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-2xl">
                  <div className="text-2xl font-bold text-orange-200">{tower.networkLoad || 0}%</div>
                  <div className="text-white/60">Network</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t border-white/10">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/towers/${tower.id}/edit`)
                  }}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="bg-red-500/30 border-red-500/50 text-red-100 hover:bg-red-500/50 hover:text-white font-medium"
                  onClick={async (e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    
                    console.log('Delete button clicked for tower:', tower.id, tower.name)
                    
                    if (confirm(`Are you sure you want to delete "${tower.name}"? This action cannot be undone.`)) {
                      // Show loading state
                      const button = e.currentTarget
                      const originalText = button.innerHTML
                      button.innerHTML = '<div class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1"></div>Deleting...'
                      button.disabled = true
                      
                      try {
                        console.log('Deleting tower with ID:', tower.id)
                        
                        const result = await ApiClient.deleteTower(tower.id)
                        console.log('Delete API response:', result)
                        
                        if (result && result.success) {
                          console.log('Tower deleted successfully, refreshing list...')
                          
                          // Refresh the towers list
                          await fetchTowers()
                          console.log('Towers list refreshed')
                          
                          // Show success message
                          alert(`Tower "${tower.name}" deleted successfully!`)
                        } else {
                          throw new Error('Delete operation did not return success status')
                        }
                      } catch (err) {
                        console.error('Failed to delete tower:', err)
                        alert(`Failed to delete tower: ${err instanceof Error ? err.message : 'Unknown error'}`)
                      } finally {
                        // Reset button state
                        button.innerHTML = originalText
                        button.disabled = false
                      }
                    }
                  }}
                  title={`Delete ${tower.name}`}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredTowers.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Globe className="h-16 w-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No towers found</h3>
            <p className="text-white/60 mb-4">
              {searchQuery || statusFilter !== "all" || regionFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by adding your first tower"}
            </p>
            {!searchQuery && statusFilter === "all" && regionFilter === "all" && (
              <Button
                onClick={() => router.push("/towers/new")}
                className="bg-gradient-to-r from-blue-500 to-cyan-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Tower
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </GlassMainLayout>
  )
}

export default function TowersPage() {
  return (
    <ProtectedRoute>
      <TowersContent />
    </ProtectedRoute>
  )
}
