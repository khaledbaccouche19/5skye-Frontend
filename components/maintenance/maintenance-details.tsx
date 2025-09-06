"use client"

import {
  Calendar,
  Clock,
  DollarSign,
  User,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface MaintenanceDetailsProps {
  maintenance: any
  onEdit: () => void
  onDelete: () => void
  onViewTower?: () => void
}

export function MaintenanceDetails({ maintenance, onEdit, onDelete, onViewTower }: MaintenanceDetailsProps) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h2 className="text-2xl font-bold text-white">{maintenance.title}</h2>
            <Badge variant={getStatusBadgeVariant(maintenance.status)}>
              {maintenance.status.replace('_', ' ')}
            </Badge>
            <Badge className={`text-xs ${getPriorityColor(maintenance.priority)}`}>
              {maintenance.priority}
            </Badge>
          </div>
          {maintenance.description && (
            <p className="text-white/60 text-lg">{maintenance.description}</p>
          )}
        </div>
        <div className="flex space-x-2">
          {onViewTower && (
            <Button
              onClick={onViewTower}
              variant="outline"
              size="sm"
              className="bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30 rounded-2xl"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Tower
            </Button>
          )}
          <Button
            onClick={onEdit}
            variant="outline"
            size="sm"
            className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-2xl"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            onClick={onDelete}
            variant="outline"
            size="sm"
            className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30 rounded-2xl"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center space-x-2">
              <Wrench className="h-5 w-5" />
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-white/60 text-sm">Type</p>
                <p className="text-white font-medium">{maintenance.type.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Priority</p>
                <p className={`font-medium ${getPriorityColor(maintenance.priority)}`}>
                  {maintenance.priority}
                </p>
              </div>
            </div>
            <div>
              <p className="text-white/60 text-sm">Tower</p>
              {onViewTower ? (
                <button
                  onClick={onViewTower}
                  className="text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1 transition-colors"
                >
                  <span>{maintenance.towerName}</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              ) : (
                <p className="text-white font-medium">{maintenance.towerName}</p>
              )}
            </div>
            {maintenance.isRecurring && (
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 text-blue-400" />
                <span className="text-blue-400 text-sm">Recurring Maintenance</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scheduling */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Scheduling</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-white/60 text-sm">Start Date</p>
              <p className="text-white font-medium">{formatDate(maintenance.startDate)}</p>
            </div>
            {maintenance.endDate && (
              <div>
                <p className="text-white/60 text-sm">End Date</p>
                <p className="text-white font-medium">{formatDate(maintenance.endDate)}</p>
              </div>
            )}
            {maintenance.scheduledDate && (
              <div>
                <p className="text-white/60 text-sm">Scheduled Date</p>
                <p className="text-white font-medium">{formatDate(maintenance.scheduledDate)}</p>
              </div>
            )}
            {maintenance.nextMaintenanceDate && (
              <div>
                <p className="text-white/60 text-sm">Next Maintenance</p>
                <p className="text-white font-medium">{formatDate(maintenance.nextMaintenanceDate)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Duration & Cost */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Duration & Cost</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-white/60 text-sm">Estimated Duration</p>
                <p className="text-white font-medium">
                  {maintenance.estimatedDurationHours ? `${maintenance.estimatedDurationHours} hours` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Actual Duration</p>
                <p className="text-white font-medium">
                  {maintenance.actualDurationHours ? `${maintenance.actualDurationHours} hours` : 'N/A'}
                </p>
              </div>
            </div>
            <Separator className="bg-white/10" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-white/60 text-sm">Estimated Cost</p>
                <p className="text-white font-medium">
                  {maintenance.estimatedCost ? `$${maintenance.estimatedCost.toLocaleString()}` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Actual Cost</p>
                <p className="text-white font-medium">
                  {maintenance.actualCost ? `$${maintenance.actualCost.toLocaleString()}` : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technician Information */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Technician</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {maintenance.technician ? (
              <>
                <div>
                  <p className="text-white/60 text-sm">Name</p>
                  <p className="text-white font-medium">{maintenance.technician}</p>
                </div>
                {maintenance.technicianContact && (
                  <div>
                    <p className="text-white/60 text-sm">Contact</p>
                    <div className="flex items-center space-x-2">
                      {maintenance.technicianContact.includes('@') ? (
                        <Mail className="h-4 w-4 text-white/60" />
                      ) : (
                        <Phone className="h-4 w-4 text-white/60" />
                      )}
                      <p className="text-white font-medium">{maintenance.technicianContact}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-white/60">No technician assigned</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      {(maintenance.notes || maintenance.partsUsed) && (
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Additional Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {maintenance.notes && (
              <div>
                <p className="text-white/60 text-sm mb-2">Notes</p>
                <p className="text-white bg-white/5 rounded-lg p-3">{maintenance.notes}</p>
              </div>
            )}
            {maintenance.partsUsed && (
              <div>
                <p className="text-white/60 text-sm mb-2">Parts Used</p>
                <p className="text-white bg-white/5 rounded-lg p-3">{maintenance.partsUsed}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recurring Information */}
      {maintenance.isRecurring && (
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center space-x-2">
              <RefreshCw className="h-5 w-5" />
              <span>Recurring Maintenance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-white/60 text-sm">Recurrence Interval</p>
                <p className="text-white font-medium">
                  {maintenance.recurrenceIntervalDays ? `${maintenance.recurrenceIntervalDays} days` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Next Maintenance</p>
                <p className="text-white font-medium">
                  {maintenance.nextMaintenanceDate ? formatDate(maintenance.nextMaintenanceDate) : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timestamps */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Record Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-white/60 text-sm">Created</p>
              <p className="text-white font-medium">{formatDateTime(maintenance.createdAt)}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Last Updated</p>
              <p className="text-white font-medium">{formatDateTime(maintenance.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
