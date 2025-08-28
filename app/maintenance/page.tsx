"use client"

import { useState } from "react"
import { Wrench, Calendar, Clock, DollarSign, AlertTriangle, CheckCircle, Plus, Filter } from "lucide-react"
import { GlassMainLayout } from "@/components/layout/glass-main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

// Mock maintenance data
const maintenanceData = [
  {
    id: "MNT-001",
    towerId: "TWR-001",
    towerName: "Tower Alpha",
    title: "Battery Replacement",
    description: "Replace aging battery cells with new lithium-ion batteries",
    type: "Preventive",
    priority: "High",
    status: "Scheduled",
    startDate: "2024-02-15",
    endDate: "2024-02-16",
    estimatedDuration: 16,
    actualDuration: null,
    estimatedCost: 2500,
    actualCost: null,
    technician: "John Smith",
    notes: "Battery showing signs of degradation, replacement recommended"
  },
  {
    id: "MNT-002",
    towerId: "TWR-003",
    towerName: "Tower Gamma",
    title: "Emergency Repair",
    description: "Fix critical hardware failure in communication module",
    type: "Emergency",
    priority: "Critical",
    status: "In Progress",
    startDate: "2024-01-20",
    endDate: "2024-01-22",
    estimatedDuration: 24,
    actualDuration: 20,
    estimatedCost: 5000,
    actualCost: 4800,
    technician: "Sarah Johnson",
    notes: "Hardware failure detected, immediate repair required"
  },
  {
    id: "MNT-003",
    towerId: "TWR-002",
    towerName: "Tower Beta",
    title: "Routine Inspection",
    description: "Annual safety and performance inspection",
    type: "Preventive",
    priority: "Medium",
    status: "Completed",
    startDate: "2024-01-10",
    endDate: "2024-01-10",
    estimatedDuration: 8,
    actualDuration: 7,
    estimatedCost: 800,
    actualCost: 750,
    technician: "Mike Wilson",
    notes: "All systems operating within normal parameters"
  },
  {
    id: "MNT-004",
    towerId: "TWR-004",
    towerName: "Tower Delta",
    title: "Software Update",
    description: "Update firmware and security patches",
    type: "Preventive",
    priority: "Medium",
    status: "Scheduled",
    startDate: "2024-02-20",
    endDate: "2024-02-20",
    estimatedDuration: 4,
    actualDuration: null,
    estimatedCost: 300,
    actualCost: null,
    technician: "Lisa Chen",
    notes: "Security patches available, update recommended"
  },
  {
    id: "MNT-005",
    towerId: "TWR-005",
    towerName: "Tower Echo",
    title: "Hardware Upgrade",
    description: "Upgrade network equipment for 5G capabilities",
    type: "Upgrade",
    priority: "High",
    status: "Planned",
    startDate: "2024-03-01",
    endDate: "2024-03-03",
    estimatedDuration: 48,
    actualDuration: null,
    estimatedCost: 15000,
    actualCost: null,
    technician: "David Brown",
    notes: "Major upgrade to support new 5G standards"
  }
]

export default function MaintenanceDashboard() {
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedPriority, setSelectedPriority] = useState("all")
  const [selectedType, setSelectedType] = useState("all")

  const filteredMaintenance = maintenanceData.filter(item => {
    if (selectedStatus !== "all" && item.status !== selectedStatus) return false
    if (selectedPriority !== "all" && item.priority !== selectedPriority) return false
    if (selectedType !== "all" && item.type !== selectedType) return false
    return true
  })

  const totalMaintenance = maintenanceData.length
  const completedMaintenance = maintenanceData.filter(m => m.status === "Completed").length
  const inProgressMaintenance = maintenanceData.filter(m => m.status === "In Progress").length
  const scheduledMaintenance = maintenanceData.filter(m => m.status === "Scheduled").length
  const plannedMaintenance = maintenanceData.filter(m => m.status === "Planned").length

  const totalEstimatedCost = maintenanceData.reduce((sum, m) => sum + m.estimatedCost, 0)
  const totalActualCost = maintenanceData.filter(m => m.actualCost).reduce((sum, m) => sum + m.actualCost!, 0)
  const costSavings = totalEstimatedCost - totalActualCost

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-500/20 text-green-300 border-green-500/30"
      case "In Progress": return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "Scheduled": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "Planned": return "bg-purple-500/20 text-purple-300 border-purple-500/30"
      default: return "bg-slate-500/20 text-slate-300 border-slate-500/30"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-red-500/20 text-red-300 border-red-500/30"
      case "High": return "bg-orange-500/20 text-orange-300 border-orange-500/30"
      case "Medium": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "Low": return "bg-green-500/20 text-green-300 border-green-500/30"
      default: return "bg-slate-500/20 text-slate-300 border-slate-500/30"
    }
  }

  return (
    <GlassMainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-50">Maintenance Dashboard</h1>
            <p className="text-slate-300">Maintenance scheduling, tracking, and cost management</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Maintenance
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-40 bg-slate-700/40 backdrop-blur-xl border-slate-500/40 text-white rounded-2xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800/95 backdrop-blur-2xl border-slate-500/50 rounded-2xl">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Planned">Planned</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger className="w-40 bg-slate-700/40 backdrop-blur-xl border-slate-500/40 text-white rounded-2xl">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800/95 backdrop-blur-2xl border-slate-500/50 rounded-2xl">
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-40 bg-slate-700/40 backdrop-blur-xl border-slate-500/40 text-white rounded-2xl">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800/95 backdrop-blur-2xl border-slate-500/50 rounded-2xl">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Preventive">Preventive</SelectItem>
              <SelectItem value="Emergency">Emergency</SelectItem>
              <SelectItem value="Upgrade">Upgrade</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Maintenance */}
          <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Total Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-50 mb-2">{totalMaintenance}</div>
              <div className="text-sm text-slate-400">Active tasks</div>
            </CardContent>
          </Card>

          {/* Completed */}
          <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400 mb-2">{completedMaintenance}</div>
              <Progress value={(completedMaintenance / totalMaintenance) * 100} className="h-2 bg-slate-600/50" />
              <div className="text-sm text-slate-400 mt-2">{Math.round((completedMaintenance / totalMaintenance) * 100)}% completion rate</div>
            </CardContent>
          </Card>

          {/* In Progress */}
          <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400 mb-2">{inProgressMaintenance}</div>
              <div className="text-sm text-slate-400">Currently working</div>
            </CardContent>
          </Card>

          {/* Scheduled */}
          <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Scheduled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400 mb-2">{scheduledMaintenance}</div>
              <div className="text-sm text-slate-400">Upcoming tasks</div>
            </CardContent>
          </Card>
        </div>

        {/* Cost Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cost Summary */}
          <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
            <CardHeader>
              <CardTitle className="text-slate-50 flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                <span>Cost Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Estimated Total:</span>
                <span className="text-slate-50 font-bold">${totalEstimatedCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Actual Spent:</span>
                <span className="text-slate-50 font-bold">${totalActualCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Cost Savings:</span>
                <span className="text-green-400 font-bold">${costSavings.toLocaleString()}</span>
              </div>
              <Progress value={(totalActualCost / totalEstimatedCost) * 100} className="h-2 bg-slate-600/50" />
            </CardContent>
          </Card>

          {/* Upcoming Maintenance */}
          <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
            <CardHeader>
              <CardTitle className="text-slate-50 flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-400" />
                <span>Upcoming Maintenance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {maintenanceData
                .filter(m => m.status === "Scheduled" || m.status === "Planned")
                .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                .slice(0, 3)
                .map(maintenance => (
                  <div key={maintenance.id} className="flex items-center justify-between p-3 bg-slate-600/20 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-50">{maintenance.title}</div>
                      <div className="text-sm text-slate-400">{maintenance.towerName}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-300">{maintenance.startDate}</div>
                      <Badge className={getPriorityColor(maintenance.priority)}>{maintenance.priority}</Badge>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>

        {/* Maintenance List */}
        <Card className="bg-slate-700/40 backdrop-blur-2xl border border-slate-500/40 shadow-glass-lg">
          <CardHeader>
            <CardTitle className="text-slate-50">Maintenance Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left p-2 text-slate-300">Task</th>
                    <th className="text-left p-2 text-slate-300">Tower</th>
                    <th className="text-left p-2 text-slate-300">Type</th>
                    <th className="text-left p-2 text-slate-300">Priority</th>
                    <th className="text-left p-2 text-slate-300">Status</th>
                    <th className="text-left p-2 text-slate-300">Start Date</th>
                    <th className="text-left p-2 text-slate-300">Duration</th>
                    <th className="text-left p-2 text-slate-300">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMaintenance.map((maintenance) => (
                    <tr key={maintenance.id} className="border-b border-slate-600/50">
                      <td className="p-2">
                        <div>
                          <div className="font-medium text-slate-50">{maintenance.title}</div>
                          <div className="text-xs text-slate-400">{maintenance.description}</div>
                        </div>
                      </td>
                      <td className="p-2 text-slate-300">{maintenance.towerName}</td>
                      <td className="p-2">
                        <Badge variant="outline" className="text-xs">{maintenance.type}</Badge>
                      </td>
                      <td className="p-2">
                        <Badge className={getPriorityColor(maintenance.priority)}>{maintenance.priority}</Badge>
                      </td>
                      <td className="p-2">
                        <Badge className={getStatusColor(maintenance.status)}>{maintenance.status}</Badge>
                      </td>
                      <td className="p-2 text-slate-300">{maintenance.startDate}</td>
                      <td className="p-2 text-slate-300">
                        {maintenance.actualDuration || maintenance.estimatedDuration}h
                      </td>
                      <td className="p-2 text-slate-300">
                        ${(maintenance.actualCost || maintenance.estimatedCost).toLocaleString()}
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
