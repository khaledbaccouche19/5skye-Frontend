"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Wifi, Signal, Activity, Globe, BarChart3, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"
import { GlassMainLayout } from "@/components/layout/glass-main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CesiumGlobeWrapper } from "@/components/ui/cesium-globe-wrapper"
import { ApiClient } from "@/lib/api-client"

// Mock network data - will be filtered based on real tower data
const networkData = [
  {
    towerId: "TWR-001",
    towerName: "Tower Alpha",
    signalStrength: -65,
    interference: 12,
    packetLoss: 0.1,
    latency: 25,
    jitter: 5,
    bandwidth: 850,
    networkLoad: 65,
    connectionQuality: "Excellent",
    lastUpdated: "2024-01-16T10:30:00Z"
  },
  {
    towerId: "TWR-002",
    towerName: "Tower Beta",
    signalStrength: -72,
    interference: 18,
    packetLoss: 0.3,
    latency: 35,
    jitter: 8,
    bandwidth: 720,
    networkLoad: 82,
    connectionQuality: "Good",
    lastUpdated: "2024-01-16T10:30:00Z"
  },
  {
    towerId: "TWR-003",
    towerName: "Tower Gamma",
    signalStrength: -78,
    interference: 25,
    packetLoss: 0.8,
    latency: 52,
    jitter: 15,
    bandwidth: 580,
    networkLoad: 95,
    connectionQuality: "Poor",
    lastUpdated: "2024-01-16T10:30:00Z"
  },
  {
    towerId: "TWR-004",
    towerName: "Tower Delta",
    signalStrength: -58,
    interference: 8,
    packetLoss: 0.05,
    latency: 18,
    jitter: 3,
    bandwidth: 920,
    networkLoad: 45,
    connectionQuality: "Excellent",
    lastUpdated: "2024-01-16T10:30:00Z"
  },
  {
    towerId: "TWR-005",
    towerName: "Tower Echo",
    signalStrength: -68,
    interference: 15,
    packetLoss: 0.2,
    latency: 28,
    jitter: 6,
    bandwidth: 780,
    networkLoad: 72,
    connectionQuality: "Good",
    lastUpdated: "2024-01-16T10:30:00Z"
  }
]

export default function NetworkDashboard() {
  const router = useRouter()
  const [selectedQuality, setSelectedQuality] = useState("all")
  const [towers, setTowers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch real towers from backend
  useEffect(() => {
    const fetchTowers = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const towersData = await ApiClient.getTowers()
        console.log('Real towers fetched:', towersData)
        
        // Transform backend data to match globe expectations
        const transformedTowers = towersData.map((tower: any) => ({
          ...tower,
          location: {
            lat: tower.latitude || tower.location?.lat,
            lng: tower.longitude || tower.location?.lng,
            city: tower.city || tower.location?.city || 'Unknown Location'
          }
        }))
        
        setTowers(transformedTowers)
      } catch (err) {
        console.error('Failed to fetch towers:', err)
        setError('Failed to load towers')
        setTowers([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTowers()
  }, [])

  // Show all towers without filtering
  const filteredTowers = towers

  const filteredNetworkData = networkData.filter(item => {
    if (selectedQuality !== "all" && item.connectionQuality !== selectedQuality) return false
    return true
  })

  // Calculate network metrics based on filtered towers
  const totalTowers = filteredTowers.length
  const excellentQuality = filteredTowers.filter(n => n.status === "online").length
  const goodQuality = filteredTowers.filter(n => n.status === "warning").length
  const poorQuality = filteredTowers.filter(n => n.status === "critical").length

  // Use all network data for metrics
  const filteredNetworkDataForMetrics = networkData

  const avgSignalStrength = Math.round(filteredNetworkDataForMetrics.reduce((sum, n) => sum + n.signalStrength, 0) / Math.max(filteredNetworkDataForMetrics.length, 1))
  const avgLatency = Math.round(filteredNetworkDataForMetrics.reduce((sum, n) => sum + n.latency, 0) / Math.max(filteredNetworkDataForMetrics.length, 1))
  const avgPacketLoss = Math.round(filteredNetworkDataForMetrics.reduce((sum, n) => sum + n.packetLoss, 0) / Math.max(filteredNetworkDataForMetrics.length, 1) * 1000) / 10
  const avgBandwidth = Math.round(filteredNetworkDataForMetrics.reduce((sum, n) => sum + n.bandwidth, 0) / Math.max(filteredNetworkDataForMetrics.length, 1))

  const networkHealthScore = Math.round(
    (excellentQuality / Math.max(totalTowers, 1)) * 50 + 
    (goodQuality / Math.max(totalTowers, 1)) * 30 + 
    (poorQuality / Math.max(totalTowers, 1)) * 20
  )

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "Excellent": return "bg-green-500/20 text-green-300 border-green-500/30"
      case "Good": return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "Poor": return "bg-red-500/20 text-red-300 border-red-500/30"
      default: return "bg-slate-500/20 text-slate-300 border-slate-500/30"
    }
  }

  const getSignalColor = (signal: number) => {
    if (signal >= -60) return "text-green-400"
    if (signal >= -70) return "text-blue-400"
    if (signal >= -80) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <GlassMainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-50">Network Dashboard</h1>
            <p className="text-slate-300">Network quality, connectivity, and performance monitoring</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={selectedQuality} onValueChange={setSelectedQuality}>
              <SelectTrigger className="w-40 bg-slate-700/40 backdrop-blur-xl border-slate-500/40 text-white rounded-2xl">
                <SelectValue placeholder="Connection Quality" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800/95 backdrop-blur-2xl border-slate-500/50 rounded-2xl">
                <SelectItem value="all">All Qualities</SelectItem>
                <SelectItem value="Excellent">Excellent</SelectItem>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Poor">Poor</SelectItem>
              </SelectContent>
            </Select>

          </div>
        </div>

        {/* Interactive Network Globe */}
        <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
          <CardHeader>
            <CardTitle className="text-slate-50 flex items-center space-x-2">
              <Globe className="h-6 w-6 text-blue-400" />
              <span>Interactive Network Map</span>
            </CardTitle>
            <p className="text-slate-300 text-sm">
              Click on any tower to view detailed information and network performance
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] rounded-lg overflow-hidden">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-300">Loading towers...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                    <p className="text-slate-300 mb-2">Failed to load towers</p>
                    <p className="text-slate-400 text-sm">{error}</p>
                  </div>
                </div>
              ) : (
                <CesiumGlobeWrapper 
                  key={`globe-${towers.length}`}
                  towers={filteredTowers as any}
                  onTowerClick={(tower) => {
                    console.log('Tower clicked on network globe:', tower)
                    router.push(`/towers/${tower.id}`)
                  }}
                  className="h-full"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Network Health Score */}
        <Card className="bg-gradient-to-r from-blue-600/20 to-green-600/20 backdrop-blur-2xl border border-blue-500/40 shadow-glass-lg">
          <CardHeader>
            <CardTitle className="text-slate-50 flex items-center space-x-2">
              <Globe className="h-6 w-6 text-blue-400" />
              <span>Network Health Score</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-400 mb-4">{networkHealthScore}</div>
              <div className="text-slate-300 mb-4">out of 100</div>
              <Progress value={networkHealthScore} className="h-3 bg-slate-600/50" />
              <div className="mt-4 text-sm text-slate-400">
                {networkHealthScore >= 80 ? "Excellent Network Health" : 
                 networkHealthScore >= 60 ? "Good Network Health" : 
                 networkHealthScore >= 40 ? "Fair Network Health" : "Poor Network Health"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Network Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Connection Quality Distribution */}
          <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Connection Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-400">Excellent</span>
                  <span className="text-slate-50 font-bold">{excellentQuality}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-400">Good</span>
                  <span className="text-slate-50 font-bold">{goodQuality}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-400">Poor</span>
                  <span className="text-slate-50 font-bold">{poorQuality}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Signal Strength */}
          <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Avg Signal Strength</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-50 mb-2">{avgSignalStrength} dBm</div>
              <Progress value={Math.abs(avgSignalStrength) / 100 * 100} className="h-2 bg-slate-600/50 mb-2" />
              <div className="text-sm text-slate-400">
                {avgSignalStrength >= -60 ? "Excellent" : 
                 avgSignalStrength >= -70 ? "Good" : 
                 avgSignalStrength >= -80 ? "Fair" : "Poor"}
              </div>
            </CardContent>
          </Card>

          {/* Average Latency */}
          <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Avg Latency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-50 mb-2">{avgLatency} ms</div>
              <Progress value={Math.min(avgLatency / 100 * 100, 100)} className="h-2 bg-slate-600/50 mb-2" />
              <div className="text-sm text-slate-400">
                {avgLatency <= 20 ? "Excellent" : 
                 avgLatency <= 40 ? "Good" : 
                 avgLatency <= 60 ? "Fair" : "Poor"}
              </div>
            </CardContent>
          </Card>

          {/* Average Bandwidth */}
          <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Avg Bandwidth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-50 mb-2">{avgBandwidth} Mbps</div>
              <Progress value={avgBandwidth / 1000 * 100} className="h-2 bg-slate-600/50 mb-2" />
              <div className="text-sm text-slate-400">
                {avgBandwidth >= 800 ? "Excellent" : 
                 avgBandwidth >= 600 ? "Good" : 
                 avgBandwidth >= 400 ? "Fair" : "Poor"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Network Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Signal Strength by Tower */}
          <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
            <CardHeader>
              <CardTitle className="text-slate-50">Signal Strength by Tower</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {networkData.map((network) => (
                <div 
                  key={network.towerId} 
                  className="flex items-center justify-between p-3 bg-slate-600/20 rounded-lg cursor-pointer hover:bg-slate-500/30 transition-colors duration-200"
                  onClick={() => {
                    // Find the corresponding tower in real towers and navigate to it
                    const tower = towers.find((t: any) => t.id === network.towerId)
                    if (tower) {
                      router.push(`/towers/${tower.id}`)
                    }
                  }}
                >
                  <div>
                    <div className="font-medium text-slate-50">{network.towerName}</div>
                    <div className="text-sm text-slate-400">{network.connectionQuality}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${getSignalColor(network.signalStrength)}`}>
                      {network.signalStrength} dBm
                    </div>
                    <div className="text-sm text-slate-400">
                      {network.interference} dB interference
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Network Performance Metrics */}
          <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
            <CardHeader>
              <CardTitle className="text-slate-50">Network Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Packet Loss:</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={Math.max(100 - avgPacketLoss * 10, 0)} className="w-20 h-2 bg-slate-600/50" />
                    <span className="text-slate-50 font-medium w-16 text-right">{avgPacketLoss}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Jitter:</span>
                  <div className="flex justify-between items-center">
                    <Progress value={Math.max(100 - (networkData.reduce((sum, n) => sum + n.jitter, 0) / totalTowers) * 5, 0)} className="w-20 h-2 bg-slate-600/50" />
                    <span className="text-slate-50 font-medium w-16 text-right">
                      {Math.round(networkData.reduce((sum, n) => sum + n.jitter, 0) / totalTowers)} ms
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Network Load:</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={networkData.reduce((sum, n) => sum + n.networkLoad, 0) / totalTowers} className="w-20 h-2 bg-slate-600/50" />
                    <span className="text-slate-50 font-medium w-16 text-right">
                      {Math.round(networkData.reduce((sum, n) => sum + n.networkLoad, 0) / totalTowers)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Network Issues & Alerts */}
        <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
          <CardHeader>
            <CardTitle className="text-slate-50 flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <span>Network Issues & Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {networkData
                .filter(network => network.connectionQuality === "Poor" || network.packetLoss > 0.5 || network.latency > 50)
                .map(network => {
                  const issues = []
                  if (network.connectionQuality === "Poor") issues.push("Poor connection quality")
                  if (network.packetLoss > 0.5) issues.push(`High packet loss: ${network.packetLoss}%`)
                  if (network.latency > 50) issues.push(`High latency: ${network.latency}ms`)
                  
                  return (
                    <div 
                      key={network.towerId} 
                      className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30 rounded-lg cursor-pointer hover:bg-red-500/20 transition-colors duration-200"
                      onClick={() => {
                        // Find the corresponding tower in real towers and navigate to it
                        const tower = towers.find((t: any) => t.id === network.towerId)
                        if (tower) {
                          router.push(`/towers/${tower.id}`)
                        }
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                        <div>
                          <div className="font-medium text-slate-50">{network.towerName}</div>
                          <div className="text-sm text-red-400">{issues.join(", ")}</div>
                        </div>
                      </div>
                      <Badge variant="destructive">Network Issue</Badge>
                    </div>
                  )
                })}
              {networkData.filter(network => network.connectionQuality === "Poor" || network.packetLoss > 0.5 || network.latency > 50).length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-400" />
                  <p>No network issues detected</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Network Data Table */}
        <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
          <CardHeader>
            <CardTitle className="text-slate-50">Network Performance Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left p-2 text-slate-300">Tower</th>
                    <th className="text-left p-2 text-slate-300">Signal (dBm)</th>
                    <th className="text-left p-2 text-slate-300">Interference (dB)</th>
                    <th className="text-left p-2 text-slate-300">Packet Loss (%)</th>
                    <th className="text-left p-2 text-slate-300">Latency (ms)</th>
                    <th className="text-left p-2 text-slate-300">Jitter (ms)</th>
                    <th className="text-left p-2 text-slate-300">Bandwidth (Mbps)</th>
                    <th className="text-left p-2 text-slate-300">Quality</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNetworkDataForMetrics.map((network) => (
                    <tr 
                      key={network.towerId} 
                      className="border-b border-slate-600/50 cursor-pointer hover:bg-slate-600/20 transition-colors duration-200"
                      onClick={() => {
                        // Find the corresponding tower in real towers and navigate to it
                        const tower = towers.find((t: any) => t.id === network.towerId)
                        if (tower) {
                          router.push(`/towers/${tower.id}`)
                        }
                      }}
                    >
                      <td className="p-2 font-medium text-slate-50">{network.towerName}</td>
                      <td className={`p-2 font-bold ${getSignalColor(network.signalStrength)}`}>
                        {network.signalStrength}
                      </td>
                      <td className="p-2 text-slate-300">{network.interference}</td>
                      <td className="p-2 text-slate-300">{network.packetLoss}</td>
                      <td className="p-2 text-slate-300">{network.latency}</td>
                      <td className="p-2 text-slate-300">{network.jitter}</td>
                      <td className="p-2 text-slate-300">{network.bandwidth}</td>
                      <td className="p-2">
                        <Badge className={getQualityColor(network.connectionQuality)}>
                          {network.connectionQuality}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </GlassMainLayout>
  )
}
