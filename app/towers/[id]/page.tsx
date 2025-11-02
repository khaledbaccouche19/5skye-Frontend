"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Battery,
  Thermometer,
  Wifi,
  Activity,
  Search,
  Settings,
  History,
  AlertTriangle,
  Download,
  Edit,
  Wind,
  Droplets,
  Gauge,
  Signal,
  Clock,
  Zap,
  Plus,
  Wrench,
  DollarSign,
  Brain,
  RefreshCw,
  MessageCircle,
  Send,
  Bot,
  User,
} from "lucide-react"
import { GlassMainLayout } from "@/components/layout/glass-main-layout"
import { GlassMetricCard } from "@/components/ui/glass-metric-card"
import { AlertItem } from "@/components/ui/alert-item"
import { HardwareManagement } from "@/components/ui/hardware-management"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts"
import { Tower3DViewer } from "@/components/ui/tower-3d-viewer"
import { ConnectionStatusBadge, getTowerDataSource, isTowerConnected } from "@/components/ui/connection-status-badge"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { InlineMaintenanceForm } from "@/components/maintenance/inline-maintenance-form"
import { MaintenanceDetails } from "@/components/maintenance/maintenance-details"
import { SiteBossDataDisplay } from "@/components/siteboss/siteboss-data-display"
import { useTowers } from "@/lib/towers-context"
import { ApiClient, type PredictiveInsightDTO } from "@/lib/api-client"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/translation-context"

function TowerDetailsContent() {
  const { t } = useTranslation()
  const params = useParams()
  const towerIdParam = (params?.id as string) || ""
  // removed history UI/state

  const router = useRouter()
  const { getTowerById } = useTowers()
  const towerId = params.id as string

  const [tower, setTower] = useState<any>(null)
  const [hardwareComponents, setHardwareComponents] = useState<any[]>([])
  // const [alertThresholds, setAlertThresholds] = useState<any[]>([])
  // const [towerAlerts, setTowerAlerts] = useState<any[]>([])
  const [telemetryData, setTelemetryData] = useState<any[]>([])
  const [liveTelemetryData, setLiveTelemetryData] = useState<any>(null)
  const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([])
  const [predictions, setPredictions] = useState<PredictiveInsightDTO[] | null>(null)
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false)
  const [predictionsError, setPredictionsError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshingTelemetry, setIsRefreshingTelemetry] = useState(false)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)
  const [refreshMs, setRefreshMs] = useState<number>(2000)
  const [error, setError] = useState<string | null>(null)
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null)
  const [isMaintenanceDetailsOpen, setIsMaintenanceDetailsOpen] = useState(false)
  
  // AI Chatbot state
  const [chatMessages, setChatMessages] = useState<Array<{id: string, type: 'user' | 'ai', message: string, timestamp: string}>>([])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [showChat, setShowChat] = useState(false)

  // Function to refresh maintenance data
  const refreshMaintenanceData = async () => {
    try {
      const maintenanceData = await ApiClient.getMaintenanceByTowerId(towerId)
      setMaintenanceRecords(maintenanceData)
    } catch (error) {
      console.error('Failed to refresh maintenance data:', error)
    }
  }

  // Maintenance filters
  const [maintStatus, setMaintStatus] = useState<string>("ALL")
  const [maintType, setMaintType] = useState<string>("ALL")
  const [maintPriority, setMaintPriority] = useState<string>("ALL")
  const [maintFrom, setMaintFrom] = useState<string>("")
  const [maintTo, setMaintTo] = useState<string>("")
  const [maintQuery, setMaintQuery] = useState<string>("")

  const filteredMaintenance = maintenanceRecords.filter((r) => {
    if (
      maintQuery &&
      !(
        r.title?.toLowerCase().includes(maintQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(maintQuery.toLowerCase()) ||
        r.technician?.toLowerCase().includes(maintQuery.toLowerCase())
      )
    ) return false
    if (maintStatus !== "ALL" && r.status !== maintStatus) return false
    if (maintType !== "ALL" && r.type !== maintType) return false
    if (maintPriority !== "ALL" && r.priority !== maintPriority) return false
    if (maintFrom && new Date(r.startDate) < new Date(maintFrom)) return false
    if (maintTo && new Date(r.startDate) > new Date(maintTo)) return false
    return true
  })

  // Function to open maintenance details
  const openMaintenanceDetails = (maintenance: any) => {
    setSelectedMaintenance(maintenance)
    setIsMaintenanceDetailsOpen(true)
  }

  // Function to close maintenance details
  const closeMaintenanceDetails = () => {
    setSelectedMaintenance(null)
    setIsMaintenanceDetailsOpen(false)
  }

  // AI Chatbot functions
  const sendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      message: chatInput,
      timestamp: new Date().toISOString()
    }

    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setIsChatLoading(true)

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tower_id: parseInt(towerId),
          message: chatInput
        })
      })

      const data = await response.json()
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai' as const,
        message: data.ai_response,
        timestamp: new Date().toISOString()
      }

      setChatMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai' as const,
        message: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setIsChatLoading(false)
    }
  }

  const handleChatKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendChatMessage()
    }
  }

  // Function to handle maintenance status update
  const handleMaintenanceStatusUpdate = () => {
    refreshMaintenanceData()
    if (selectedMaintenance) {
      // Refresh the selected maintenance data
      ApiClient.getMaintenanceById(selectedMaintenance.id).then(setSelectedMaintenance)
    }
  }

  // Fetch tower data from real API
  useEffect(() => {
    const fetchTowerData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch tower details
        const towerData = await ApiClient.getTowerById(towerId)
        console.log('🔄 Tower details refreshed:', towerData)
        console.log('🔧 SiteBoss config:', {
          enabled: towerData.sitebossEnabled,
          host: towerData.sitebossHost,
          username: towerData.sitebossUsername,
          password: towerData.sitebossPassword
        })
        console.log('📋 All tower properties:', Object.keys(towerData))
        setTower(towerData)

        // Fetch hardware components
        const hardwareData = await ApiClient.getHardwareByTower(towerId)
        setHardwareComponents(hardwareData)

        // Thresholds feature removed per request

        // Fetch live telemetry data through backend proxy
        try {
          const liveData = await ApiClient.fetchTelemetryData(parseInt(towerId))
          console.log('Live telemetry data fetched through backend:', liveData)
          console.log('Live telemetry data type:', typeof liveData, 'Array?', Array.isArray(liveData))
          if (Array.isArray(liveData) && liveData.length > 0) {
            console.log('First telemetry entry:', liveData[0])
          }
          setLiveTelemetryData(liveData)
        } catch (liveError) {
          console.warn('Warning: Failed to fetch live telemetry data:', liveError)
          // Don't set error state for live data failures, just log it
        }

        // Fetch stored telemetry data from backend database
        try {
          const telemetryData = await ApiClient.getTelemetryByTower(towerId)
          setTelemetryData(telemetryData)
          console.log('Stored telemetry data fetched from backend database:', telemetryData)
        } catch (telemetryError) {
          console.warn('Warning: Failed to fetch stored telemetry data:', telemetryError)
        }

        // Fetch maintenance records
        const maintenanceData = await ApiClient.getMaintenanceByTowerId(towerId)
        setMaintenanceRecords(maintenanceData)

        // Fetch predictive insights
        try {
          setIsLoadingPredictions(true)
          const preds = await ApiClient.getPredictions(towerId)
          setPredictions(preds)
        } catch (predErr: any) {
          console.warn('⚠️ Failed to fetch predictions:', predErr)
          setPredictionsError(predErr?.message || 'Failed to load predictions')
          setPredictions([])
        } finally {
          setIsLoadingPredictions(false)
        }

        // Alerts feature removed per request

      } catch (err) {
        console.error('Failed to fetch tower data:', err)
        setError('Failed to load tower data')
        
        // Fallback to dummy data if API fails
        const fallbackTower = getTowerById(towerId)
        if (fallbackTower) {
          setTower(fallbackTower)
          setHardwareComponents([
            {
              id: "COMP-001",
              name: "5G Network Module",
              type: "network" as const,
              vendor: "Ericsson",
              model: "AIR 3268",
              serialNumber: "ER3268001",
              warrantyExpiry: "2025-12-31",
              status: "active" as const,
              installDate: "2023-01-15",
              specifications: { 
                speed: "5G", 
                ports: "4", 
                protocol: "5G NR", 
                poe: "Yes" 
              },
            },
            {
              id: "COMP-002",
              name: "Edge Processor",
              type: "processor" as const,
              vendor: "Intel",
              model: "Xeon D-2146NT",
              serialNumber: "IN2146001",
              warrantyExpiry: "2026-06-30",
              status: "active" as const,
              installDate: "2023-01-15",
              specifications: { 
                cores: "8", 
                frequency: "2.3GHz", 
                cache: "16MB", 
                tdp: "65W" 
              },
            },
          ])
          // Thresholds demo data removed per request
          setTelemetryData([
            { time: "00:00", voltage: 12.4, temperature: 42, bandwidth: 65 },
            { time: "04:00", voltage: 12.1, temperature: 38, bandwidth: 45 },
            { time: "08:00", voltage: 12.3, temperature: 44, bandwidth: 78 },
            { time: "12:00", voltage: 12.0, temperature: 48, bandwidth: 89 },
            { time: "16:00", voltage: 11.8, temperature: 52, bandwidth: 92 },
            { time: "20:00", voltage: 11.9, temperature: 46, bandwidth: 71 },
          ])
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (towerId) {
      fetchTowerData()
    }
  }, [towerId, getTowerById])

  // Define refreshTelemetryData as useCallback to avoid dependency issues
  const refreshTelemetryData = useCallback(async () => {
    setIsRefreshingTelemetry(true)
    try {
      const liveData = await ApiClient.fetchTelemetryData(parseInt(towerId))
      setLiveTelemetryData(liveData)
      console.log('Telemetry data refreshed:', liveData)
    } catch (error) {
      console.error('Error: Failed to refresh telemetry data:', error)
    } finally {
      setIsRefreshingTelemetry(false)
    }
  }, [towerId])

  // Auto-refresh telemetry data with configurable interval
  useEffect(() => {
    // Use tower preferred refresh if available
    if (tower?.refreshIntervalMs && Number.isFinite(tower.refreshIntervalMs)) {
      setRefreshMs(tower.refreshIntervalMs)
    }
  }, [tower?.refreshIntervalMs])

  useEffect(() => {
    if (!autoRefreshEnabled) return

    const interval = setInterval(() => {
      refreshTelemetryData()
    }, refreshMs)

    return () => clearInterval(interval)
  }, [autoRefreshEnabled, refreshMs, refreshTelemetryData])

  // Refresh data when page becomes visible (e.g., returning from edit page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && tower) {
        console.log('🔄 Page became visible, refreshing tower data...')
        // Re-fetch tower data to get latest changes
        ApiClient.getTowerById(towerId).then(towerData => {
          console.log('🔄 Tower data refreshed on visibility change:', towerData)
          console.log('🔧 Updated SiteBoss config:', {
            enabled: towerData.sitebossEnabled,
            host: towerData.sitebossHost,
            username: towerData.sitebossUsername,
            password: towerData.sitebossPassword
          })
          setTower(towerData)
        }).catch(err => {
          console.error('❌ Failed to refresh tower data:', err)
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [towerId, tower])

  if (isLoading) {
    return (
      <GlassMainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">Loading tower details...</p>
          </div>
        </div>
      </GlassMainLayout>
    )
  }

  if (error && !tower) {
    return (
      <GlassMainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Error Loading Tower</h2>
            <p className="text-white/60 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </GlassMainLayout>
    )
  }

  if (!tower) {
    return (
      <GlassMainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Tower Not Found</h2>
            <p className="text-white/60 mb-4">The requested tower could not be found.</p>
            <Button onClick={() => router.push("/towers")}>Return to Towers</Button>
          </div>
        </div>
      </GlassMainLayout>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "warning":
        return "bg-yellow-500"
      case "critical":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getBatteryStatus = (battery: number) => {
    // If tower is disconnected, always show error status
    if (!isTowerConnected(tower)) return "error"
    if (battery > 50) return "success"
    if (battery > 20) return "warning"
    return "error"
  }

  const getTemperatureStatus = (temp: number) => {
    // If tower is disconnected, always show error status
    if (!isTowerConnected(tower)) return "error"
    if (temp < 45) return "success"
    if (temp < 55) return "warning"
    return "error"
  }


  // Get the current telemetry values (live data takes precedence over static data)
  const getCurrentTelemetryValue = (field: string) => {
    // If tower is disconnected, always return 0
    if (!isTowerConnected(tower)) return 0
    
    if (liveTelemetryData) {
      // Handle array data structure (take the first/latest entry)
      const data = Array.isArray(liveTelemetryData) ? liveTelemetryData[0] : liveTelemetryData
      if (data && data[field] !== null && data[field] !== undefined) {
        console.log(`Using live telemetry data for ${field}:`, data[field])
        return data[field]
      }
    }
    console.log(`Falling back to tower static data for ${field}:`, tower[field] || 0)
    return tower[field] || 0
  }

  // Get the latest telemetry entry (for array data)
  const getLatestTelemetryData = () => {
    if (liveTelemetryData && Array.isArray(liveTelemetryData) && liveTelemetryData.length > 0) {
      return liveTelemetryData[0] // Get the most recent entry
    }
    return liveTelemetryData
  }

  return (
    <GlassMainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.back}
            </Button>
            <div>
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${getStatusColor(tower.status)}`} />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  {tower.name}
                </h1>
                <Badge
                  variant={
                    tower.status === "online" ? "default" : tower.status === "warning" ? "secondary" : "destructive"
                  }
                >
                  {tower.status.toUpperCase()}
                </Badge>
                <ConnectionStatusBadge
                  isConnected={isTowerConnected(tower)}
                  dataSource={getTowerDataSource(tower)}
                  className="text-sm"
                />
              </div>
              <p className="text-white/60 text-lg mt-1">
                {tower.id} • {tower.location?.city || tower.city || "Unknown Location"} • {tower.useCase || "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-2xl"
            >
              <Download className="h-4 w-4 mr-2" />
              {t.exportData}
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="border-white/10 hover:bg-white/5 rounded-2xl"
              onClick={async () => {
                console.log('🔄 Manually refreshing tower data...')
                try {
                  const towerData = await ApiClient.getTowerById(towerId)
                  console.log('🔄 Manual refresh - Tower data:', towerData)
                  console.log('🔧 Manual refresh - SiteBoss config:', {
                    enabled: towerData.sitebossEnabled,
                    host: towerData.sitebossHost,
                    username: towerData.sitebossUsername,
                    password: towerData.sitebossPassword
                  })
                  setTower(towerData)
                } catch (err) {
                  console.error('❌ Failed to refresh tower data:', err)
                }
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t.refresh}
            </Button>
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl"
              onClick={() => router.push(`/towers/${towerId}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {t.editTower}
            </Button>
          </div>
        </div>

        {/* Quick Info Strip removed per request */}

        {/* 3D Visualization */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Settings className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">{t.tower3dVisualization}</h2>
          </div>
          <div className="h-[600px] w-full">
            <Tower3DViewer tower={tower} />
          </div>
        </div>

        {/* Live Metrics Section (collapsible) */}
        <Accordion type="multiple" className="space-y-4">
          <AccordionItem value="live-metrics" className="border-none">
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl">
              <AccordionTrigger className="px-6">
                <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <Activity className="w-6 h-6 text-purple-400" />
                    </div>
                      <h2 className="text-2xl font-bold text-white tracking-tight">Live Metrics</h2>
                  </div>
              {liveTelemetryData && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-green-400">Live Data</span>
                </div>
              )}
            </div>
              </AccordionTrigger>
              <AccordionContent className="px-0">
                <div className="px-6 pb-6 pt-2">
            {tower?.apiEndpointUrl && (
                    <div className="flex items-center justify-end space-x-2 mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshTelemetryData}
                  disabled={isRefreshingTelemetry}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-2xl"
                >
                  {isRefreshingTelemetry ? (
                    <div className="w-4 h-4 border-2 border-slate-300/30 border-t-slate-300 rounded-full animate-spin mr-2" />
                  ) : (
                    <Activity className="h-4 w-4 mr-2" />
                  )}
                  {isRefreshingTelemetry ? t.refreshing : t.refresh}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                  className={`bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-2xl ${
                    autoRefreshEnabled ? 'bg-green-500/20 border-green-500/30' : ''
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    autoRefreshEnabled ? 'bg-green-400 animate-pulse' : 'bg-slate-400'
                  }`} />
                  {t.auto}
                </Button>
                      <div className="ml-2">
                        <Select
                          value={String(refreshMs)}
                          onValueChange={(v) => setRefreshMs(parseInt(v))}
                        >
                          <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white rounded-2xl h-8">
                            <SelectValue placeholder={t.refresh} />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900/90 backdrop-blur-xl border-white/10 text-white">
                            <SelectItem value="1000">Every 1s</SelectItem>
                            <SelectItem value="2000">Every 2s</SelectItem>
                            <SelectItem value="5000">Every 5s</SelectItem>
                            <SelectItem value="10000">Every 10s</SelectItem>
                            <SelectItem value="30000">Every 30s</SelectItem>
                          </SelectContent>
                        </Select>
              </div>
          </div>
                  )}
          
          <div className="space-y-8">
            {/* System Health Section */}
            <div className="space-y-6">
              <h4 className="text-xl font-semibold text-white uppercase tracking-wide">System Health</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Battery className="h-6 w-6 text-green-400" />
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {Math.round(getCurrentTelemetryValue('battery') * 10) / 10}%
                  </div>
                  <div className="text-sm text-white/70 mb-2">Battery Level</div>
                  <div className="flex items-center text-green-400 text-sm">
                    <Activity className="h-3 w-3 mr-1" />
                    +5% from yesterday
              </div>
            </div>
            
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Thermometer className="h-6 w-6 text-red-400" />
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {getCurrentTelemetryValue('temperature')}°C
                  </div>
                  <div className="text-sm text-white/70 mb-2">Temperature</div>
                  <div className="flex items-center text-red-400 text-sm">
                    <Activity className="h-3 w-3 mr-1 rotate-180" />
                    -2°C from yesterday
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Wifi className="h-6 w-6 text-blue-400" />
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {Math.round(getCurrentTelemetryValue('networkLoad') * 10) / 10}%
                  </div>
                  <div className="text-sm text-white/70 mb-2">Network Load</div>
                  <div className="text-sm text-white/50">Success</div>
                </div>

                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Activity className="h-6 w-6 text-green-400" />
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {Math.round(getCurrentTelemetryValue('uptime') * 10) / 10}%
                  </div>
                  <div className="text-sm text-white/70 mb-2">Uptime</div>
                  <div className="flex items-center text-green-400 text-sm">
                    <Activity className="h-3 w-3 mr-1" />
                    +0.2% this week
                  </div>
                </div>
              </div>
            </div>
            
            {/* Environmental Section */}
            <div className="space-y-6">
              <h4 className="text-xl font-semibold text-white uppercase tracking-wide">Environmental</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Droplets className="h-6 w-6 text-blue-400" />
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {Math.round(getCurrentTelemetryValue('humidity') * 10) / 10}%
                  </div>
                  <div className="text-sm text-white/70 mb-2">Humidity</div>
                  <div className="text-sm text-white/50">Success</div>
                </div>

                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Wind className="h-6 w-6 text-cyan-400" />
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {getCurrentTelemetryValue('windSpeed')} m/s
                  </div>
                  <div className="text-sm text-white/70 mb-2">Wind Speed</div>
                  <div className="text-sm text-white/50">Success</div>
                </div>

                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Gauge className="h-6 w-6 text-purple-400" />
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {getCurrentTelemetryValue('airQuality')}
                  </div>
                  <div className="text-sm text-white/70 mb-2">Air Quality</div>
                  <div className="text-sm text-white/50">Success</div>
                </div>

                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Signal className="h-6 w-6 text-yellow-400" />
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {getCurrentTelemetryValue('signalStrength')} dBm
                  </div>
                  <div className="text-sm text-white/70 mb-2">Signal Strength</div>
                  <div className="text-sm text-white/50">Success</div>
                </div>
              </div>
            </div>
            
            {/* Network Performance Section */}
            <div className="space-y-6">
              <h4 className="text-xl font-semibold text-white uppercase tracking-wide">Network Performance</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Clock className="h-6 w-6 text-orange-400" />
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {getCurrentTelemetryValue('latency')} ms
                  </div>
                  <div className="text-sm text-white/70 mb-2">Latency</div>
                  <div className="text-sm text-white/50">Success</div>
                </div>

                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Zap className="h-6 w-6 text-yellow-400" />
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {getCurrentTelemetryValue('bandwidth')} Mbps
                  </div>
                  <div className="text-sm text-white/70 mb-2">Bandwidth</div>
                  <div className="text-sm text-white/50">Success</div>
                </div>

                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Activity className="h-6 w-6 text-red-400" />
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {Math.round(getCurrentTelemetryValue('packetLoss') * 100) / 100}%
                  </div>
                  <div className="text-sm text-white/70 mb-2">Packet Loss</div>
                  <div className="text-sm text-white/50">Success</div>
                </div>

                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Wifi className="h-6 w-6 text-indigo-400" />
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {getCurrentTelemetryValue('jitter')} ms
                  </div>
                  <div className="text-sm text-white/70 mb-2">Jitter</div>
                  <div className="text-sm text-white/50">Success</div>
                </div>
              </div>
            </div>
          </div>
        </div>
              </AccordionContent>
            </div>
          </AccordionItem>
        </Accordion>

        {/* Data Sections (collapsible) */}
        <Accordion type="multiple" className="space-y-4">
          <AccordionItem value="siteboss" className="border-none">
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl">
              <AccordionTrigger className="px-6">
            <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Activity className="w-6 h-6 text-blue-400" />
            </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Real-Time Data</h2>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-0">
                <div className="px-6 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-white/70">Enable SiteBoss for this tower</div>
                      <Badge variant="outline" className={cn("rounded-full px-2 py-0.5 text-xs", !!tower.sitebossEnabled ? "border-green-500/40 text-green-400" : "border-white/20 text-white/60")}>{!!tower.sitebossEnabled ? "Enabled" : "Disabled"}</Badge>
                    </div>
                    <Switch
                      className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-white/10 border border-white/10"
                      checked={!!tower.sitebossEnabled}
                      onCheckedChange={async (checked) => {
                        try {
                          // Fetch latest tower to ensure we meet backend validators
                          const latest = await ApiClient.getTowerById(towerId)
                          const payload: any = {
                            name: latest.name || tower.name || 'Tower',
                            status: String(latest.status || tower.status || 'ONLINE').toUpperCase(),
                            latitude: Number(latest.latitude ?? tower.latitude ?? 0),
                            longitude: Number(latest.longitude ?? tower.longitude ?? 0),
                            city: latest.city || tower.city || 'City',
                            battery: Number(latest.battery ?? tower.battery ?? 0),
                            temperature: Number(latest.temperature ?? tower.temperature ?? 0),
                            uptime: Number(latest.uptime ?? tower.uptime ?? 0),
                            networkLoad: Number(latest.networkLoad ?? tower.networkLoad ?? 0),
                            useCase: latest.useCase || tower.useCase || 'GENERAL',
                            region: latest.region || tower.region || 'UNKNOWN',
                            lastMaintenance: latest.lastMaintenance ?? tower.lastMaintenance ?? null,
                            model3dPath: latest.model3dPath ?? tower.model3dPath ?? null,
                            apiEndpointUrl: latest.apiEndpointUrl ?? tower.apiEndpointUrl ?? null,
                            apiKey: latest.apiKey ?? tower.apiKey ?? null,
                            refreshIntervalMs: Number(latest.refreshIntervalMs ?? tower.refreshIntervalMs ?? 0) || null,
                            // SiteBoss
                            sitebossEnabled: checked,
                            sitebossHost: latest.sitebossHost ?? tower.sitebossHost ?? null,
                            sitebossUsername: latest.sitebossUsername ?? tower.sitebossUsername ?? null,
                            sitebossPassword: latest.sitebossPassword ?? tower.sitebossPassword ?? null,
                          }

                          const updated = await ApiClient.updateTower(towerId, payload)
                          setTower(updated)
                        } catch (e) {
                          console.error('Failed to toggle SiteBoss:', e)
                        }
                      }}
                    />
                  </div>
                  <SiteBossDataDisplay
                    config={{
                      host: tower.sitebossHost || '10.9.1.19',
                      username: tower.sitebossUsername || 'admin',
                      password: tower.sitebossPassword || 'password',
                      enabled: !!tower.sitebossEnabled,
                    }}
                    towerId={towerId}
                  />
                </div>
              </AccordionContent>
            </div>
          </AccordionItem>

          {/* AI Alerts Section */}
          <AccordionItem value="ai-alerts" className="border-none">
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl">
              <AccordionTrigger className="px-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Brain className="w-6 h-6 text-blue-400" />
                  </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">AI Alerts</h2>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-0">
                <div className="px-6 pb-6">
          {isLoadingPredictions ? (
            <div className="text-white/60">Loading predictions…</div>
          ) : predictionsError ? (
            <div className="text-red-400">{predictionsError}</div>
          ) : !predictions || predictions.length === 0 ? (
            <div className="space-y-4">
              {/* AI Chatbot Interface */}
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <MessageCircle className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{t.aiAssistant}</h3>
                      <p className="text-white/60 text-sm">{t.chatWithAI}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowChat(!showChat)}
                    className="text-white/60 hover:text-white"
                  >
                    {showChat ? 'Hide' : 'Show'} Chat
                  </Button>
                </div>

                {showChat && (
                  <div className="space-y-4">
                 {/* Chat Messages */}
                 <div className="h-[40rem] overflow-y-auto space-y-3 p-3 bg-black/20 rounded-lg border border-white/10">
                      {chatMessages.length === 0 ? (
                        <div className="text-center text-white/60 py-8">
                          <Bot className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                          <p>Ask me anything about this tower!</p>
                          <p className="text-sm mt-1">Try: "What are the main issues?" or "How is the temperature?"</p>
                        </div>
                      ) : (
                        chatMessages.map((message) => (
                          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex items-start space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                              <div className={`p-2 rounded-lg ${message.type === 'user' ? 'bg-blue-500/20' : 'bg-white/10'}`}>
                                {message.type === 'user' ? (
                                  <User className="w-4 h-4 text-blue-400" />
                                ) : (
                                  <Bot className="w-4 h-4 text-blue-400" />
                                )}
                              </div>
                              <div className={`p-3 rounded-lg ${message.type === 'user' ? 'bg-blue-500/20 text-white' : 'bg-white/10 text-white/90'}`}>
                                <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                                <p className="text-xs text-white/50 mt-1">
                                  {new Date(message.timestamp).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      {isChatLoading && (
                        <div className="flex justify-start">
                          <div className="flex items-start space-x-2">
                            <div className="p-2 rounded-lg bg-white/10">
                              <Bot className="w-4 h-4 text-blue-400" />
                            </div>
                            <div className="p-3 rounded-lg bg-white/10">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Chat Input */}
                    <div className="flex space-x-2">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={handleChatKeyPress}
                        placeholder="Ask about this tower..."
                        disabled={isChatLoading}
                        className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400"
                      />
                      <Button
                        onClick={sendChatMessage}
                        disabled={!chatInput.trim() || isChatLoading}
                        className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {predictions.map((p, idx) => (
                <div key={`${p.metric}-${p.predictedBy}-${idx}`} className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">{p.type}</Badge>
                      <Badge variant="outline" className="text-xs">{p.riskType}</Badge>
                      <Badge className={
                        p.urgency === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                        p.urgency === 'HIGH' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                        p.urgency === 'WARNING' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                        'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      }>
                        {p.urgency}
                      </Badge>
                    </div>
                    <div className="text-white font-medium">{p.title}</div>
                    <div className="text-white/70 text-sm">{p.recommendation}</div>
                    <div className="text-xs text-white/50">
                      Metric: {p.metric} • Trend: {p.trendPerHour.toFixed(2)} / hr • ETA: {new Date(p.predictedBy).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">{p.confidence}%</div>
                    <div className="text-white/50 text-xs">confidence</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
              </AccordionContent>
            </div>
          </AccordionItem>
        </Accordion>

        {/* Detailed Information (collapsible) */}
        <Accordion type="multiple" className="space-y-4">
          <AccordionItem value="detailed-info" className="border-none">
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl">
              <AccordionTrigger className="px-6">
                    <div className="flex items-center space-x-3">
                  <div className="p-3 bg-slate-500/20 rounded-xl">
                    <Settings className="w-6 h-6 text-slate-300" />
                      </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Detailed Information</h2>
                      </div>
              </AccordionTrigger>
              <AccordionContent className="px-0">
                <div className="px-6 pb-6">
                  <Tabs defaultValue="hardware">
                    <TabsList className="grid w-full grid-cols-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-1">
                      <TabsTrigger value="hardware" className="rounded-xl">{t.hardware}</TabsTrigger>
                      <TabsTrigger value="maintenance" className="rounded-xl">{t.maintenance}</TabsTrigger>
                    </TabsList>

            <TabsContent value="hardware" className="mt-6">
            {/* History UI removed as requested */}
              <HardwareManagement
                towerId={tower.id}
                components={hardwareComponents}
                onComponentsChange={setHardwareComponents}
              />
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-6 mt-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <History className="h-5 w-5 text-blue-400" />
                    <h3 className="text-lg font-bold text-white">{t.maintenanceHistory}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshMaintenanceData}
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Refresh
                  </Button>
                  </div>
                </div>
                
                {filteredMaintenance.length === 0 ? (
                  <div className="text-center py-8">
                    <Wrench className="h-12 w-12 text-white/30 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No maintenance records found</h3>
                    <p className="text-white/60 mb-4">This tower has no maintenance history yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Filters row styled like Hardware filters */}
                    <div className="flex gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
                        <Input
                          placeholder="Search by title, description, or technician..."
                          value={maintQuery}
                          onChange={(e) => setMaintQuery(e.target.value)}
                          className="pl-10 bg-white/5 border-white/10 text-white rounded-2xl"
                        />
                      </div>

                      <Select value={maintStatus} onValueChange={setMaintStatus}>
                        <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white rounded-2xl">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-black/90 backdrop-blur-2xl border-white/10 rounded-2xl">
                          <SelectItem value="ALL">All Statuses</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                          <SelectItem value="PLANNED">Planned</SelectItem>
                          <SelectItem value="OVERDUE">Overdue</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={maintType} onValueChange={setMaintType}>
                        <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white rounded-2xl">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent className="bg-black/90 backdrop-blur-2xl border-white/10 rounded-2xl">
                          <SelectItem value="ALL">All Types</SelectItem>
                          <SelectItem value="EMERGENCY">Emergency</SelectItem>
                          <SelectItem value="PREVENTIVE">Preventive</SelectItem>
                          <SelectItem value="ROUTINE">Routine</SelectItem>
                          <SelectItem value="INSPECTION">Inspection</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={maintPriority} onValueChange={setMaintPriority}>
                        <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white rounded-2xl">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent className="bg-black/90 backdrop-blur-2xl border-white/10 rounded-2xl">
                          <SelectItem value="ALL">All Priorities</SelectItem>
                          <SelectItem value="CRITICAL">Critical</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="LOW">Low</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input type="date" className="w-48 bg-white/5 border-white/10 text-white rounded-2xl" value={maintFrom} onChange={(e)=> setMaintFrom(e.target.value)} />
                      <Input type="date" className="w-48 bg-white/5 border-white/10 text-white rounded-2xl" value={maintTo} onChange={(e)=> setMaintTo(e.target.value)} />
                    </div>

                    {filteredMaintenance.map((record) => {
                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case "COMPLETED": return "bg-green-500"
                          case "IN_PROGRESS": return "bg-blue-500"
                          case "SCHEDULED": return "bg-yellow-500"
                          case "PLANNED": return "bg-purple-500"
                          case "CANCELLED": return "bg-red-500"
                          case "ON_HOLD": return "bg-orange-500"
                          case "OVERDUE": return "bg-red-600"
                          default: return "bg-gray-500"
                        }
                      }

                      const getPriorityColor = (priority: string) => {
                        switch (priority) {
                          case "CRITICAL": return "text-red-400"
                          case "HIGH": return "text-orange-400"
                          case "MEDIUM": return "text-yellow-400"
                          case "LOW": return "text-green-400"
                          default: return "text-gray-400"
                        }
                      }

                      return (
                        <div 
                          key={record.id} 
                          className="flex items-start space-x-4 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer"
                          onClick={() => openMaintenanceDetails(record)}
                        >
                          <div className={`w-3 h-3 ${getStatusColor(record.status)} rounded-full mt-2 shadow-glow`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-white">{record.title}</p>
                              <div className="flex items-center space-x-2">
                                <Badge className={`text-xs ${getPriorityColor(record.priority)}`}>
                                  {record.priority}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {record.type.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>
                            {record.description && (
                              <p className="text-sm text-white/60 mt-1">{record.description}</p>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-white/50">
                                {new Date(record.startDate).toLocaleDateString()}
                                {record.endDate && ` - ${new Date(record.endDate).toLocaleDateString()}`}
                                {record.technician && ` • ${record.technician}`}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-white/50">
                                {record.estimatedDurationHours && (
                                  <span className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {record.actualDurationHours || record.estimatedDurationHours}h
                                  </span>
                                )}
                                {(record.estimatedCost || record.actualCost) && (
                                  <span className="flex items-center">
                                    <DollarSign className="h-3 w-3 mr-1" />
                                    ${((record.actualCost || record.estimatedCost) || 0).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
              </AccordionContent>
            </div>
          </AccordionItem>
        </Accordion>

      </div>

      {/* Maintenance Details Modal */}
      {selectedMaintenance && (
        <Dialog open={isMaintenanceDetailsOpen} onOpenChange={setIsMaintenanceDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/5 backdrop-blur-2xl border border-white/10">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">
                Maintenance Details
              </DialogTitle>
            </DialogHeader>
            <MaintenanceDetails
              maintenance={selectedMaintenance}
              onEdit={() => {
                // TODO: Implement edit functionality
                console.log('Edit maintenance:', selectedMaintenance.id)
              }}
              onDelete={() => {
                // TODO: Implement delete functionality
                console.log('Delete maintenance:', selectedMaintenance.id)
              }}
              onStatusUpdate={handleMaintenanceStatusUpdate}
            />
          </DialogContent>
        </Dialog>
      )}
    </GlassMainLayout>
  )
}

export default function TowerDetailsPage() {
  return (
    <ProtectedRoute>
      <TowerDetailsContent />
    </ProtectedRoute>
  )
}
