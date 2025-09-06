"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Battery,
  Thermometer,
  Wifi,
  Activity,
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
} from "lucide-react"
import { GlassMainLayout } from "@/components/layout/glass-main-layout"
import { GlassMetricCard } from "@/components/ui/glass-metric-card"
import { AlertItem } from "@/components/ui/alert-item"
import { HardwareManagement } from "@/components/ui/hardware-management"
import { AlertThresholds } from "@/components/ui/alert-thresholds"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Tower3DViewer } from "@/components/ui/tower-3d-viewer"
import { ConnectionStatusBadge, getTowerDataSource, isTowerConnected } from "@/components/ui/connection-status-badge"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useTowers } from "@/lib/towers-context"
import { ApiClient } from "@/lib/api-client"
import { cn } from "@/lib/utils"

function TowerDetailsContent() {
  const params = useParams()
  const router = useRouter()
  const { getTowerById } = useTowers()
  const towerId = params.id as string

  const [tower, setTower] = useState<any>(null)
  const [hardwareComponents, setHardwareComponents] = useState<any[]>([])
  const [alertThresholds, setAlertThresholds] = useState<any[]>([])
  const [towerAlerts, setTowerAlerts] = useState<any[]>([])
  const [telemetryData, setTelemetryData] = useState<any[]>([])
  const [liveTelemetryData, setLiveTelemetryData] = useState<any>(null)
  const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshingTelemetry, setIsRefreshingTelemetry] = useState(false)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch tower data from real API
  useEffect(() => {
    const fetchTowerData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch tower details
        const towerData = await ApiClient.getTowerById(towerId)
        console.log('Tower details received:', towerData)
        setTower(towerData)

        // Fetch hardware components
        const hardwareData = await ApiClient.getHardwareByTower(towerId)
        setHardwareComponents(hardwareData)

        // Fetch alert thresholds
        const thresholdsData = await ApiClient.getThresholdsByTower(towerId)
        setAlertThresholds(thresholdsData)

        // Fetch telemetry data
        const telemetryData = await ApiClient.getTelemetryByTower(towerId)
        setTelemetryData(telemetryData)

        // Fetch maintenance records
        const maintenanceData = await ApiClient.getMaintenanceByTowerId(towerId)
        setMaintenanceRecords(maintenanceData)

        // Fetch live telemetry data if API endpoint is configured
        if (towerData.apiEndpointUrl) {
          try {
            const liveData = await ApiClient.fetchTelemetryData(towerData.apiEndpointUrl, towerData.apiKey)
            setLiveTelemetryData(liveData)
            console.log('✅ Live telemetry data fetched:', liveData)
          } catch (liveError) {
            console.warn('⚠️ Failed to fetch live telemetry data:', liveError)
            // Don't set error state for live data failures, just log it
          }
        }

        // For now, keep alerts as dummy data since we need to filter by tower
        // TODO: Add API endpoint for tower-specific alerts
        setTowerAlerts([
          {
            id: "ALT-001",
            timestamp: "2024-01-16T10:30:00Z",
            message: "Battery level critically low",
            severity: "critical",
            towerId: towerId,
            towerName: towerData?.name || "Unknown Tower",
            resolved: false,
          },
          {
            id: "ALT-002",
            timestamp: "2024-01-16T09:15:00Z",
            message: "High network load detected",
            severity: "warning",
            towerId: towerId,
            towerName: towerData?.name || "Unknown Tower",
            resolved: false,
          },
        ])

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
          setAlertThresholds([
            {
              id: "THRESH-001",
              name: "High Temperature Alert",
              metric: "temperature" as const,
              condition: "greater_than" as const,
              value: 50,
              severity: "critical" as const,
              enabled: true,
              description: "Alert when temperature exceeds 50°C",
            },
            {
              id: "THRESH-002",
              name: "Low Battery Warning",
              metric: "battery" as const,
              condition: "less_than" as const,
              value: 20,
              severity: "warning" as const,
              enabled: true,
              description: "Warning when battery drops below 20%",
            },
          ])
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
    if (!tower?.apiEndpointUrl) {
      console.warn('No API endpoint configured for this tower')
      return
    }

    setIsRefreshingTelemetry(true)
    try {
      const liveData = await ApiClient.fetchTelemetryData(tower.apiEndpointUrl, tower.apiKey)
      setLiveTelemetryData(liveData)
      console.log('✅ Telemetry data refreshed:', liveData)
    } catch (error) {
      console.error('❌ Failed to refresh telemetry data:', error)
    } finally {
      setIsRefreshingTelemetry(false)
    }
  }, [tower?.apiEndpointUrl, tower?.apiKey])

  // Auto-refresh telemetry data every 30 seconds
  useEffect(() => {
    if (!autoRefreshEnabled || !tower?.apiEndpointUrl) return

    const interval = setInterval(() => {
      refreshTelemetryData()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [autoRefreshEnabled, tower?.apiEndpointUrl, refreshTelemetryData])

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
    if (battery > 50) return "success"
    if (battery > 20) return "warning"
    return "error"
  }

  const getTemperatureStatus = (temp: number) => {
    if (temp < 45) return "success"
    if (temp < 55) return "warning"
    return "error"
  }


  // Get the current telemetry values (live data takes precedence over static data)
  const getCurrentTelemetryValue = (field: string) => {
    if (liveTelemetryData) {
      // Handle array data structure (take the first/latest entry)
      const data = Array.isArray(liveTelemetryData) ? liveTelemetryData[0] : liveTelemetryData
      if (data && data[field] !== null && data[field] !== undefined) {
        return data[field]
      }
    }
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
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
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
              Export Data
            </Button>
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl"
              onClick={() => router.push(`/towers/${towerId}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Tower
            </Button>
          </div>
        </div>

        {/* 3D Visualization */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <Settings className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">3D Tower Visualization</h2>
          </div>
          <div className="h-[600px] w-full">
            <Tower3DViewer tower={tower} />
          </div>
        </div>

        {/* Live Metrics Section */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <h3 className="text-2xl font-bold text-white">Live Metrics</h3>
              {liveTelemetryData && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-green-400">Live Data</span>
                </div>
              )}
            </div>
            {tower?.apiEndpointUrl && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshTelemetryData}
                  disabled={isRefreshingTelemetry}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  {isRefreshingTelemetry ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  ) : (
                    <Activity className="h-4 w-4 mr-2" />
                  )}
                  {isRefreshingTelemetry ? "Refreshing..." : "Refresh"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                  className={`bg-white/5 border-white/10 text-white hover:bg-white/10 ${
                    autoRefreshEnabled ? 'bg-green-500/20 border-green-500/30' : ''
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    autoRefreshEnabled ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                  }`} />
                  Auto
                </Button>
              </div>
            )}
          </div>
          
          <div className="space-y-8">
            {/* System Health Metrics - 2x2 Grid */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white/90 uppercase tracking-wide">System Health</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <GlassMetricCard
                  title="Battery Level"
                  value={getCurrentTelemetryValue('battery')}
                  unit="%"
                  icon={Battery}
                  status={getBatteryStatus(getCurrentTelemetryValue('battery'))}
                  trend={getCurrentTelemetryValue('battery') > 50 ? "up" : "down"}
                  trendValue={getCurrentTelemetryValue('battery') > 50 ? "+5% from yesterday" : "-12% from yesterday"}
                  delay={0}
                />
                <GlassMetricCard
                  title="Temperature"
                  value={getCurrentTelemetryValue('temperature')}
                  unit="°C"
                  icon={Thermometer}
                  status={getTemperatureStatus(getCurrentTelemetryValue('temperature'))}
                  trend={getCurrentTelemetryValue('temperature') < 45 ? "down" : "up"}
                  trendValue={getCurrentTelemetryValue('temperature') < 45 ? "-2°C from yesterday" : "+8°C from yesterday"}
                  delay={1}
                />
                <GlassMetricCard
                  title="Network Load"
                  value={getCurrentTelemetryValue('networkLoad')}
                  unit="%"
                  icon={Wifi}
                  status={getCurrentTelemetryValue('networkLoad') > 80 ? "warning" : "success"}
                  trend="neutral"
                  delay={2}
                />
                <GlassMetricCard
                  title="Uptime"
                  value={getCurrentTelemetryValue('uptime')}
                  unit="%"
                  icon={Activity}
                  status="success"
                  trend="up"
                  trendValue="+0.2% this week"
                  delay={3}
                />
              </div>
            </div>
            
            {/* Environmental Metrics - 2x2 Grid */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white/90 uppercase tracking-wide">Environmental</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <GlassMetricCard
                  title="Humidity"
                  value={getCurrentTelemetryValue('humidity')}
                  unit="%"
                  icon={Droplets}
                  status={getCurrentTelemetryValue('humidity') > 80 ? "warning" : "success"}
                  trend="neutral"
                  delay={4}
                />
                <GlassMetricCard
                  title="Wind Speed"
                  value={getCurrentTelemetryValue('windSpeed')}
                  unit="m/s"
                  icon={Wind}
                  status={getCurrentTelemetryValue('windSpeed') > 15 ? "warning" : "success"}
                  trend="neutral"
                  delay={5}
                />
                <GlassMetricCard
                  title="Air Quality"
                  value={getCurrentTelemetryValue('airQuality')}
                  unit=""
                  icon={Gauge}
                  status={getCurrentTelemetryValue('airQuality') > 100 ? "warning" : "success"}
                  trend="neutral"
                  delay={6}
                />
                <GlassMetricCard
                  title="Signal Strength"
                  value={getCurrentTelemetryValue('signalStrength')}
                  unit="dBm"
                  icon={Signal}
                  status={getCurrentTelemetryValue('signalStrength') > -70 ? "success" : "warning"}
                  trend="neutral"
                  delay={7}
                />
              </div>
            </div>
            
            {/* Network Performance Metrics - 2x2 Grid */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white/90 uppercase tracking-wide">Network Performance</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <GlassMetricCard
                  title="Latency"
                  value={getCurrentTelemetryValue('latency')}
                  unit="ms"
                  icon={Clock}
                  status={getCurrentTelemetryValue('latency') > 50 ? "warning" : "success"}
                  trend="neutral"
                  delay={8}
                />
                <GlassMetricCard
                  title="Bandwidth"
                  value={getCurrentTelemetryValue('bandwidth')}
                  unit="Mbps"
                  icon={Zap}
                  status="success"
                  trend="neutral"
                  delay={9}
                />
                <GlassMetricCard
                  title="Packet Loss"
                  value={getCurrentTelemetryValue('packetLoss')}
                  unit="%"
                  icon={Activity}
                  status={getCurrentTelemetryValue('packetLoss') > 5 ? "warning" : "success"}
                  trend="neutral"
                  delay={10}
                />
                <GlassMetricCard
                  title="Jitter"
                  value={getCurrentTelemetryValue('jitter')}
                  unit="ms"
                  icon={Wifi}
                  status={getCurrentTelemetryValue('jitter') > 10 ? "warning" : "success"}
                  trend="neutral"
                  delay={11}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Detailed Information</h2>

          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-1">
              <TabsTrigger value="overview" className="rounded-xl">
                Overview
              </TabsTrigger>
              <TabsTrigger value="telemetry" className="rounded-xl">
                Telemetry
              </TabsTrigger>
              <TabsTrigger value="hardware" className="rounded-xl">
                Hardware
              </TabsTrigger>
              <TabsTrigger value="thresholds" className="rounded-xl">
                Thresholds
              </TabsTrigger>
              <TabsTrigger value="alerts" className="rounded-xl">
                Alerts
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="rounded-xl">
                Maintenance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Location & Basic Info */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Location & Configuration</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-white/60">Tower ID:</span>
                      <p className="text-white">{tower.id}</p>
                    </div>
                    <div>
                      <span className="font-medium text-white/60">Region:</span>
                      <p className="text-white">{tower.region || "N/A"}</p>
                    </div>
                    <div>
                      <span className="font-medium text-white/60">Latitude:</span>
                      <p className="text-white">{tower.latitude || "N/A"}°</p>
                    </div>
                    <div>
                      <span className="font-medium text-white/60">Longitude:</span>
                      <p className="text-white">{tower.longitude || "N/A"}°</p>
                    </div>
                    <div>
                      <span className="font-medium text-white/60">Use Case:</span>
                      <p className="text-white">{tower.useCase}</p>
                    </div>
                    <div>
                      <span className="font-medium text-white/60">Last Maintenance:</span>
                      <p className="text-white">{new Date(tower.lastMaintenance).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Performance Summary */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Performance Summary</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/80">Battery Health</span>
                        <span className="text-white">{getCurrentTelemetryValue('battery')}%</span>
                      </div>
                      <Progress value={getCurrentTelemetryValue('battery')} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/80">Network Performance</span>
                        <span className="text-white">{100 - getCurrentTelemetryValue('networkLoad')}%</span>
                      </div>
                      <Progress value={100 - getCurrentTelemetryValue('networkLoad')} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/80">System Uptime</span>
                        <span className="text-white">{getCurrentTelemetryValue('uptime')}%</span>
                      </div>
                      <Progress value={getCurrentTelemetryValue('uptime')} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/80">Temperature Status</span>
                        <span className="text-white">{getCurrentTelemetryValue('temperature') < 50 ? "Normal" : "High"}</span>
                      </div>
                      <Progress value={Math.min((getCurrentTelemetryValue('temperature') / 60) * 100, 100)} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/80">Signal Strength</span>
                        <span className="text-white">{getCurrentTelemetryValue('signalStrength')} dBm</span>
                      </div>
                      <Progress value={Math.max(0, Math.min((getCurrentTelemetryValue('signalStrength') + 100) / 50 * 100, 100))} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/80">Air Quality</span>
                        <span className="text-white">{getCurrentTelemetryValue('airQuality')}</span>
                      </div>
                      <Progress value={Math.min(getCurrentTelemetryValue('airQuality'), 100)} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="telemetry" className="space-y-6 mt-6">
              {/* Live Telemetry Data Display */}
              {getLatestTelemetryData() && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Live Telemetry Data</h3>
                  <div className="overflow-x-auto">
                    <pre className="bg-white/10 border border-white/20 rounded-lg p-4 text-white text-sm max-h-64 overflow-y-auto">
                      {JSON.stringify(getLatestTelemetryData(), null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Temperature Trends</h3>
                  <ChartContainer
                    config={{
                      temperature: {
                        label: "Temperature (°C)",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-64"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={telemetryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="temperature" stroke="var(--color-temperature)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Network Load Trends</h3>
                  <ChartContainer
                    config={{
                      networkLoad: {
                        label: "Network Load (%)",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-64"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={telemetryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="bandwidth" stroke="var(--color-networkLoad)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="hardware" className="mt-6">
              <HardwareManagement
                towerId={tower.id}
                components={hardwareComponents}
                onComponentsChange={setHardwareComponents}
              />
            </TabsContent>

            <TabsContent value="thresholds" className="mt-6">
              <AlertThresholds
                towerId={tower.id}
                thresholds={alertThresholds}
                onThresholdsChange={setAlertThresholds}
              />
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4 mt-6">
              {towerAlerts.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-white/40 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No alerts for this tower</h3>
                  <p className="text-white/60">This tower is operating normally with no active alerts.</p>
                </div>
              ) : (
                towerAlerts.map((alert) => <AlertItem key={alert.id} alert={alert} />)
              )}
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-6 mt-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <History className="h-5 w-5 text-blue-400" />
                    <h3 className="text-lg font-bold text-white">Maintenance History</h3>
                  </div>
                  <Button
                    onClick={() => router.push('/maintenance')}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Maintenance
                  </Button>
                </div>
                
                {maintenanceRecords.length === 0 ? (
                  <div className="text-center py-8">
                    <Wrench className="h-12 w-12 text-white/30 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No maintenance records found</h3>
                    <p className="text-white/60 mb-4">This tower has no maintenance history yet.</p>
                    <Button
                      onClick={() => router.push('/maintenance')}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule First Maintenance
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {maintenanceRecords.map((record) => {
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
                        <div key={record.id} className="flex items-start space-x-4 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
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
      </div>
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
