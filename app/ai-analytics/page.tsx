"use client"

import { useState } from "react"
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Target, BarChart3, Activity, Zap } from "lucide-react"
import { GlassMainLayout } from "@/components/layout/glass-main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Mock AI insights data
const aiInsightsData = [
  {
    id: "AI-001",
    towerId: "TWR-003",
    towerName: "Tower Gamma",
    insightType: "Predictive Maintenance",
    prediction: "Battery will fail in 4 days",
    recommendation: "Schedule immediate battery replacement",
    confidence: 94,
    riskType: "Hardware Failure",
    urgency: "Critical",
    impact: "High",
    estimatedCost: 2500,
    savings: 15000,
    lastUpdated: "2024-01-16T10:30:00Z"
  },
  {
    id: "AI-002",
    towerId: "TWR-002",
    towerName: "Tower Beta",
    insightType: "Performance Optimization",
    prediction: "CPU overload risk: 87%",
    recommendation: "Optimize workload distribution and add cooling",
    confidence: 87,
    riskType: "Performance",
    urgency: "Warning",
    impact: "Medium",
    estimatedCost: 800,
    savings: 5000,
    lastUpdated: "2024-01-16T09:15:00Z"
  },
  {
    id: "AI-003",
    towerId: "TWR-001",
    towerName: "Tower Alpha",
    insightType: "Anomaly Detection",
    prediction: "Unusual temperature pattern detected",
    recommendation: "Investigate environmental factors and check sensors",
    confidence: 76,
    riskType: "Environmental",
    urgency: "Info",
    impact: "Low",
    estimatedCost: 200,
    savings: 1000,
    lastUpdated: "2024-01-16T08:45:00Z"
  },
  {
    id: "AI-004",
    towerId: "TWR-004",
    towerName: "Tower Delta",
    insightType: "Capacity Planning",
    prediction: "Network capacity will be exceeded in 2 weeks",
    recommendation: "Add additional network equipment or optimize traffic",
    confidence: 92,
    riskType: "Capacity",
    urgency: "High",
    impact: "High",
    estimatedCost: 5000,
    savings: 20000,
    lastUpdated: "2024-01-16T07:30:00Z"
  },
  {
    id: "AI-005",
    towerId: "TWR-005",
    towerName: "Tower Echo",
    insightType: "Energy Optimization",
    prediction: "Energy consumption 15% above optimal",
    recommendation: "Implement power management and optimize schedules",
    confidence: 83,
    riskType: "Efficiency",
    urgency: "Medium",
    impact: "Medium",
    estimatedCost: 1200,
    savings: 8000,
    lastUpdated: "2024-01-16T06:15:00Z"
  }
]

// Mock AI model performance data
const modelPerformanceData = {
  predictiveMaintenance: { accuracy: 94, precision: 91, recall: 89 },
  anomalyDetection: { accuracy: 87, precision: 85, recall: 82 },
  performanceOptimization: { accuracy: 89, precision: 87, recall: 84 },
  capacityPlanning: { accuracy: 92, precision: 90, recall: 88 }
}

export default function AIAnalyticsDashboard() {
  const [selectedInsightType, setSelectedInsightType] = useState("all")
  const [selectedUrgency, setSelectedUrgency] = useState("all")

  const filteredInsights = aiInsightsData.filter(insight => {
    if (selectedInsightType !== "all" && insight.insightType !== selectedInsightType) return false
    if (selectedUrgency !== "all" && insight.urgency !== selectedUrgency) return false
    return true
  })

  // Calculate AI metrics
  const totalInsights = aiInsightsData.length
  const criticalInsights = aiInsightsData.filter(i => i.urgency === "Critical").length
  const highUrgencyInsights = aiInsightsData.filter(i => i.urgency === "High").length
  const warningInsights = aiInsightsData.filter(i => i.urgency === "Warning").length

  const totalEstimatedCost = aiInsightsData.reduce((sum, i) => sum + i.estimatedCost, 0)
  const totalPotentialSavings = aiInsightsData.reduce((sum, i) => sum + i.savings, 0)
  const roi = Math.round((totalPotentialSavings / totalEstimatedCost) * 100)

  const avgConfidence = Math.round(aiInsightsData.reduce((sum, i) => sum + i.confidence, 0) / totalInsights)

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "Critical": return "bg-red-500/20 text-red-300 border-red-500/30"
      case "High": return "bg-orange-500/20 text-orange-300 border-orange-500/30"
      case "Warning": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "Medium": return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "Info": return "bg-green-500/20 text-green-300 border-green-500/30"
      default: return "bg-slate-500/20 text-slate-300 border-slate-500/30"
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "High": return "text-red-400"
      case "Medium": return "text-yellow-400"
      case "Low": return "text-green-400"
      default: return "text-slate-400"
    }
  }

  return (
    <GlassMainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-50">AI Analytics Dashboard</h1>
            <p className="text-slate-300">Machine learning insights, predictions, and intelligent recommendations</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={selectedInsightType} onValueChange={setSelectedInsightType}>
              <SelectTrigger className="w-48 bg-slate-700/40 backdrop-blur-xl border-slate-500/40 text-white rounded-2xl">
                <SelectValue placeholder="Insight Type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800/95 backdrop-blur-2xl border-slate-500/50 rounded-2xl">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Predictive Maintenance">Predictive Maintenance</SelectItem>
                <SelectItem value="Performance Optimization">Performance Optimization</SelectItem>
                <SelectItem value="Anomaly Detection">Anomaly Detection</SelectItem>
                <SelectItem value="Capacity Planning">Capacity Planning</SelectItem>
                <SelectItem value="Energy Optimization">Energy Optimization</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
              <SelectTrigger className="w-40 bg-slate-700/40 backdrop-blur-xl border-slate-500/40 text-white rounded-2xl">
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800/95 backdrop-blur-2xl border-slate-500/50 rounded-2xl">
                <SelectItem value="all">All Urgencies</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Warning">Warning</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Info">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* AI Performance Overview */}
        <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-2xl border border-purple-500/40 shadow-glass-lg">
          <CardHeader>
            <CardTitle className="text-slate-50 flex items-center space-x-2">
              <Brain className="h-6 w-6 text-purple-400" />
              <span>AI Model Performance Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">{avgConfidence}%</div>
                <div className="text-slate-300 text-sm">Average Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">{totalInsights}</div>
                <div className="text-slate-300 text-sm">Active Insights</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">{roi}x</div>
                <div className="text-slate-300 text-sm">ROI Multiplier</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">${(totalPotentialSavings / 1000).toFixed(0)}k</div>
                <div className="text-slate-300 text-sm">Potential Savings</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Critical Insights */}
          <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Critical Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400 mb-2">{criticalInsights}</div>
              <Progress value={(criticalInsights / totalInsights) * 100} className="h-2 bg-slate-600/50" />
              <div className="text-sm text-slate-400 mt-2">Require immediate action</div>
            </CardContent>
          </Card>

          {/* High Urgency */}
          <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">High Urgency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400 mb-2">{highUrgencyInsights}</div>
              <Progress value={(highUrgencyInsights / totalInsights) * 100} className="h-2 bg-slate-600/50" />
              <div className="text-sm text-slate-400 mt-2">Plan within 24h</div>
            </CardContent>
          </Card>

          {/* Warnings */}
          <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Warnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400 mb-2">{warningInsights}</div>
              <Progress value={(warningInsights / totalInsights) * 100} className="h-2 bg-slate-600/50" />
              <div className="text-sm text-slate-400 mt-2">Monitor closely</div>
            </CardContent>
          </Card>

          {/* Model Accuracy */}
          <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Model Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400 mb-2">{modelPerformanceData.predictiveMaintenance.accuracy}%</div>
              <Progress value={modelPerformanceData.predictiveMaintenance.accuracy} className="h-2 bg-slate-600/50" />
              <div className="text-sm text-slate-400 mt-2">Predictive Maintenance</div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top AI Insights */}
          <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
            <CardHeader>
              <CardTitle className="text-slate-50">Top AI Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiInsightsData
                .sort((a, b) => b.confidence - a.confidence)
                .slice(0, 4)
                .map((insight) => (
                  <div key={insight.id} className="p-3 bg-slate-600/20 rounded-lg border border-slate-500/30">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getUrgencyColor(insight.urgency)}>{insight.urgency}</Badge>
                        <Badge variant="outline" className="text-xs">{insight.insightType}</Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-400">{insight.confidence}% confidence</div>
                      </div>
                    </div>
                    <div className="font-medium text-slate-50 mb-1">{insight.prediction}</div>
                    <div className="text-sm text-slate-300 mb-2">{insight.recommendation}</div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{insight.towerName}</span>
                      <span>Impact: <span className={getImpactColor(insight.impact)}>{insight.impact}</span></span>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>

          {/* Model Performance Metrics */}
          <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
            <CardHeader>
              <CardTitle className="text-slate-50">Model Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(modelPerformanceData).map(([model, metrics]) => (
                <div key={model} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 capitalize">{model.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="text-slate-50 font-medium">{metrics.accuracy}%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-slate-400">Precision</div>
                      <div className="text-slate-50">{metrics.precision}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-400">Recall</div>
                      <div className="text-slate-50">{metrics.recall}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-400">F1-Score</div>
                      <div className="text-slate-50">{Math.round((2 * metrics.precision * metrics.recall) / (metrics.precision + metrics.recall))}%</div>
                    </div>
                  </div>
                  <Progress value={metrics.accuracy} className="h-1 bg-slate-600/50" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* ROI Analysis */}
        <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
          <CardHeader>
            <CardTitle className="text-slate-50 flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-400" />
              <span>ROI Analysis & Cost-Benefit</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-slate-600/20 rounded-lg">
                <div className="text-2xl font-bold text-red-400 mb-2">${totalEstimatedCost.toLocaleString()}</div>
                <div className="text-slate-300">Investment Required</div>
                <div className="text-sm text-slate-400">For all AI recommendations</div>
              </div>
              <div className="text-center p-4 bg-slate-600/20 rounded-lg">
                <div className="text-2xl font-bold text-green-400 mb-2">${totalPotentialSavings.toLocaleString()}</div>
                <div className="text-slate-300">Potential Savings</div>
                <div className="text-sm text-slate-400">From implementing recommendations</div>
              </div>
              <div className="text-center p-4 bg-slate-600/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-400 mb-2">{roi}x</div>
                <div className="text-slate-300">Return on Investment</div>
                <div className="text-sm text-slate-400">For every dollar invested</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed AI Insights Table */}
        <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
          <CardHeader>
            <CardTitle className="text-slate-50">AI Insights & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left p-2 text-slate-300">Tower</th>
                    <th className="text-left p-2 text-slate-300">Insight Type</th>
                    <th className="text-left p-2 text-slate-300">Prediction</th>
                    <th className="text-left p-2 text-slate-300">Confidence</th>
                    <th className="text-left p-2 text-slate-300">Urgency</th>
                    <th className="text-left p-2 text-slate-300">Impact</th>
                    <th className="text-left p-2 text-slate-300">Investment</th>
                    <th className="text-left p-2 text-slate-300">Savings</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInsights.map((insight) => (
                    <tr key={insight.id} className="border-b border-slate-600/50">
                      <td className="p-2 font-medium text-slate-50">{insight.towerName}</td>
                      <td className="p-2">
                        <Badge variant="outline" className="text-xs">{insight.insightType}</Badge>
                      </td>
                      <td className="p-2">
                        <div className="max-w-xs">
                          <div className="font-medium text-slate-50">{insight.prediction}</div>
                          <div className="text-xs text-slate-400">{insight.recommendation}</div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center space-x-2">
                          <Progress value={insight.confidence} className="w-16 h-2 bg-slate-600/50" />
                          <span className="text-slate-50 font-medium w-12">{insight.confidence}%</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge className={getUrgencyColor(insight.urgency)}>{insight.urgency}</Badge>
                      </td>
                      <td className="p-2">
                        <span className={getImpactColor(insight.impact)}>{insight.impact}</span>
                      </td>
                      <td className="p-2 text-slate-300">${insight.estimatedCost.toLocaleString()}</td>
                      <td className="p-2 text-green-400 font-medium">${insight.savings.toLocaleString()}</td>
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
