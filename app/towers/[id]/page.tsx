"use client"

import { useState, useEffect } from "react"
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
  const [isLoading, setIsLoading] = useState(true)
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 3D Visualization */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Settings className="h-6 w-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">3D Tower Visualization</h2>
              </div>
              <Tower3DViewer tower={tower} />
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="space-y-6">
            <GlassMetricCard
              title="Battery Level"
              value={tower.battery || 0}
              unit="%"
              icon={Battery}
              status={getBatteryStatus(tower.battery || 0)}
              trend={(tower.battery || 0) > 50 ? "up" : "down"}
              trendValue={(tower.battery || 0) > 50 ? "+5% from yesterday" : "-12% from yesterday"}
              delay={0}
            />
            <GlassMetricCard
              title="Temperature"
              value={tower.temperature || 0}
              unit="°C"
              icon={Thermometer}
              status={getTemperatureStatus(tower.temperature || 0)}
              trend={(tower.temperature || 0) < 45 ? "down" : "up"}
              trendValue={(tower.temperature || 0) < 45 ? "-2°C from yesterday" : "+8°C from yesterday"}
              delay={1}
            />
            <GlassMetricCard
              title="Network Load"
              value={tower.networkLoad || 0}
              unit="%"
              icon={Wifi}
              status={(tower.networkLoad || 0) > 80 ? "warning" : "success"}
              trend="neutral"
              delay={2}
            />
            <GlassMetricCard
              title="Uptime"
              value={tower.uptime || 0}
              unit="%"
              icon={Activity}
              status="success"
              trend="up"
              trendValue="+0.2% this week"
              delay={3}
            />
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
                        <span className="text-white">{tower.battery}%</span>
                      </div>
                      <Progress value={tower.battery} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/80">Network Performance</span>
                        <span className="text-white">{100 - tower.networkLoad}%</span>
                      </div>
                      <Progress value={100 - tower.networkLoad} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/80">System Uptime</span>
                        <span className="text-white">{tower.uptime}%</span>
                      </div>
                      <Progress value={tower.uptime} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/80">Temperature Status</span>
                        <span className="text-white">{tower.temperature < 50 ? "Normal" : "High"}</span>
                      </div>
                      <Progress value={Math.min((tower.temperature / 60) * 100, 100)} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="telemetry" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Voltage Trends</h3>
                  <ChartContainer
                    config={{
                      voltage: {
                        label: "Voltage (V)",
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
                        <Line type="monotone" dataKey="voltage" stroke="var(--color-voltage)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

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
                <div className="flex items-center space-x-3 mb-6">
                  <History className="h-5 w-5 text-blue-400" />
                  <h3 className="text-lg font-bold text-white">Maintenance History</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-2 shadow-glow" />
                    <div className="flex-1">
                      <p className="font-medium text-white">Routine Maintenance Completed</p>
                      <p className="text-sm text-white/60 mt-1">
                        Battery replacement, sensor calibration, and software updates
                      </p>
                      <p className="text-xs text-white/50 mt-2">
                        {new Date(tower.lastMaintenance).toLocaleDateString()} • Technician: John Smith
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 shadow-glow" />
                    <div className="flex-1">
                      <p className="font-medium text-white">Emergency Repair</p>
                      <p className="text-sm text-white/60 mt-1">
                        Network module replacement due to connectivity issues
                      </p>
                      <p className="text-xs text-white/50 mt-2">2023-12-20 • Technician: Sarah Johnson</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2 shadow-glow" />
                    <div className="flex-1">
                      <p className="font-medium text-white">Scheduled Inspection</p>
                      <p className="text-sm text-white/60 mt-1">Quarterly safety and performance inspection</p>
                      <p className="text-xs text-white/50 mt-2">2023-12-01 • Technician: Mike Davis</p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-6 bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-2xl"
                >
                  Schedule Maintenance
                </Button>
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
