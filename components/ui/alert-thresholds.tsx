"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, Plus, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface AlertThreshold {
  id: string
  name: string
  metric: "temperature" | "battery" | "voltage" | "networkLoad" | "uptime"
  condition: "greater_than" | "less_than" | "equals"
  value: number
  severity: "critical" | "warning" | "info"
  enabled: boolean
  description: string
}

interface AlertThresholdsProps {
  towerId: string
  thresholds: AlertThreshold[]
  onThresholdsChange: (thresholds: AlertThreshold[]) => void
}

const metricLabels = {
  temperature: "Temperature (°C)",
  battery: "Battery (%)",
  voltage: "Voltage (V)",
  networkLoad: "Network Load (%)",
  uptime: "Uptime (%)",
}

const conditionLabels = {
  greater_than: "Greater than",
  less_than: "Less than",
  equals: "Equals",
}

export function AlertThresholds({ towerId, thresholds, onThresholdsChange }: AlertThresholdsProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingThreshold, setEditingThreshold] = useState<AlertThreshold | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    metric: "",
    condition: "",
    value: "",
    severity: "",
    description: "",
  })

  const handleCreateThreshold = () => {
    const newThreshold: AlertThreshold = {
      id: `THRESH-${Date.now()}`,
      name: formData.name,
      metric: formData.metric as AlertThreshold["metric"],
      condition: formData.condition as AlertThreshold["condition"],
      value: Number.parseFloat(formData.value),
      severity: formData.severity as AlertThreshold["severity"],
      enabled: true,
      description: formData.description,
    }
    onThresholdsChange([...thresholds, newThreshold])
    setIsCreateDialogOpen(false)
    resetForm()
  }

  const handleEditThreshold = (threshold: AlertThreshold) => {
    setEditingThreshold(threshold)
    setFormData({
      name: threshold.name,
      metric: threshold.metric,
      condition: threshold.condition,
      value: threshold.value.toString(),
      severity: threshold.severity,
      description: threshold.description,
    })
  }

  const handleUpdateThreshold = () => {
    if (!editingThreshold) return

    const updatedThresholds = thresholds.map((threshold) =>
      threshold.id === editingThreshold.id
        ? {
            ...threshold,
            name: formData.name,
            metric: formData.metric as AlertThreshold["metric"],
            condition: formData.condition as AlertThreshold["condition"],
            value: Number.parseFloat(formData.value),
            severity: formData.severity as AlertThreshold["severity"],
            description: formData.description,
          }
        : threshold,
    )
    onThresholdsChange(updatedThresholds)
    setEditingThreshold(null)
    resetForm()
  }

  const handleDeleteThreshold = (thresholdId: string) => {
    onThresholdsChange(thresholds.filter((threshold) => threshold.id !== thresholdId))
  }

  const handleToggleThreshold = (thresholdId: string, enabled: boolean) => {
    const updatedThresholds = thresholds.map((threshold) =>
      threshold.id === thresholdId ? { ...threshold, enabled } : threshold,
    )
    onThresholdsChange(updatedThresholds)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      metric: "",
      condition: "",
      value: "",
      severity: "",
      description: "",
    })
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-400 bg-red-500/20"
      case "warning":
        return "text-amber-400 bg-amber-500/20"
      case "info":
        return "text-blue-400 bg-blue-500/20"
      default:
        return "text-slate-400 bg-slate-500/20"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Alert Thresholds</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border-0 rounded-2xl">
              <Plus className="h-4 w-4 mr-2" />
              Add Threshold
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black/90 backdrop-blur-2xl border-white/10 text-white rounded-3xl max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Create Alert Threshold</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-6">
              <div>
                <Label htmlFor="thresh-name" className="text-white/80">
                  Threshold Name
                </Label>
                <Input
                  id="thresh-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/5 border-white/10 text-white rounded-xl"
                  placeholder="Enter threshold name"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="thresh-metric" className="text-white/80">
                    Metric
                  </Label>
                  <Select
                    value={formData.metric}
                    onValueChange={(value) => setFormData({ ...formData, metric: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                      <SelectValue placeholder="Select metric" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 backdrop-blur-2xl border-white/10 rounded-xl">
                      {Object.entries(metricLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="thresh-condition" className="text-white/80">
                    Condition
                  </Label>
                  <Select
                    value={formData.condition}
                    onValueChange={(value) => setFormData({ ...formData, condition: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 backdrop-blur-2xl border-white/10 rounded-xl">
                      {Object.entries(conditionLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="thresh-value" className="text-white/80">
                    Value
                  </Label>
                  <Input
                    id="thresh-value"
                    type="number"
                    step="any"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="bg-white/5 border-white/10 text-white rounded-xl"
                    placeholder="Enter value"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="thresh-severity" className="text-white/80">
                  Severity
                </Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) => setFormData({ ...formData, severity: value })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 backdrop-blur-2xl border-white/10 rounded-xl">
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="thresh-description" className="text-white/80">
                  Description
                </Label>
                <Input
                  id="thresh-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-white/5 border-white/10 text-white rounded-xl"
                  placeholder="Enter description"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateThreshold}
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border-0 rounded-xl"
                >
                  Create Threshold
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Thresholds List */}
      <div className="space-y-4">
        {thresholds.map((threshold, index) => (
          <motion.div
            key={threshold.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-red-500/20 to-orange-500/20">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-white font-semibold">{threshold.name}</h4>
                        <Badge className={`${getSeverityColor(threshold.severity)} border-0`}>
                          {threshold.severity.toUpperCase()}
                        </Badge>
                        <Switch
                          checked={threshold.enabled}
                          onCheckedChange={(enabled) => handleToggleThreshold(threshold.id, enabled)}
                        />
                      </div>

                      <div className="text-white/80 text-sm">
                        <span className="font-medium">{metricLabels[threshold.metric]}</span>
                        <span className="mx-2">{conditionLabels[threshold.condition]}</span>
                        <span className="font-bold text-blue-400">{threshold.value}</span>
                      </div>

                      {threshold.description && <p className="text-white/60 text-sm mt-1">{threshold.description}</p>}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Dialog
                      open={editingThreshold?.id === threshold.id}
                      onOpenChange={(open) => !open && setEditingThreshold(null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditThreshold(threshold)}
                          className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-black/90 backdrop-blur-2xl border-white/10 text-white rounded-3xl max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold">Edit Alert Threshold</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 mt-6">
                          <div>
                            <Label htmlFor="edit-thresh-name" className="text-white/80">
                              Threshold Name
                            </Label>
                            <Input
                              id="edit-thresh-name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="bg-white/5 border-white/10 text-white rounded-xl"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="edit-thresh-metric" className="text-white/80">
                                Metric
                              </Label>
                              <Select
                                value={formData.metric}
                                onValueChange={(value) => setFormData({ ...formData, metric: value })}
                              >
                                <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-black/90 backdrop-blur-2xl border-white/10 rounded-xl">
                                  {Object.entries(metricLabels).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                      {label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="edit-thresh-condition" className="text-white/80">
                                Condition
                              </Label>
                              <Select
                                value={formData.condition}
                                onValueChange={(value) => setFormData({ ...formData, condition: value })}
                              >
                                <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-black/90 backdrop-blur-2xl border-white/10 rounded-xl">
                                  {Object.entries(conditionLabels).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                      {label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="edit-thresh-value" className="text-white/80">
                                Value
                              </Label>
                              <Input
                                id="edit-thresh-value"
                                type="number"
                                step="any"
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                className="bg-white/5 border-white/10 text-white rounded-xl"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="edit-thresh-severity" className="text-white/80">
                              Severity
                            </Label>
                            <Select
                              value={formData.severity}
                              onValueChange={(value) => setFormData({ ...formData, severity: value })}
                            >
                              <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-black/90 backdrop-blur-2xl border-white/10 rounded-xl">
                                <SelectItem value="critical">Critical</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                                <SelectItem value="info">Info</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="edit-thresh-description" className="text-white/80">
                              Description
                            </Label>
                            <Input
                              id="edit-thresh-description"
                              value={formData.description}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              className="bg-white/5 border-white/10 text-white rounded-xl"
                            />
                          </div>

                          <div className="flex justify-end space-x-4 pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setEditingThreshold(null)}
                              className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleUpdateThreshold}
                              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border-0 rounded-xl"
                            >
                              Update Threshold
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteThreshold(threshold.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {thresholds.length === 0 && (
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-white/40 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-white mb-2">No alert thresholds configured</h4>
          <p className="text-white/60">Create thresholds to automatically detect anomalies and trigger alerts</p>
        </div>
      )}
    </div>
  )
}
