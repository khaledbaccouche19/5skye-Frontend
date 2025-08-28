"use client"

import { useState } from "react"
import { Brain, TrendingUp, AlertTriangle, Zap } from "lucide-react"
import { GlassMainLayout } from "@/components/layout/glass-main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { dummyAIInsights, dummyTowers } from "@/lib/dummy-data"

export default function AIInsightsPage() {
  const [riskFilter, setRiskFilter] = useState("all")
  const [urgencyFilter, setUrgencyFilter] = useState("all")
  const [towerFilter, setTowerFilter] = useState("all")

  const filteredInsights = dummyAIInsights.filter((insight) => {
    if (riskFilter !== "all" && insight.riskType !== riskFilter) return false
    if (urgencyFilter !== "all" && insight.urgency !== urgencyFilter) return false
    if (towerFilter !== "all" && insight.towerId !== towerFilter) return false
    return true
  })

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "bg-red-500"
      case "warning":
        return "bg-yellow-500"
      default:
        return "bg-blue-500"
    }
  }

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "destructive"
      case "warning":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <GlassMainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-50">AI Insights</h1>
            <p className="text-slate-300">
              AI-powered predictions and recommendations for your infrastructure
            </p>
          </div>
          <Button className="bg-slate-700/40 border-slate-500/40 hover:bg-slate-600/50">
            <Brain className="h-4 w-4 mr-2" />
            Configure AI Models
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-700/40 backdrop-blur-xl border border-slate-500/40 rounded-2xl shadow-glass-lg">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <span className="font-medium text-slate-100">Critical Risks</span>
              </div>
              <p className="text-2xl font-bold text-red-300 mt-1">
                {dummyAIInsights.filter((i) => i.urgency === "critical").length}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-700/40 backdrop-blur-xl border border-slate-500/40 rounded-2xl shadow-glass-lg">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-amber-400" />
                <span className="font-medium text-slate-100">Warnings</span>
              </div>
              <p className="text-2xl font-bold text-amber-300 mt-1">
                {dummyAIInsights.filter((i) => i.urgency === "warning").length}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-700/40 backdrop-blur-xl border border-slate-500/40 rounded-2xl shadow-glass-lg">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-blue-400" />
                <span className="font-medium text-slate-100">Total Insights</span>
              </div>
              <p className="text-2xl font-bold text-blue-300 mt-1">{dummyAIInsights.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-700/40 backdrop-blur-xl border border-slate-500/40 rounded-2xl shadow-glass-lg">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-emerald-400" />
                <span className="font-medium text-slate-100">Avg Confidence</span>
              </div>
              <p className="text-2xl font-bold text-emerald-300 mt-1">
                {Math.round(dummyAIInsights.reduce((acc, i) => acc + i.confidence, 0) / dummyAIInsights.length)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={towerFilter} onValueChange={setTowerFilter}>
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
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-48 bg-slate-700/40 backdrop-blur-xl border-slate-500/40 text-white rounded-2xl">
              <SelectValue placeholder="Risk Type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800/95 backdrop-blur-2xl border-slate-500/50 rounded-2xl">
              <SelectItem value="all">All Risk Types</SelectItem>
              <SelectItem value="Hardware Failure">Hardware Failure</SelectItem>
              <SelectItem value="Performance">Performance</SelectItem>
              <SelectItem value="Security">Security</SelectItem>
            </SelectContent>
          </Select>
          <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
            <SelectTrigger className="w-32 bg-slate-700/40 backdrop-blur-xl border-slate-500/40 text-white rounded-2xl">
              <SelectValue placeholder="Urgency" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800/95 backdrop-blur-2xl border-slate-500/50 rounded-2xl">
              <SelectItem value="all">All Urgency</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* AI Insights Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredInsights.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <Brain className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-100 mb-2">No insights found</h3>
              <p className="text-slate-300">
                Try adjusting your filters or check back later for new AI predictions
              </p>
            </div>
          ) : (
            filteredInsights.map((insight) => (
              <Card key={insight.id} className="bg-slate-700/40 backdrop-blur-xl border border-slate-500/40 rounded-2xl shadow-glass-lg hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-slate-50">{insight.towerName}</CardTitle>
                    <Badge variant={getUrgencyBadge(insight.urgency) as any}>{insight.urgency.toUpperCase()}</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs bg-slate-600/40 border-slate-500/40">
                      {insight.riskType}
                    </Badge>
                    <span className="text-sm text-slate-300">{insight.towerId}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-slate-200">
                  <div>
                    <h4 className="font-medium text-slate-100 mb-2">Prediction</h4>
                    <p className="text-slate-200">{insight.prediction}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-100 mb-2">Recommendation</h4>
                    <p className="text-slate-200">{insight.recommendation}</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-100">Confidence Score</span>
                      <span className="text-sm text-slate-300">{insight.confidence}%</span>
                    </div>
                    <Progress value={insight.confidence} className="h-2" />
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button size="sm" variant="outline" className="bg-slate-600/40 border-slate-500/40 hover:bg-slate-500/50">
                      View Tower
                    </Button>
                    <Button size="sm" className="bg-slate-600 hover:bg-slate-500">Take Action</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* AI Model Performance */}
        <Card className="bg-slate-700/40 backdrop-blur-xl border border-slate-500/40 rounded-2xl shadow-glass-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-slate-50">
              <Brain className="h-5 w-5 text-slate-200" />
              <span>AI Model Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">94%</div>
                <div className="text-sm text-slate-300">Prediction Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400 mb-2">2.3s</div>
                <div className="text-sm text-slate-300">Average Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">156</div>
                <div className="text-sm text-slate-300">Predictions This Week</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </GlassMainLayout>
  )
}
