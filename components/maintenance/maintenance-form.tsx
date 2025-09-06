"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Calendar,
  Clock,
  DollarSign,
  User,
  Wrench,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ApiClient } from "@/lib/api-client"

const maintenanceSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title must be less than 200 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  type: z.enum(["ROUTINE", "PREVENTIVE", "CORRECTIVE", "EMERGENCY", "UPGRADE", "INSPECTION", "CALIBRATION", "CLEANING", "REPLACEMENT", "REPAIR", "SOFTWARE_UPDATE", "HARDWARE_UPDATE", "SAFETY_CHECK", "PERFORMANCE_OPTIMIZATION"]),
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  status: z.enum(["PLANNED", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "ON_HOLD", "OVERDUE"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  scheduledDate: z.string().optional(),
  technician: z.string().max(100, "Technician name must be less than 100 characters").optional(),
  technicianContact: z.string().max(100, "Technician contact must be less than 100 characters").optional(),
  estimatedDurationHours: z.number().min(0, "Duration must be positive").optional(),
  actualDurationHours: z.number().min(0, "Duration must be positive").optional(),
  estimatedCost: z.number().min(0, "Cost must be positive").optional(),
  actualCost: z.number().min(0, "Cost must be positive").optional(),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional(),
  partsUsed: z.string().max(500, "Parts used must be less than 500 characters").optional(),
  isRecurring: z.boolean().default(false),
  recurrenceIntervalDays: z.number().min(1, "Recurrence interval must be at least 1 day").optional(),
  nextMaintenanceDate: z.string().optional(),
  towerId: z.string().min(1, "Tower is required"),
})

type MaintenanceFormData = z.infer<typeof maintenanceSchema>

interface MaintenanceFormProps {
  maintenance?: any
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function MaintenanceForm({ maintenance, onSubmit, onCancel }: MaintenanceFormProps) {
  const [towers, setTowers] = useState<any[]>([])
  const [isLoadingTowers, setIsLoadingTowers] = useState(true)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      title: maintenance?.title || "",
      description: maintenance?.description || "",
      type: maintenance?.type || "PREVENTIVE",
      priority: maintenance?.priority || "MEDIUM",
      status: maintenance?.status || "PLANNED",
      startDate: maintenance?.startDate || "",
      endDate: maintenance?.endDate || "",
      scheduledDate: maintenance?.scheduledDate || "",
      technician: maintenance?.technician || "",
      technicianContact: maintenance?.technicianContact || "",
      estimatedDurationHours: maintenance?.estimatedDurationHours || undefined,
      actualDurationHours: maintenance?.actualDurationHours || undefined,
      estimatedCost: maintenance?.estimatedCost || undefined,
      actualCost: maintenance?.actualCost || undefined,
      notes: maintenance?.notes || "",
      partsUsed: maintenance?.partsUsed || "",
      isRecurring: maintenance?.isRecurring || false,
      recurrenceIntervalDays: maintenance?.recurrenceIntervalDays || undefined,
      nextMaintenanceDate: maintenance?.nextMaintenanceDate || "",
      towerId: maintenance?.towerId || "",
    }
  })

  const isRecurring = watch("isRecurring")

  // Fetch towers for dropdown
  useEffect(() => {
    const fetchTowers = async () => {
      try {
        setIsLoadingTowers(true)
        const towersData = await ApiClient.getTowers()
        setTowers(towersData)
      } catch (error) {
        console.error('Failed to fetch towers:', error)
        // Fallback to dummy data
        setTowers([
          { id: "TWR-001", name: "Tower Alpha" },
          { id: "TWR-002", name: "Tower Beta" },
          { id: "TWR-003", name: "Tower Gamma" },
          { id: "TWR-004", name: "Tower Delta" },
        ])
      } finally {
        setIsLoadingTowers(false)
      }
    }

    fetchTowers()
  }, [])

  const onFormSubmit = (data: MaintenanceFormData) => {
    // Convert string dates to proper format and ensure towerId is numeric
    const formattedData = {
      ...data,
      towerId: parseInt(data.towerId), // Convert string to number
      startDate: data.startDate,
      endDate: data.endDate || null,
      scheduledDate: data.scheduledDate || null,
      nextMaintenanceDate: data.nextMaintenanceDate || null,
      estimatedDurationHours: data.estimatedDurationHours || null,
      actualDurationHours: data.actualDurationHours || null,
      estimatedCost: data.estimatedCost || null,
      actualCost: data.actualCost || null,
      recurrenceIntervalDays: data.recurrenceIntervalDays || null,
    }
    onSubmit(formattedData)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center space-x-2">
              <Wrench className="h-5 w-5" />
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-white/80">Title *</Label>
              <Input
                id="title"
                {...register("title")}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                placeholder="Enter maintenance title"
              />
              {errors.title && (
                <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description" className="text-white/80">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                placeholder="Enter maintenance description"
                rows={3}
              />
              {errors.description && (
                <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type" className="text-white/80">Type *</Label>
                <Select value={watch("type")} onValueChange={(value) => setValue("type", value as any)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PREVENTIVE">Preventive</SelectItem>
                    <SelectItem value="EMERGENCY">Emergency</SelectItem>
                    <SelectItem value="INSPECTION">Inspection</SelectItem>
                    <SelectItem value="REPAIR">Repair</SelectItem>
                    <SelectItem value="CORRECTIVE">Corrective</SelectItem>
                    <SelectItem value="UPGRADE">Upgrade</SelectItem>
                    <SelectItem value="CALIBRATION">Calibration</SelectItem>
                    <SelectItem value="REPLACEMENT">Replacement</SelectItem>
                    <SelectItem value="SOFTWARE_UPDATE">Software Update</SelectItem>
                    <SelectItem value="HARDWARE_UPDATE">Hardware Update</SelectItem>
                    <SelectItem value="SAFETY_CHECK">Safety Check</SelectItem>
                    <SelectItem value="PERFORMANCE_OPTIMIZATION">Performance Optimization</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-red-400 text-sm mt-1">{errors.type.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="priority" className="text-white/80">Priority *</Label>
                <Select value={watch("priority")} onValueChange={(value) => setValue("priority", value as any)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
                {errors.priority && (
                  <p className="text-red-400 text-sm mt-1">{errors.priority.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="status" className="text-white/80">Status *</Label>
              <Select value={watch("status")} onValueChange={(value) => setValue("status", value as any)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNED">Planned</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-red-400 text-sm mt-1">{errors.status.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="towerId" className="text-white/80">Tower *</Label>
              <Select value={watch("towerId")} onValueChange={(value) => setValue("towerId", value)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select tower" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingTowers ? (
                    <SelectItem value="loading" disabled>Loading towers...</SelectItem>
                  ) : (
                    towers.map((tower) => (
                      <SelectItem key={tower.id} value={tower.id}>
                        {tower.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.towerId && (
                <p className="text-red-400 text-sm mt-1">{errors.towerId.message}</p>
              )}
            </div>
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
              <Label htmlFor="startDate" className="text-white/80">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                {...register("startDate")}
                className="bg-white/5 border-white/10 text-white"
              />
              {errors.startDate && (
                <p className="text-red-400 text-sm mt-1">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="endDate" className="text-white/80">End Date</Label>
              <Input
                id="endDate"
                type="date"
                {...register("endDate")}
                className="bg-white/5 border-white/10 text-white"
              />
              {errors.endDate && (
                <p className="text-red-400 text-sm mt-1">{errors.endDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="scheduledDate" className="text-white/80">Scheduled Date</Label>
              <Input
                id="scheduledDate"
                type="date"
                {...register("scheduledDate")}
                className="bg-white/5 border-white/10 text-white"
              />
              {errors.scheduledDate && (
                <p className="text-red-400 text-sm mt-1">{errors.scheduledDate.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estimatedDurationHours" className="text-white/80">Est. Duration (hours)</Label>
                <Input
                  id="estimatedDurationHours"
                  type="number"
                  min="0"
                  {...register("estimatedDurationHours", { valueAsNumber: true })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  placeholder="0"
                />
                {errors.estimatedDurationHours && (
                  <p className="text-red-400 text-sm mt-1">{errors.estimatedDurationHours.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="actualDurationHours" className="text-white/80">Actual Duration (hours)</Label>
                <Input
                  id="actualDurationHours"
                  type="number"
                  min="0"
                  {...register("actualDurationHours", { valueAsNumber: true })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  placeholder="0"
                />
                {errors.actualDurationHours && (
                  <p className="text-red-400 text-sm mt-1">{errors.actualDurationHours.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isRecurring"
                checked={isRecurring}
                onCheckedChange={(checked) => setValue("isRecurring", checked)}
              />
              <Label htmlFor="isRecurring" className="text-white/80">Recurring Maintenance</Label>
            </div>

            {isRecurring && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="recurrenceIntervalDays" className="text-white/80">Interval (days)</Label>
                  <Input
                    id="recurrenceIntervalDays"
                    type="number"
                    min="1"
                    {...register("recurrenceIntervalDays", { valueAsNumber: true })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    placeholder="30"
                  />
                  {errors.recurrenceIntervalDays && (
                    <p className="text-red-400 text-sm mt-1">{errors.recurrenceIntervalDays.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="nextMaintenanceDate" className="text-white/80">Next Maintenance</Label>
                  <Input
                    id="nextMaintenanceDate"
                    type="date"
                    {...register("nextMaintenanceDate")}
                    className="bg-white/5 border-white/10 text-white"
                  />
                  {errors.nextMaintenanceDate && (
                    <p className="text-red-400 text-sm mt-1">{errors.nextMaintenanceDate.message}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Technician Information */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Technician Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="technician" className="text-white/80">Technician Name</Label>
              <Input
                id="technician"
                {...register("technician")}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                placeholder="Enter technician name"
              />
              {errors.technician && (
                <p className="text-red-400 text-sm mt-1">{errors.technician.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="technicianContact" className="text-white/80">Contact Information</Label>
              <Input
                id="technicianContact"
                {...register("technicianContact")}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                placeholder="Email or phone number"
              />
              {errors.technicianContact && (
                <p className="text-red-400 text-sm mt-1">{errors.technicianContact.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Information */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Cost Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estimatedCost" className="text-white/80">Estimated Cost</Label>
              <Input
                id="estimatedCost"
                type="number"
                min="0"
                step="0.01"
                {...register("estimatedCost", { valueAsNumber: true })}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                placeholder="0.00"
              />
              {errors.estimatedCost && (
                <p className="text-red-400 text-sm mt-1">{errors.estimatedCost.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="actualCost" className="text-white/80">Actual Cost</Label>
              <Input
                id="actualCost"
                type="number"
                min="0"
                step="0.01"
                {...register("actualCost", { valueAsNumber: true })}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                placeholder="0.00"
              />
              {errors.actualCost && (
                <p className="text-red-400 text-sm mt-1">{errors.actualCost.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Additional Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="notes" className="text-white/80">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              placeholder="Enter any additional notes"
              rows={3}
            />
            {errors.notes && (
              <p className="text-red-400 text-sm mt-1">{errors.notes.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="partsUsed" className="text-white/80">Parts Used</Label>
            <Textarea
              id="partsUsed"
              {...register("partsUsed")}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              placeholder="List parts and materials used"
              rows={2}
            />
            {errors.partsUsed && (
              <p className="text-red-400 text-sm mt-1">{errors.partsUsed.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-2xl"
        >
          <X className="h-4 w-4 mr-2" />
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
              {maintenance ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              {maintenance ? 'Update Maintenance' : 'Create Maintenance'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
