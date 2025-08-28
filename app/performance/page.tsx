"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Activity, Zap, Wifi, Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { GlassMainLayout } from "@/components/layout/glass-main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { dummyTowers } from "@/lib/dummy-data"

export default function PerformanceDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h")
  const [selectedRegion, setSelectedRegion] = useState("all")

  // Calculate performance metrics
  const totalTowers = dummyTowers.length
  const onlineTowers = dummyTowers.filter(t => t.status === "online").length
  const warningTowers = dummyTowers.filter(t => t.status === "warning").length
  const criticalTowers = dummyTowers.filter(t => t.status === "critical").length

  const avgBattery = Math.round(dummyTowers.reduce((sum, t) => sum + t.battery, 0) / totalTowers)
  const avgUptime = Math.round(dummyTowers.reduce((sum, t) => sum + t.uptime, 0) / totalTowers * 10) / 10
  const avgNetworkLoad = Math.round(dummyTowers.reduce((sum, t) => sum + t.networkLoad, 0) / totalTowers)

  const performanceScore = Math.round(
    (onlineTowers / totalTowers) * 40 + 
    (avgBattery / 100) * 30 + 
    (avgUptime / 100) * 30
  )

  return (
    <GlassMainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-50">Performance Dashboard</h1>
            <p className="text-slate-300">Real-time performance overview and KPIs</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-32 bg-slate-700/40 backdrop-blur-xl border-slate-500/40 text-white rounded-2xl">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800/95 backdrop-blur-2xl border-slate-500/50 rounded-2xl">
                <SelectItem value="1h">1 Hour</SelectItem>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-40 bg-slate-700/40 backdrop-blur-xl border-slate-500/40 text-white rounded-2xl">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800/95 backdrop-blur-2xl border-slate-500/50 rounded-2xl">
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="middle-east">Middle East</SelectItem>
                <SelectItem value="europe">Europe</SelectItem>
                <SelectItem value="north-america">North America</SelectItem>
                <SelectItem value="asia-pacific">Asia Pacific</SelectItem>
                <SelectItem value="africa">Africa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Performance Score Card */}
        <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-2xl border border-blue-500/40 shadow-glass-lg">
          <CardHeader>
            <CardTitle className="text-slate-50 flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-blue-400" />
              <span>Overall Performance Score</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-400 mb-4">{performanceScore}</div>
              <div className="text-slate-300 mb-4">out of 100</div>
              <Progress value={performanceScore} className="h-3 bg-slate-600/50" />
              <div className="mt-4 text-sm text-slate-400">
                {performanceScore >= 90 ? "Excellent Performance" : 
                 performanceScore >= 75 ? "Good Performance" : 
                 performanceScore >= 60 ? "Fair Performance" : "Needs Attention"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Tower Status */}
          <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Tower Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-50 mb-2">{onlineTowers}/{totalTowers}</div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-green-400">Online</span>
              </div>
              <div className="flex items-center space-x-2 text-sm mt-1">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                <span className="text-yellow-400">{warningTowers} Warning</span>
              </div>
              <div className="flex items-center space-x-2 text-sm mt-1">
                <XCircle className="h-4 w-4 text-red-400" />
                <span className="text-red-400">{criticalTowers} Critical</span>
              </div>
            </CardContent>
          </Card>

          {/* Battery Health */}
          <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Avg Battery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-50 mb-2">{avgBattery}%</div>
              <Progress value={avgBattery} className="h-2 bg-slate-600/50 mb-2" />
              <div className="text-sm text-slate-400">
                {avgBattery >= 80 ? "Excellent" : 
                 avgBattery >= 60 ? "Good" : 
                 avgBattery >= 40 ? "Fair" : "Low"}
              </div>
            </CardContent>
          </Card>

          {/* Uptime */}
          <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Avg Uptime</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-50 mb-2">{avgUptime}%</div>
              <Progress value={avgUptime} className="h-2 bg-slate-600/50 mb-2" />
              <div className="text-sm text-slate-400">
                {avgUptime >= 99 ? "Excellent" : 
                 avgUptime >= 95 ? "Good" : 
                 avgUptime >= 90 ? "Fair" : "Poor"}
              </div>
            </CardContent>
          </Card>

          {/* Network Load */}
          <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Avg Network Load</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-50 mb-2">{avgNetworkLoad}%</div>
              <Progress value={avgNetworkLoad} className="h-2 bg-slate-600/50 mb-2" />
              <div className="text-sm text-slate-400">
                {avgNetworkLoad <= 60 ? "Optimal" : 
                 avgNetworkLoad <= 80 ? "Moderate" : "High"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance by Region */}
          <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
            <CardHeader>
              <CardTitle className="text-slate-50">Performance by Region</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {["Middle East", "Europe", "North America", "Asia Pacific", "Africa"].map((region) => {
                const regionTowers = dummyTowers.filter(t => t.region === region)
                if (regionTowers.length === 0) return null
                
                const regionAvgBattery = Math.round(regionTowers.reduce((sum, t) => sum + t.battery, 0) / regionTowers.length)
                const regionAvgUptime = Math.round(regionTowers.reduce((sum, t) => sum + t.uptime, 0) / regionTowers.length * 10) / 10
                const regionScore = Math.round((regionAvgBattery + regionAvgUptime) / 2)
                
                return (
                  <div key={region} className="flex items-center justify-between">
                    <span className="text-slate-300">{region}</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={regionScore} className="w-20 h-2 bg-slate-600/50" />
                      <span className="text-slate-50 font-medium w-12 text-right">{regionScore}%</span>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
            <CardHeader>
              <CardTitle className="text-slate-50">Top Performing Towers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dummyTowers
                .map(tower => ({
                  ...tower,
                  score: Math.round((tower.battery + tower.uptime) / 2)
                }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 5)
                .map((tower, index) => (
                  <div key={tower.id} className="flex items-center justify-between p-3 bg-slate-600/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant={index === 0 ? "default" : "secondary"} className="w-6 h-6 p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <div className="font-medium text-slate-50">{tower.name}</div>
                        <div className="text-sm text-slate-400">{tower.region}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-50">{tower.score}%</div>
                      <div className="text-sm text-slate-400">
                        {tower.battery}% battery, {tower.uptime}% uptime
                      </div>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>

        {/* Performance Alerts */}
        <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
          <CardHeader>
            <CardTitle className="text-slate-50 flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <span>Performance Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dummyTowers
                .filter(tower => tower.battery < 30 || tower.temperature > 50 || tower.uptime < 90)
                .map(tower => {
                  const alerts = []
                  if (tower.battery < 30) alerts.push(`Low battery: ${tower.battery}%`)
                  if (tower.temperature > 50) alerts.push(`High temperature: ${tower.temperature}°C`)
                  if (tower.uptime < 90) alerts.push(`Low uptime: ${tower.uptime}%`)
                  
                  return (
                    <div key={tower.id} className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <XCircle className="h-5 w-5 text-red-400" />
                        <div>
                          <div className="font-medium text-slate-50">{tower.name}</div>
                          <div className="text-sm text-red-400">{alerts.join(", ")}</div>
                        </div>
                      </div>
                      <Badge variant="destructive">Critical</Badge>
                    </div>
                  )
                })}
              {dummyTowers.filter(tower => tower.battery < 30 || tower.temperature > 50 || tower.uptime < 90).length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-400" />
                  <p>No critical performance alerts</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </GlassMainLayout>
  )
}
