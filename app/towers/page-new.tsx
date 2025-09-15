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
import { ViewToggle } from "@/components/ui/view-toggle"
import { TowerCardEnhanced } from "@/components/ui/tower-card-enhanced"
import { TowerCardList } from "@/components/ui/tower-card-list"
import { TowerCardCompact } from "@/components/ui/tower-card-compact"
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
  const [viewMode, setViewMode] = useState<"grid" | "list" | "compact">("grid")
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

  const handleCardClick = (filter: string) => {
    if (cardFilter === filter) {
      setCardFilter(null)
    } else {
      setCardFilter(filter)
    }
  }

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

  if (error && towers.length === 0) {
    return (
      <GlassMainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Error Loading Towers</h2>
            <p className="text-white/60 mb-4">{error}</p>
            <Button onClick={fetchTowers}>Retry</Button>
          </div>
        </div>
      </GlassMainLayout>
    )
  }

  return (
    <GlassMainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Tower Management
            </h1>
            <p className="text-white/60 text-lg mt-1">
              Monitor and manage your tower infrastructure
            </p>
          </div>
          <Button
            onClick={() => router.push('/towers/new')}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Tower
          </Button>
        </div>

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

        {/* Results Count and View Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex items-center justify-between"
        >
          <p className="text-white/60">
            Showing {filteredTowers.length} of {totalTowers} towers
          </p>
          <div className="flex items-center space-x-4">
            {filteredTowers.length === 0 && (
              <p className="text-yellow-400 text-sm">
                No towers match your current filters
              </p>
            )}
            <ViewToggle view={viewMode} onViewChange={setViewMode} />
          </div>
        </motion.div>

        {/* Towers Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className={cn(
            "space-y-4",
            viewMode === "grid" && "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
            viewMode === "list" && "space-y-3",
            viewMode === "compact" && "space-y-2"
          )}
        >
          {filteredTowers.map((tower, index) => {
            const handleEdit = (tower: any) => {
              router.push(`/towers/${tower.id}/edit`)
            }

            const handleDelete = async (towerId: string) => {
              const tower = filteredTowers.find(t => t.id === towerId)
              if (tower && confirm(`Are you sure you want to delete "${tower.name}"? This action cannot be undone.`)) {
                try {
                  await ApiClient.deleteTower(towerId)
                  await fetchTowers()
                } catch (error) {
                  console.error('Failed to delete tower:', error)
                  alert('Failed to delete tower. Please try again.')
                }
              }
            }

            const handleView = (towerId: string) => {
              router.push(`/towers/${towerId}`)
            }

            if (viewMode === "grid") {
              return (
                <TowerCardEnhanced
                  key={tower.id}
                  tower={tower}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                  index={index}
                />
              )
            } else if (viewMode === "list") {
              return (
                <TowerCardList
                  key={tower.id}
                  tower={tower}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                  index={index}
                />
              )
            } else {
              return (
                <TowerCardCompact
                  key={tower.id}
                  tower={tower}
                  onView={handleView}
                  index={index}
                />
              )
            }
          })}
        </motion.div>

        {/* Empty State */}
        {filteredTowers.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Globe className="h-12 w-12 text-white/30" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No towers found</h3>
            <p className="text-white/60 mb-6">
              {searchQuery || statusFilter !== "all" || regionFilter !== "all" || cardFilter
                ? "Try adjusting your filters to see more results."
                : "Get started by adding your first tower."}
            </p>
            {!searchQuery && statusFilter === "all" && regionFilter === "all" && !cardFilter && (
              <Button
                onClick={() => router.push('/towers/new')}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Tower
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
