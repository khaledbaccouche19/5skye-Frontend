"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, Filter, Search, CheckCircle, Clock, XCircle } from "lucide-react"
import { GlassMainLayout } from "@/components/layout/glass-main-layout"
import { GlassMetricCard } from "@/components/ui/glass-metric-card"
import { AlertItem } from "@/components/ui/alert-item"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ApiClient } from "@/lib/api-client"

function AlertsContent() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [filteredAlerts, setFilteredAlerts] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch alerts from real API
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const alertsData = await ApiClient.getRecentAlerts()
        setAlerts(alertsData)
        setFilteredAlerts(alertsData)
      } catch (err) {
        console.error('Failed to fetch alerts:', err)
        setError('Failed to load alerts')
        // Fallback to empty array if API fails
        setAlerts([])
        setFilteredAlerts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAlerts()
  }, [])

  // Filter alerts based on search and filters
  useEffect(() => {
    let filtered = alerts

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((alert) =>
        alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.towerName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply severity filter
    if (severityFilter !== "all") {
      filtered = filtered.filter((alert) => alert.severity === severityFilter)
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((alert) => 
        statusFilter === "resolved" ? alert.resolved : !alert.resolved
      )
    }

    setFilteredAlerts(filtered)
  }, [alerts, searchQuery, severityFilter, statusFilter])

  const totalAlerts = alerts.length
  const criticalAlerts = alerts.filter((alert) => alert.severity === "critical" && !alert.resolved).length
  const warningAlerts = alerts.filter((alert) => alert.severity === "warning" && !alert.resolved).length
  const resolvedAlerts = alerts.filter((alert) => alert.resolved).length

  if (isLoading) {
    return (
      <GlassMainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">Loading alerts...</p>
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
            <h2 className="text-2xl font-bold text-white mb-2">Error Loading Alerts</h2>
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-200 to-orange-200 bg-clip-text text-transparent mb-2">
              Alerts
            </h1>
            <p className="text-red-50 text-lg">
              Monitor and manage system alerts and notifications
            </p>
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
            title="Total Alerts"
            value={totalAlerts}
            icon={AlertTriangle}
            status="neutral"
            trend="neutral"
            delay={0}
          />
          <GlassMetricCard
            title="Critical"
            value={criticalAlerts}
            icon={AlertTriangle}
            status="error"
            trend="down"
            delay={1}
          />
          <GlassMetricCard
            title="Warnings"
            value={warningAlerts}
            icon={AlertTriangle}
            status="warning"
            trend="neutral"
            delay={2}
          />
          <GlassMetricCard
            title="Resolved"
            value={resolvedAlerts}
            icon={CheckCircle}
            status="success"
            trend="up"
            delay={3}
          />
        </motion.div>

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
                placeholder="Search alerts by message or tower name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Alerts List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="space-y-4"
        >
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-16 w-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No alerts found</h3>
              <p className="text-white/60">
                {searchQuery || severityFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "All systems are operating normally"}
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
              >
                <AlertItem alert={alert} />
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </GlassMainLayout>
  )
}

export default function AlertsPage() {
  return (
    <ProtectedRoute>
      <AlertsContent />
    </ProtectedRoute>
  )
}
