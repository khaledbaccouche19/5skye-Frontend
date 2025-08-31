"use client"

import { useState } from "react"
import { BarChart3, Download, RefreshCw, Battery, Thermometer, Wifi, Activity, Gauge, Wind, Droplets, Zap, Cpu, HardDrive, Signal, Clock, AlertTriangle } from "lucide-react"
import { GlassMainLayout } from "@/components/layout/glass-main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Bar, BarChart, Area, AreaChart } from "recharts"
import { dummyTelemetryData, dummyTowers } from "@/lib/dummy-data"

// Enhanced telemetry data with AI-ready metrics
const enhancedTelemetryData = [
  { 
    time: "00:00", 
    voltage: 12.4, 
    temperature: 42, 
    bandwidth: 65,
    battery: 87,
    uptime: 99.2,
    networkLoad: 65,
    responseTime: 45,
    throughput: 850,
    ambientTemperature: 25,
    humidity: 60,
    windSpeed: 15,
    airQuality: 85,
    vibration: 0.2,
    cpuUtilization: 45,
    memoryUsage: 78,
    diskSpace: 65,
    errorRate: 0.02,
    signalStrength: -65,
    interference: 12,
    packetLoss: 0.1,
    latency: 25,
    jitter: 5
  },
  { 
    time: "04:00", 
    voltage: 12.1, 
    temperature: 38, 
    bandwidth: 45,
    battery: 85,
    uptime: 99.1,
    networkLoad: 58,
    responseTime: 42,
    throughput: 720,
    ambientTemperature: 22,
    humidity: 65,
    windSpeed: 12,
    airQuality: 88,
    vibration: 0.15,
    cpuUtilization: 38,
    memoryUsage: 72,
    diskSpace: 66,
    errorRate: 0.01,
    signalStrength: -68,
    interference: 8,
    packetLoss: 0.05,
    latency: 22,
    jitter: 3
  },
  { 
    time: "08:00", 
    voltage: 12.3, 
    temperature: 44, 
    bandwidth: 78,
    battery: 83,
    uptime: 99.0,
    networkLoad: 72,
    responseTime: 48,
    throughput: 920,
    ambientTemperature: 28,
    humidity: 55,
    windSpeed: 18,
    airQuality: 82,
    vibration: 0.25,
    cpuUtilization: 52,
    memoryUsage: 81,
    diskSpace: 64,
    errorRate: 0.03,
    signalStrength: -62,
    interference: 15,
    packetLoss: 0.12,
    latency: 28,
    jitter: 6
  },
  { 
    time: "12:00", 
    voltage: 12.0, 
    temperature: 48, 
    bandwidth: 89,
    battery: 80,
    uptime: 98.9,
    networkLoad: 85,
    responseTime: 52,
    throughput: 1100,
    ambientTemperature: 32,
    humidity: 48,
    windSpeed: 22,
    airQuality: 78,
    vibration: 0.3,
    cpuUtilization: 68,
    memoryUsage: 89,
    diskSpace: 63,
    errorRate: 0.05,
    signalStrength: -58,
    interference: 20,
    packetLoss: 0.18,
    latency: 35,
    jitter: 8
  },
  { 
    time: "16:00", 
    voltage: 11.8, 
    temperature: 52, 
    bandwidth: 92,
    battery: 77,
    uptime: 98.8,
    networkLoad: 92,
    responseTime: 58,
    throughput: 1250,
    ambientTemperature: 35,
    humidity: 42,
    windSpeed: 25,
    airQuality: 75,
    vibration: 0.35,
    cpuUtilization: 78,
    memoryUsage: 92,
    diskSpace: 62,
    errorRate: 0.08,
    signalStrength: -55,
    interference: 25,
    packetLoss: 0.25,
    latency: 42,
    jitter: 12
  },
  { 
    time: "20:00", 
    voltage: 11.9, 
    temperature: 46, 
    bandwidth: 71,
    battery: 79,
    uptime: 98.9,
    networkLoad: 78,
    responseTime: 49,
    throughput: 950,
    ambientTemperature: 29,
    humidity: 52,
    windSpeed: 19,
    airQuality: 80,
    vibration: 0.28,
    cpuUtilization: 58,
    memoryUsage: 84,
    diskSpace: 63,
    errorRate: 0.04,
    signalStrength: -60,
    interference: 18,
    packetLoss: 0.15,
    latency: 30,
    jitter: 7
  },
]

export default function TelemetryPage() {
  const [selectedTower, setSelectedTower] = useState("all")
  const [timeRange, setTimeRange] = useState("24h")
  const [isLive, setIsLive] = useState(true)
  const [selectedMetrics, setSelectedMetrics] = useState("environmental") // Changed default to environmental
  
  // Debug logging
  console.log('Current selectedMetrics:', selectedMetrics)
  console.log('Should show environmental:', selectedMetrics === "environmental")

  return (
    <GlassMainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-50">AI-Ready Telemetry Metrics</h1>
            <p className="text-slate-300">Comprehensive monitoring for AI analysis and predictive maintenance</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant={isLive ? "default" : "outline"} 
              size="sm" 
              onClick={() => setIsLive(!isLive)}
              className={isLive ? "bg-slate-600 hover:bg-slate-500" : "bg-slate-700/40 border-slate-500/40 hover:bg-slate-600/50"}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLive ? "animate-spin" : ""}`} />
              {isLive ? "Live" : "Paused"}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-slate-700/40 border-slate-500/40 hover:bg-slate-600/50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <Select value={selectedTower} onValueChange={setSelectedTower}>
            <SelectTrigger className="w-48 bg-slate-700/40 backdrop-blur-xl border-slate-500/40 text-white rounded-2xl">
              <SelectValue placeholder="Select Tower" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800/95 backdrop-blur-2xl border-slate-500/50 rounded-2xl">
              <SelectItem value="all">All Towers</SelectItem>
              {dummyTowers.map((tower) => (
                <SelectItem key={tower.id} value={tower.id}>
                  {tower.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-slate-700/40 backdrop-blur-xl border-slate-500/40 text-white rounded-2xl">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800/95 backdrop-blur-2xl border-slate-500/50 rounded-2xl">
              <SelectItem value="1h">1 Hour</SelectItem>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedMetrics} onValueChange={setSelectedMetrics}>
            <SelectTrigger className="w-40 bg-slate-700/40 backdrop-blur-xl border-slate-500/40 text-white rounded-2xl">
              <SelectValue placeholder="Metric Category" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800/95 backdrop-blur-2xl border-slate-500/50 rounded-2xl">
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="environmental">Environmental</SelectItem>
              <SelectItem value="system">System Health</SelectItem>
              <SelectItem value="network">Network Quality</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Performance Metrics Section */}
        {selectedMetrics === "performance" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-50 flex items-center space-x-2">
              <Activity className="h-6 w-6 text-blue-400" />
              <span>Performance Metrics</span>
            </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Battery & Uptime */}
          <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-slate-50">
                    <Battery className="h-5 w-5 text-green-400" />
                    <span>Battery & Uptime</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-200">
              <ChartContainer
                config={{
                      battery: { label: "Battery (%)", color: "hsl(var(--chart-1))" },
                      uptime: { label: "Uptime (%)", color: "hsl(var(--chart-2))" },
                }}
                className="h-64"
              >
                <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={enhancedTelemetryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="battery" stroke="var(--color-battery)" fill="var(--color-battery)" fillOpacity={0.3} />
                        <Area type="monotone" dataKey="uptime" stroke="var(--color-uptime)" fill="var(--color-uptime)" fillOpacity={0.3} />
                      </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

              {/* Temperature & Response Time */}
          <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-slate-50">
                    <Thermometer className="h-5 w-5 text-red-400" />
                    <span>Temperature & Response Time</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-200">
              <ChartContainer
                config={{
                      temperature: { label: "Temperature (°C)", color: "hsl(var(--chart-3))" },
                      responseTime: { label: "Response Time (ms)", color: "hsl(var(--chart-4))" },
                }}
                className="h-64"
              >
                <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={enhancedTelemetryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="temperature" stroke="var(--color-temperature)" strokeWidth={2} />
                        <Line type="monotone" dataKey="responseTime" stroke="var(--color-responseTime)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

              {/* Network Load & Throughput */}
          <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-slate-50">
                    <Wifi className="h-5 w-5 text-blue-400" />
                    <span>Network Load & Throughput</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-200">
              <ChartContainer
                config={{
                      networkLoad: { label: "Network Load (%)", color: "hsl(var(--chart-5))" },
                      throughput: { label: "Throughput (Mbps)", color: "hsl(var(--chart-6))" },
                }}
                className="h-64"
              >
                <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={enhancedTelemetryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="networkLoad" stroke="var(--color-networkLoad)" strokeWidth={2} />
                        <Line type="monotone" dataKey="throughput" stroke="var(--color-throughput)" strokeWidth={2} />
                      </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

              {/* Voltage & Bandwidth */}
          <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-slate-50">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    <span>Voltage & Bandwidth</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-200">
              <ChartContainer
                config={{
                      voltage: { label: "Voltage (V)", color: "hsl(var(--chart-7))" },
                      bandwidth: { label: "Bandwidth (%)", color: "hsl(var(--chart-8))" },
                }}
                className="h-64"
              >
                <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={enhancedTelemetryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="voltage" stroke="var(--color-voltage)" strokeWidth={2} />
                        <Line type="monotone" dataKey="bandwidth" stroke="var(--color-bandwidth)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Environmental Metrics Section */}
        {selectedMetrics === "environmental" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-50 flex items-center space-x-2">
              <Wind className="h-6 w-6 text-green-400" />
              <span>Environmental Metrics</span>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ambient Temperature & Humidity */}
              <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-slate-50">
                    <Thermometer className="h-5 w-5 text-blue-400" />
                    <span>Ambient Conditions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-slate-200">
                  <ChartContainer
                    config={{
                      ambientTemperature: { label: "Ambient Temp (°C)", color: "hsl(var(--chart-1))" },
                      humidity: { label: "Humidity (%)", color: "hsl(var(--chart-2))" },
                    }}
                    className="h-64"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={enhancedTelemetryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="ambientTemperature" stroke="var(--color-ambientTemperature)" fill="var(--color-ambientTemperature)" fillOpacity={0.3} />
                        <Area type="monotone" dataKey="humidity" stroke="var(--color-humidity)" fill="var(--color-humidity)" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Wind Speed & Air Quality */}
              <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-slate-50">
                    <Wind className="h-5 w-5 text-cyan-400" />
                    <span>Wind & Air Quality</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-slate-200">
                  <ChartContainer
                    config={{
                      windSpeed: { label: "Wind Speed (km/h)", color: "hsl(var(--chart-3))" },
                      airQuality: { label: "Air Quality Index", color: "hsl(var(--chart-4))" },
                    }}
                    className="h-64"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={enhancedTelemetryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="windSpeed" stroke="var(--color-windSpeed)" strokeWidth={2} />
                        <Line type="monotone" dataKey="airQuality" stroke="var(--color-airQuality)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Vibration & Equipment Temperature */}
              <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-slate-50">
                    <Gauge className="h-5 w-5 text-purple-400" />
                    <span>Vibration & Equipment Temp</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-slate-200">
                  <ChartContainer
                    config={{
                      vibration: { label: "Vibration (g)", color: "hsl(var(--chart-5))" },
                      temperature: { label: "Equipment Temp (°C)", color: "hsl(var(--chart-6))" },
                    }}
                    className="h-64"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={enhancedTelemetryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="vibration" stroke="var(--color-vibration)" strokeWidth={2} />
                    <Line type="monotone" dataKey="temperature" stroke="var(--color-temperature)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
          </div>
        )}

        {/* System Health Metrics Section */}
        {selectedMetrics === "system" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-50 flex items-center space-x-2">
              <Activity className="h-6 w-6 text-orange-400" />
              <span>System Health Metrics</span>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CPU & Memory Usage */}
              <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-slate-50">
                    <Cpu className="h-5 w-5 text-red-400" />
                    <span>CPU & Memory Usage</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-slate-200">
                  <ChartContainer
                    config={{
                      cpuUtilization: { label: "CPU (%)", color: "hsl(var(--chart-1))" },
                      memoryUsage: { label: "Memory (%)", color: "hsl(var(--chart-2))" },
                    }}
                    className="h-64"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={enhancedTelemetryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="cpuUtilization" stroke="var(--color-cpuUtilization)" fill="var(--color-cpuUtilization)" fillOpacity={0.3} />
                        <Area type="monotone" dataKey="memoryUsage" stroke="var(--color-memoryUsage)" fill="var(--color-memoryUsage)" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Disk Space & Error Rate */}
              <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-slate-50">
                    <HardDrive className="h-5 w-5 text-yellow-400" />
                    <span>Storage & Error Rate</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-slate-200">
                  <ChartContainer
                    config={{
                      diskSpace: { label: "Disk Space (%)", color: "hsl(var(--chart-3))" },
                      errorRate: { label: "Error Rate (%)", color: "hsl(var(--chart-4))" },
                    }}
                    className="h-64"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={enhancedTelemetryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="diskSpace" stroke="var(--color-diskSpace)" strokeWidth={2} />
                        <Line type="monotone" dataKey="errorRate" stroke="var(--color-errorRate)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Network Quality Metrics Section */}
        {selectedMetrics === "network" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-50 flex items-center space-x-2">
              <Signal className="h-6 w-6 text-blue-400" />
              <span>Network Quality Metrics</span>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Signal Strength & Interference */}
              <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-slate-50">
                    <Signal className="h-5 w-5 text-green-400" />
                    <span>Signal Quality</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-slate-200">
                  <ChartContainer
                    config={{
                      signalStrength: { label: "Signal (dBm)", color: "hsl(var(--chart-1))" },
                      interference: { label: "Interference (dB)", color: "hsl(var(--chart-2))" },
                    }}
                    className="h-64"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={enhancedTelemetryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="signalStrength" stroke="var(--color-signalStrength)" strokeWidth={2} />
                        <Line type="monotone" dataKey="interference" stroke="var(--color-interference)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Packet Loss & Latency */}
              <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-slate-50">
                    <Wifi className="h-5 w-5 text-purple-400" />
                    <span>Network Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-slate-200">
                  <ChartContainer
                    config={{
                      packetLoss: { label: "Packet Loss (%)", color: "hsl(var(--chart-3))" },
                      latency: { label: "Latency (ms)", color: "hsl(var(--chart-4))" },
                      jitter: { label: "Jitter (ms)", color: "hsl(var(--chart-5))" },
                    }}
                    className="h-64"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={enhancedTelemetryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="packetLoss" stroke="var(--color-packetLoss)" strokeWidth={2} />
                        <Line type="monotone" dataKey="latency" stroke="var(--color-latency)" strokeWidth={2} />
                        <Line type="monotone" dataKey="jitter" stroke="var(--color-jitter)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Environmental Dashboard Section */}
        {selectedMetrics === "environmental" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-50 flex items-center space-x-2">
              <Wind className="h-6 w-6 text-green-400" />
              <span>Environmental Conditions</span>
            </h2>
            
            {/* Environmental Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-green-600/20 to-blue-600/20 backdrop-blur-2xl border border-green-500/40 shadow-glass-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {Math.round(enhancedTelemetryData.reduce((sum, d) => sum + d.ambientTemperature, 0) / enhancedTelemetryData.length)}°C
                  </div>
                  <div className="text-slate-300 text-sm">Average Temperature</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-2xl border border-blue-500/40 shadow-glass-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {Math.round(enhancedTelemetryData.reduce((sum, d) => sum + d.humidity, 0) / enhancedTelemetryData.length)}%
                  </div>
                  <div className="text-slate-300 text-sm">Average Humidity</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-cyan-600/20 to-purple-600/20 backdrop-blur-2xl border border-cyan-500/40 shadow-glass-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">
                    {Math.round(enhancedTelemetryData.reduce((sum, d) => sum + d.windSpeed, 0) / enhancedTelemetryData.length)} km/h
                  </div>
                  <div className="text-slate-300 text-sm">Average Wind Speed</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-2xl border border-purple-500/40 shadow-glass-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {Math.round(enhancedTelemetryData.reduce((sum, d) => sum + d.airQuality, 0) / enhancedTelemetryData.length)}
                  </div>
                  <div className="text-slate-300 text-sm">Average Air Quality</div>
                </CardContent>
              </Card>
            </div>

            {/* Environmental Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Temperature & Humidity Trends */}
              <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-slate-50">
                    <Thermometer className="h-5 w-5 text-red-400" />
                    <span>Temperature & Humidity Trends</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-slate-200">
                  <ChartContainer
                    config={{
                      ambientTemperature: { label: "Temperature (°C)", color: "hsl(var(--chart-1))" },
                      humidity: { label: "Humidity (%)", color: "hsl(var(--chart-2))" },
                    }}
                    className="h-64"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={enhancedTelemetryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="ambientTemperature" stroke="var(--color-ambientTemperature)" fill="var(--color-ambientTemperature)" fillOpacity={0.3} />
                        <Area type="monotone" dataKey="humidity" stroke="var(--color-humidity)" fill="var(--color-humidity)" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Wind Speed & Air Quality */}
              <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-slate-50">
                    <Wind className="h-5 w-5 text-blue-400" />
                    <span>Wind Speed & Air Quality</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-slate-200">
                  <ChartContainer
                    config={{
                      windSpeed: { label: "Wind Speed (km/h)", color: "hsl(var(--chart-3))" },
                      airQuality: { label: "Air Quality Index", color: "hsl(var(--chart-4))" },
                    }}
                    className="h-64"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={enhancedTelemetryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="windSpeed" stroke="var(--color-windSpeed)" strokeWidth={2} />
                        <Line type="monotone" dataKey="airQuality" stroke="var(--color-airQuality)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Environmental Impact Analysis */}
            <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
              <CardHeader>
                <CardTitle className="text-slate-50 flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-green-400" />
                  <span>Environmental Impact Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-600/30 rounded-lg p-4 border border-slate-500/30">
                    <h4 className="font-semibold text-green-400 mb-2 flex items-center space-x-2">
                      <Thermometer className="h-4 w-4" />
                      <span>Temperature Stability</span>
                    </h4>
                    <p className="text-sm text-slate-300">Range: {Math.min(...enhancedTelemetryData.map(d => d.ambientTemperature))}°C - {Math.max(...enhancedTelemetryData.map(d => d.ambientTemperature))}°C</p>
                    <p className="text-sm text-slate-300">Variance: {Math.round((Math.max(...enhancedTelemetryData.map(d => d.ambientTemperature)) - Math.min(...enhancedTelemetryData.map(d => d.ambientTemperature))) / 2)}°C</p>
                  </div>
                  
                  <div className="bg-slate-600/30 rounded-lg p-4 border border-slate-500/30">
                    <h4 className="font-semibold text-blue-400 mb-2 flex items-center space-x-2">
                      <Wind className="h-4 w-4" />
                      <span>Wind Conditions</span>
                    </h4>
                    <p className="text-sm text-slate-300">Average: {Math.round(enhancedTelemetryData.reduce((sum, d) => sum + d.windSpeed, 0) / enhancedTelemetryData.length)} km/h</p>
                    <p className="text-sm text-slate-300">Peak: {Math.max(...enhancedTelemetryData.map(d => d.windSpeed))} km/h</p>
                  </div>
                  
                  <div className="bg-slate-600/30 rounded-lg p-4 border border-slate-500/30">
                    <h4 className="font-semibold text-purple-400 mb-2 flex items-center space-x-2">
                      <Droplets className="h-4 w-4" />
                      <span>Air Quality</span>
                    </h4>
                    <p className="text-sm text-slate-300">Current: {enhancedTelemetryData[enhancedTelemetryData.length - 1]?.airQuality || 'N/A'}</p>
                    <p className="text-sm text-slate-300">Status: {enhancedTelemetryData[enhancedTelemetryData.length - 1]?.airQuality >= 80 ? 'Excellent' : enhancedTelemetryData[enhancedTelemetryData.length - 1]?.airQuality >= 60 ? 'Good' : 'Poor'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weather Alerts */}
            <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
              <CardHeader>
                <CardTitle className="text-slate-50 flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  <span>Environmental Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-slate-200">
                <div className="space-y-3">
                  {enhancedTelemetryData
                    .filter(data => data.ambientTemperature > 35 || data.ambientTemperature < 5 || data.windSpeed > 25 || data.airQuality < 70)
                    .map((data, index) => {
                      const alerts = []
                      if (data.ambientTemperature > 35) alerts.push(`High temperature: ${data.ambientTemperature}°C`)
                      if (data.ambientTemperature < 5) alerts.push(`Low temperature: ${data.ambientTemperature}°C`)
                      if (data.windSpeed > 25) alerts.push(`High wind: ${data.windSpeed} km/h`)
                      if (data.airQuality < 70) alerts.push(`Poor air quality: ${data.airQuality}`)
                      
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                            <div>
                              <div className="font-medium text-slate-50">Time: {data.time}</div>
                              <div className="text-sm text-red-400">{alerts.join(", ")}</div>
                            </div>
                          </div>
                          <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded-full text-xs border border-red-500/30">
                            Alert
                          </span>
                        </div>
                      )
                    })}
                  {enhancedTelemetryData.filter(data => data.ambientTemperature > 35 || data.ambientTemperature < 5 || data.windSpeed > 25 || data.airQuality < 70).length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <Wind className="h-12 w-12 mx-auto mb-2 text-green-400" />
                      <p>No environmental alerts - all conditions normal</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* AI Insights Section */}
        <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
          <CardHeader>
            <CardTitle className="text-slate-50 flex items-center space-x-2">
              <Activity className="h-5 w-5 text-purple-400" />
              <span>AI Analysis Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-600/30 rounded-lg p-4 border border-slate-500/30">
                <h4 className="font-semibold text-green-400 mb-2">Predictive Maintenance</h4>
                <p className="text-sm text-slate-300">Battery life prediction: 7 days remaining</p>
                <p className="text-sm text-slate-300">Temperature anomaly detected</p>
              </div>
              <div className="bg-slate-600/30 rounded-lg p-4 border border-slate-500/30">
                <h4 className="font-semibold text-blue-400 mb-2">Performance Optimization</h4>
                <p className="text-sm text-slate-300">CPU utilization trending upward</p>
                <p className="text-sm text-slate-300">Network load optimization recommended</p>
              </div>
              <div className="bg-slate-600/30 rounded-lg p-4 border border-slate-500/30">
                <h4 className="font-semibold text-yellow-400 mb-2">Risk Assessment</h4>
                <p className="text-sm text-slate-300">High interference detected</p>
                <p className="text-sm text-slate-300">Maintenance due in 3 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Real-time Data Table */}
        <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
          <CardHeader>
            <CardTitle className="text-slate-50 flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-400" />
              <span>Comprehensive Real-time Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left p-2 text-slate-300">Time</th>
                    <th className="text-left p-2 text-slate-300">Battery (%)</th>
                    <th className="text-left p-2 text-slate-300">Temp (°C)</th>
                    <th className="text-left p-2 text-slate-300">Network (%)</th>
                    <th className="text-left p-2 text-slate-300">CPU (%)</th>
                    <th className="text-left p-2 text-slate-300">Signal (dBm)</th>
                    <th className="text-left p-2 text-slate-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {enhancedTelemetryData.map((data, index) => (
                    <tr key={index} className="border-b border-slate-600/50">
                      <td className="p-2">{data.time}</td>
                      <td className="p-2">{data.battery}</td>
                      <td className="p-2">{data.temperature}</td>
                      <td className="p-2">{data.networkLoad}</td>
                      <td className="p-2">{data.cpuUtilization}</td>
                      <td className="p-2">{data.signalStrength}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            data.battery > 20 && data.temperature < 50 && data.cpuUtilization < 80
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : data.battery < 30 || data.temperature > 50 || data.cpuUtilization > 80
                              ? "bg-red-500/20 text-red-300 border border-red-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {data.battery > 20 && data.temperature < 50 && data.cpuUtilization < 80 
                            ? "Optimal" 
                            : data.battery < 30 || data.temperature > 50 || data.cpuUtilization > 80
                            ? "Critical"
                            : "Warning"
                          }
                        </span>
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
