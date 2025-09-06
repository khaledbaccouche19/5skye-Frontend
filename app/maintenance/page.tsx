"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wrench,
  DollarSign,
  User,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ExternalLink,
} from "lucide-react"
import { GlassMainLayout } from "@/components/layout/glass-main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MaintenanceForm } from "@/components/maintenance/maintenance-form"
import { MaintenanceDetails } from "@/components/maintenance/maintenance-details"
import { ApiClient } from "@/lib/api-client"
import { ProtectedRoute } from "@/components/auth/protected-route"

interface MaintenanceRecord {
  id: string
  title: string
  description?: string
  type: string
  priority: string
  status: string
  startDate: string
  endDate?: string
  scheduledDate?: string
  technician?: string
  technicianContact?: string
  estimatedDurationHours?: number
  actualDurationHours?: number
  estimatedCost?: number
  actualCost?: number
  notes?: string
  partsUsed?: string
  isRecurring: boolean
  recurrenceIntervalDays?: number
  nextMaintenanceDate?: string
  towerId: string
  towerName: string
  createdAt: string
  updatedAt: string
}

function MaintenanceContent() {
  const router = useRouter()
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<MaintenanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Fetch maintenance records
  useEffect(() => {
    const fetchMaintenanceRecords = async () => {
      try {
        setIsLoading(true)
        const records = await ApiClient.getAllMaintenance()
        setMaintenanceRecords(records)
        setFilteredRecords(records)
      } catch (error) {
        console.error('Failed to fetch maintenance records:', error)
        // Fallback to dummy data
        setMaintenanceRecords(getDummyMaintenanceData())
        setFilteredRecords(getDummyMaintenanceData())
      } finally {
        setIsLoading(false)
      }
    }

    fetchMaintenanceRecords()
  }, [])

  // Filter records based on search and filters
  useEffect(() => {
    let filtered = maintenanceRecords

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.technician?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.towerName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(record => record.status === statusFilter)
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter(record => record.priority === priorityFilter)
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(record => record.type === typeFilter)
    }

    setFilteredRecords(filtered)
  }, [maintenanceRecords, searchTerm, statusFilter, priorityFilter, typeFilter])

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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "COMPLETED": return "default"
      case "IN_PROGRESS": return "secondary"
      case "SCHEDULED": return "outline"
      case "PLANNED": return "outline"
      case "CANCELLED": return "destructive"
      case "ON_HOLD": return "secondary"
      case "OVERDUE": return "destructive"
      default: return "outline"
    }
  }

  const handleCreateMaintenance = async (maintenanceData: any) => {
    try {
      const newRecord = await ApiClient.createMaintenance(maintenanceData)
      setMaintenanceRecords(prev => [newRecord, ...prev])
      setIsFormOpen(false)
    } catch (error) {
      console.error('Failed to create maintenance record:', error)
    }
  }

  const handleUpdateMaintenance = async (id: string, maintenanceData: any) => {
    try {
      const updatedRecord = await ApiClient.updateMaintenance(id, maintenanceData)
      setMaintenanceRecords(prev => 
        prev.map(record => record.id === id ? updatedRecord : record)
      )
      setIsFormOpen(false)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update maintenance record:', error)
    }
  }

  const handleDeleteMaintenance = async (id: string) => {
    try {
      await ApiClient.deleteMaintenance(id)
      setMaintenanceRecords(prev => prev.filter(record => record.id !== id))
    } catch (error) {
      console.error('Failed to delete maintenance record:', error)
    }
  }

  const handleViewDetails = (record: MaintenanceRecord) => {
    setSelectedRecord(record)
    setIsDetailsOpen(true)
  }

  const handleViewTower = (record: MaintenanceRecord) => {
    router.push(`/towers/${record.towerId}`)
  }

  const handleEditMaintenance = (record: MaintenanceRecord) => {
    setSelectedRecord(record)
    setIsEditing(true)
    setIsFormOpen(true)
  }

  if (isLoading) {
    return (
      <GlassMainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">Loading maintenance records...</p>
          </div>
        </div>
      </GlassMainLayout>
    )
  }

  return (
    <GlassMainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Maintenance Management
            </h1>
            <p className="text-white/60 text-lg mt-1">
              Manage tower maintenance schedules, records, and technicians
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedRecord(null)
              setIsEditing(false)
              setIsFormOpen(true)
            }}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Maintenance
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl">
            <CardContent className="p-6">
        <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {maintenanceRecords.filter(r => r.status === "SCHEDULED").length}
                  </p>
                  <p className="text-white/60 text-sm">Scheduled</p>
                </div>
        </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {maintenanceRecords.filter(r => r.status === "COMPLETED").length}
                  </p>
                  <p className="text-white/60 text-sm">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {maintenanceRecords.filter(r => r.status === "OVERDUE").length}
                  </p>
                  <p className="text-white/60 text-sm">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                  <Wrench className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {maintenanceRecords.filter(r => r.status === "IN_PROGRESS").length}
                  </p>
                  <p className="text-white/60 text-sm">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    placeholder="Search maintenance records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
              </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PLANNED">Planned</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full md:w-48 bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-48 bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ROUTINE">Routine</SelectItem>
                  <SelectItem value="PREVENTIVE">Preventive</SelectItem>
                  <SelectItem value="CORRECTIVE">Corrective</SelectItem>
                  <SelectItem value="EMERGENCY">Emergency</SelectItem>
                  <SelectItem value="UPGRADE">Upgrade</SelectItem>
                  <SelectItem value="INSPECTION">Inspection</SelectItem>
                </SelectContent>
              </Select>
              </div>
            </CardContent>
          </Card>

        {/* Maintenance Records List */}
        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
            <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl">
              <CardContent className="p-12 text-center">
                <Wrench className="h-12 w-12 text-white/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No maintenance records found</h3>
                <p className="text-white/60 mb-4">
                  {searchTerm || statusFilter !== "all" || priorityFilter !== "all" || typeFilter !== "all"
                    ? "Try adjusting your filters to see more results."
                    : "Get started by scheduling your first maintenance task."}
                </p>
                <Button
                  onClick={() => {
                    setSelectedRecord(null)
                    setIsEditing(false)
                    setIsFormOpen(true)
                  }}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Maintenance
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredRecords.map((record) => (
              <Card key={record.id} className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{record.title}</h3>
                        <Badge variant={getStatusBadgeVariant(record.status)}>
                          {record.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={`text-xs ${getPriorityColor(record.priority)}`}>
                          {record.priority}
                        </Badge>
                      </div>
                      {record.description && (
                        <p className="text-white/60 text-sm mb-3">{record.description}</p>
                      )}
                      <div className="flex items-center space-x-6 text-sm text-white/60">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(record.startDate).toLocaleDateString()}</span>
                        </div>
                        {record.technician && (
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{record.technician}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Wrench className="h-4 w-4" />
                          <span>{record.towerName}</span>
                        </div>
                        {record.estimatedCost && (
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>${record.estimatedCost.toLocaleString()}</span>
                          </div>
                        )}
                    </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(record)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewTower(record)}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Tower
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditMaintenance(record)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteMaintenance(record.id)}
                          className="text-red-400"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
            </CardContent>
          </Card>
            ))
          )}
        </div>

        {/* Maintenance Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/10 backdrop-blur-2xl border border-white/20">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">
                {isEditing ? 'Edit Maintenance Record' : 'Schedule New Maintenance'}
              </DialogTitle>
            </DialogHeader>
            <MaintenanceForm
              maintenance={selectedRecord}
              onSubmit={isEditing ? 
                (data) => handleUpdateMaintenance(selectedRecord!.id, data) : 
                handleCreateMaintenance
              }
              onCancel={() => {
                setIsFormOpen(false)
                setIsEditing(false)
                setSelectedRecord(null)
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Maintenance Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/10 backdrop-blur-2xl border border-white/20">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Maintenance Details</DialogTitle>
            </DialogHeader>
            {selectedRecord && (
              <MaintenanceDetails 
                maintenance={selectedRecord}
                onEdit={() => {
                  setIsDetailsOpen(false)
                  handleEditMaintenance(selectedRecord)
                }}
                onDelete={() => {
                  setIsDetailsOpen(false)
                  handleDeleteMaintenance(selectedRecord.id)
                }}
                onViewTower={() => {
                  setIsDetailsOpen(false)
                  handleViewTower(selectedRecord)
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </GlassMainLayout>
  )
}

// Dummy data for fallback
function getDummyMaintenanceData(): MaintenanceRecord[] {
  return [
    {
      id: "MAINT-001",
      title: "Routine Battery Replacement",
      description: "Quarterly battery replacement and system check",
      type: "ROUTINE",
      priority: "MEDIUM",
      status: "COMPLETED",
      startDate: "2024-01-15",
      endDate: "2024-01-15",
      scheduledDate: "2024-01-15",
      technician: "John Smith",
      technicianContact: "john.smith@company.com",
      estimatedDurationHours: 4,
      actualDurationHours: 3,
      estimatedCost: 500,
      actualCost: 450,
      notes: "Battery replaced successfully, all systems operational",
      partsUsed: "Lithium-ion battery pack, connectors",
      isRecurring: true,
      recurrenceIntervalDays: 90,
      nextMaintenanceDate: "2024-04-15",
      towerId: "TWR-001",
      towerName: "Tower Alpha",
      createdAt: "2024-01-10T10:00:00Z",
      updatedAt: "2024-01-15T16:30:00Z"
    },
    {
      id: "MAINT-002",
      title: "Emergency Network Module Repair",
      description: "Critical network connectivity issue requiring immediate attention",
      type: "EMERGENCY",
      priority: "CRITICAL",
      status: "IN_PROGRESS",
      startDate: "2024-01-20",
      technician: "Sarah Johnson",
      technicianContact: "sarah.johnson@company.com",
      estimatedDurationHours: 8,
      actualDurationHours: 6,
      estimatedCost: 1200,
      notes: "Network module showing intermittent failures",
      partsUsed: "Network interface card, cables",
      isRecurring: false,
      towerId: "TWR-002",
      towerName: "Tower Beta",
      createdAt: "2024-01-20T08:00:00Z",
      updatedAt: "2024-01-20T14:00:00Z"
    },
    {
      id: "MAINT-003",
      title: "Preventive Maintenance Check",
      description: "Monthly preventive maintenance and system optimization",
      type: "PREVENTIVE",
      priority: "LOW",
      status: "SCHEDULED",
      startDate: "2024-01-25",
      scheduledDate: "2024-01-25",
      technician: "Mike Davis",
      technicianContact: "mike.davis@company.com",
      estimatedDurationHours: 2,
      estimatedCost: 300,
      notes: "Routine check and cleaning",
      isRecurring: true,
      recurrenceIntervalDays: 30,
      nextMaintenanceDate: "2024-02-25",
      towerId: "TWR-003",
      towerName: "Tower Gamma",
      createdAt: "2024-01-22T09:00:00Z",
      updatedAt: "2024-01-22T09:00:00Z"
    }
  ]
}

export default function MaintenancePage() {
  return (
    <ProtectedRoute>
      <MaintenanceContent />
    </ProtectedRoute>
  )
}