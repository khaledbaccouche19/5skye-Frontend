"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { ApiClient } from "@/lib/api-client"

interface InlineMaintenanceFormProps {
  towerId: number
  towerName: string
  onMaintenanceCreated: () => void
  trigger?: React.ReactNode
}

export function InlineMaintenanceForm({ 
  towerId, 
  towerName, 
  onMaintenanceCreated,
  trigger 
}: InlineMaintenanceFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "PREVENTIVE",
    priority: "MEDIUM",
    status: "PLANNED",
    startDate: new Date(),
    scheduledDate: new Date(),
    technician: "",
    technicianContact: "",
    estimatedDurationHours: 8,
    estimatedCost: 0,
    notes: "",
    partsUsed: "",
    isRecurring: false,
    recurrenceIntervalDays: 30,
  })

  const maintenanceTypes = [
    { value: "PREVENTIVE", label: "Preventive" },
    { value: "EMERGENCY", label: "Emergency" },
    { value: "INSPECTION", label: "Inspection" },
    { value: "REPAIR", label: "Repair" },
    { value: "UPGRADE", label: "Upgrade" },
    { value: "CALIBRATION", label: "Calibration" },
  ]

  const priorities = [
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
    { value: "CRITICAL", label: "Critical" },
  ]

  const statuses = [
    { value: "PLANNED", label: "Planned" },
    { value: "SCHEDULED", label: "Scheduled" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
    { value: "ON_HOLD", label: "On Hold" },
    { value: "OVERDUE", label: "Overdue" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const maintenanceData = {
        ...formData,
        towerId: towerId,
        startDate: formData.startDate.toISOString().split('T')[0],
        scheduledDate: formData.scheduledDate.toISOString().split('T')[0],
        estimatedDurationHours: formData.estimatedDurationHours || null,
        estimatedCost: formData.estimatedCost || null,
        recurrenceIntervalDays: formData.isRecurring ? formData.recurrenceIntervalDays : null,
      }

      await ApiClient.createMaintenance(maintenanceData)
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        type: "PREVENTIVE",
        priority: "MEDIUM",
        status: "PLANNED",
        startDate: new Date(),
        scheduledDate: new Date(),
        technician: "",
        technicianContact: "",
        estimatedDurationHours: 8,
        estimatedCost: 0,
        notes: "",
        partsUsed: "",
        isRecurring: false,
        recurrenceIntervalDays: 30,
      })
      
      setIsOpen(false)
      onMaintenanceCreated()
    } catch (error) {
      console.error('Failed to create maintenance:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Maintenance
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/5 backdrop-blur-2xl border border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            Schedule Maintenance for {towerName}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Maintenance title"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type" className="text-white">Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {maintenanceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the maintenance work to be performed"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-white">Priority *</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-white">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-white">Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-white/10 border-white/20 text-white hover:bg-white/20",
                      !formData.startDate && "text-white/50"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white/10 backdrop-blur-2xl border border-white/20">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => handleInputChange('startDate', date || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledDate" className="text-white">Scheduled Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-white/10 border-white/20 text-white hover:bg-white/20",
                      !formData.scheduledDate && "text-white/50"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.scheduledDate ? format(formData.scheduledDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white/10 backdrop-blur-2xl border border-white/20">
                  <Calendar
                    mode="single"
                    selected={formData.scheduledDate}
                    onSelect={(date) => handleInputChange('scheduledDate', date || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedDurationHours" className="text-white">Duration (hours)</Label>
              <Input
                id="estimatedDurationHours"
                type="number"
                value={formData.estimatedDurationHours}
                onChange={(e) => handleInputChange('estimatedDurationHours', parseInt(e.target.value) || 0)}
                placeholder="8"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="technician" className="text-white">Technician</Label>
              <Input
                id="technician"
                value={formData.technician}
                onChange={(e) => handleInputChange('technician', e.target.value)}
                placeholder="Technician name"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="technicianContact" className="text-white">Contact</Label>
              <Input
                id="technicianContact"
                value={formData.technicianContact}
                onChange={(e) => handleInputChange('technicianContact', e.target.value)}
                placeholder="Phone or email"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimatedCost" className="text-white">Estimated Cost ($)</Label>
              <Input
                id="estimatedCost"
                type="number"
                value={formData.estimatedCost}
                onChange={(e) => handleInputChange('estimatedCost', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="partsUsed" className="text-white">Parts Used</Label>
              <Input
                id="partsUsed"
                value={formData.partsUsed}
                onChange={(e) => handleInputChange('partsUsed', e.target.value)}
                placeholder="List parts and materials"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-white">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes or special instructions"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isRecurring"
                checked={formData.isRecurring}
                onCheckedChange={(checked) => handleInputChange('isRecurring', checked)}
              />
              <Label htmlFor="isRecurring" className="text-white">Recurring Maintenance</Label>
            </div>

            {formData.isRecurring && (
              <div className="space-y-2">
                <Label htmlFor="recurrenceIntervalDays" className="text-white">Recurrence Interval (days)</Label>
                <Input
                  id="recurrenceIntervalDays"
                  type="number"
                  value={formData.recurrenceIntervalDays}
                  onChange={(e) => handleInputChange('recurrenceIntervalDays', parseInt(e.target.value) || 30)}
                  placeholder="30"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  min="1"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Maintenance
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
