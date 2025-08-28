"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Edit, Trash2, Cpu, HardDrive, Wifi, Battery, Search, Zap, Thermometer, Radio, Server, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ApiClient } from "@/lib/api-client"

interface HardwareComponent {
  id: string
  name: string
  type: "battery" | "network" | "processor" | "storage" | "power" | "sensor" | "cooling"
  vendor: string
  model: string
  serialNumber: string
  warrantyExpiry: string
  status: "active" | "maintenance" | "failed"
  installDate: string
  specifications: Record<string, string> | string
  towerId?: number
}

interface HardwareManagementProps {
  towerId: string
  components: HardwareComponent[]
  onComponentsChange: (components: HardwareComponent[]) => void
}

const componentIcons = {
  battery: Battery,
  network: Wifi,
  processor: Cpu,
  storage: HardDrive,
  power: Zap,
  sensor: Thermometer,
  cooling: Server,
}

// Hardware type configurations with specific fields
const hardwareTypeConfigs = {
  battery: {
    name: "Battery",
    icon: Battery,
    fields: [
      { key: "capacity", label: "Capacity (Ah)", placeholder: "e.g., 100Ah", type: "text" },
      { key: "voltage", label: "Voltage (V)", placeholder: "e.g., 48V", type: "text" },
      { key: "chemistry", label: "Chemistry", placeholder: "e.g., Lithium-Ion", type: "text" },
      { key: "cycles", label: "Cycle Count", placeholder: "e.g., 2000", type: "number" },
    ]
  },
  network: {
    name: "Network",
    icon: Wifi,
    fields: [
      { key: "speed", label: "Speed", placeholder: "e.g., 1Gbps", type: "text" },
      { key: "ports", label: "Ports", placeholder: "e.g., 8", type: "number" },
      { key: "protocol", label: "Protocol", placeholder: "e.g., Ethernet", type: "text" },
      { key: "poe", label: "PoE Support", placeholder: "e.g., Yes/No", type: "text" },
    ]
  },
  processor: {
    name: "Processor",
    icon: Cpu,
    fields: [
      { key: "cores", label: "Cores", placeholder: "e.g., 8", type: "number" },
      { key: "frequency", label: "Frequency", placeholder: "e.g., 2.4GHz", type: "text" },
      { key: "cache", label: "Cache", placeholder: "e.g., 16MB", type: "text" },
      { key: "tdp", label: "TDP", placeholder: "e.g., 65W", type: "text" },
    ]
  },
  storage: {
    name: "Storage",
    icon: HardDrive,
    fields: [
      { key: "capacity", label: "Capacity", placeholder: "e.g., 1TB", type: "text" },
      { key: "type", label: "Type", placeholder: "e.g., SSD", type: "text" },
      { key: "interface", label: "Interface", placeholder: "e.g., SATA III", type: "text" },
      { key: "speed", label: "Speed", placeholder: "e.g., 550MB/s", type: "text" },
    ]
  },
  power: {
    name: "Power Supply",
    icon: Zap,
    fields: [
      { key: "wattage", label: "Wattage", placeholder: "e.g., 500W", type: "text" },
      { key: "efficiency", label: "Efficiency", placeholder: "e.g., 80+ Gold", type: "text" },
      { key: "voltage", label: "Voltage", placeholder: "e.g., 12V", type: "text" },
      { key: "modular", label: "Modular", placeholder: "e.g., Yes/No", type: "text" },
    ]
  },
  sensor: {
    name: "Sensor",
    icon: Thermometer,
    fields: [
      { key: "type", label: "Sensor Type", placeholder: "e.g., Temperature", type: "text" },
      { key: "range", label: "Range", placeholder: "e.g., -40°C to +85°C", type: "text" },
      { key: "accuracy", label: "Accuracy", placeholder: "e.g., ±0.5°C", type: "text" },
      { key: "output", label: "Output", placeholder: "e.g., 4-20mA", type: "text" },
    ]
  },
  cooling: {
    name: "Cooling System",
    icon: Server,
    fields: [
      { key: "type", label: "Cooling Type", placeholder: "e.g., Air", type: "text" },
      { key: "capacity", label: "Cooling Capacity", placeholder: "e.g., 500W", type: "text" },
      { key: "noise", label: "Noise Level", placeholder: "e.g., 25dB", type: "text" },
      { key: "fans", label: "Number of Fans", placeholder: "e.g., 2", type: "number" },
    ]
  },
}

export function HardwareManagement({ towerId, components, onComponentsChange }: HardwareManagementProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingComponent, setEditingComponent] = useState<HardwareComponent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [localComponents, setLocalComponents] = useState<HardwareComponent[]>(components)

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    vendor: "",
    model: "",
    serialNumber: "",
    warrantyExpiry: "",
    specifications: {} as Record<string, string>,
  })

  // Fetch hardware components from API when component mounts or towerId changes
  useEffect(() => {
    fetchHardwareComponents()
  }, [towerId])

  // Update local components when props change
  useEffect(() => {
    setLocalComponents(components)
  }, [components])

  const fetchHardwareComponents = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const hardwareData = await ApiClient.getHardwareByTower(towerId)
      
      // Validate and clean the hardware data
      const cleanedData = hardwareData.map(component => ({
        ...component,
        specifications: parseSpecifications(component.specifications),
        name: component.name || "Unnamed Component",
        type: component.type || "other",
        vendor: component.vendor || "Unknown Vendor",
        model: component.model || "Unknown Model",
        serialNumber: component.serialNumber || "No Serial",
        status: component.status || "active",
        installDate: component.installDate || new Date().toISOString(),
        warrantyExpiry: component.warrantyExpiry || "",
      }))
      
      setLocalComponents(cleanedData)
      onComponentsChange(cleanedData)
    } catch (err) {
      console.error('Failed to fetch hardware components:', err)
      setError('Failed to load hardware components')
      setLocalComponents([])
      onComponentsChange([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredComponents = localComponents.filter((component) => {
    if (
      searchQuery &&
      !component.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !component.vendor.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !component.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false
    if (typeFilter !== "all" && component.type !== typeFilter) return false
    return true
  })

  const handleCreateComponent = async () => {
    console.log("Add Component button clicked!")
    console.log("Form data:", formData)
    
    // Clear any previous errors
    setError(null)
    setSuccess(null)
    
    // Validate required fields
    if (!formData.name.trim()) {
      console.log("Name validation failed")
      setError("Component name is required")
      return
    }
    if (!formData.type) {
      console.log("Type validation failed")
      setError("Component type is required")
      return
    }
    if (!formData.vendor.trim()) {
      console.log("Vendor validation failed")
      setError("Vendor is required")
      return
    }
    if (!formData.model.trim()) {
      console.log("Model validation failed")
      setError("Model is required")
      return
    }
    if (!formData.serialNumber.trim()) {
      console.log("Serial number validation failed")
      setError("Serial number is required")
      return
    }

    console.log("All validations passed, creating component...")

    try {
      setIsLoading(true)
      
      const hardwareData = {
        name: formData.name.trim(),
        type: formData.type,
        vendor: formData.vendor.trim(),
        model: formData.model.trim(),
        serialNumber: formData.serialNumber.trim(),
        status: "active",
        towerId: parseInt(towerId),
        warrantyExpiry: formData.warrantyExpiry || null,
        installDate: new Date().toISOString().split('T')[0],
        specifications: JSON.stringify(formData.specifications),
      }

      console.log("Sending hardware data to API:", hardwareData)
      
      const newComponent = await ApiClient.createHardware(hardwareData)
      console.log("API response:", newComponent)

      // Refresh the hardware list from API
      await fetchHardwareComponents()
      
      setIsCreateDialogOpen(false)
      setSuccess("Component created successfully!")
      resetForm()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Failed to create hardware component:', err)
      setError('Failed to create component. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditComponent = (component: HardwareComponent) => {
    try {
      setEditingComponent(component)
      
      setFormData({
        name: component.name || "",
        type: component.type || "",
        vendor: component.vendor || "",
        model: component.model || "",
        serialNumber: component.serialNumber || "",
        warrantyExpiry: component.warrantyExpiry || "",
        specifications: parseSpecifications(component.specifications),
      })
    } catch (error) {
      console.error('Error editing component:', component.id, error);
      // Set default values if parsing fails
      setFormData({
        name: component.name || "",
        type: component.type || "",
        vendor: component.vendor || "",
        model: component.model || "",
        serialNumber: component.serialNumber || "",
        warrantyExpiry: component.warrantyExpiry || "",
        specifications: {},
      })
    }
  }

  const handleUpdateComponent = async () => {
    if (!editingComponent) return

    // Clear any previous errors
    setError(null)
    setSuccess(null)

    // Validate required fields
    if (!formData.name.trim()) {
      setError("Component name is required")
      return
    }
    if (!formData.type) {
      setError("Component type is required")
      return
    }
    if (!formData.vendor.trim()) {
      setError("Vendor is required")
      return
    }
    if (!formData.model.trim()) {
      setError("Model is required")
      return
    }
    if (!formData.serialNumber.trim()) {
      setError("Serial number is required")
      return
    }

    try {
      setIsLoading(true)
      
      const hardwareData = {
        name: formData.name.trim(),
        type: formData.type,
        vendor: formData.vendor.trim(),
        model: formData.model.trim(),
        serialNumber: formData.serialNumber.trim(),
        status: editingComponent.status,
        towerId: parseInt(towerId),
        warrantyExpiry: formData.warrantyExpiry || null,
        installDate: editingComponent.installDate,
        specifications: JSON.stringify(formData.specifications),
      }

      await ApiClient.updateHardware(editingComponent.id, hardwareData)

      // Refresh the hardware list from API
      await fetchHardwareComponents()
      
      setEditingComponent(null)
      setSuccess("Component updated successfully!")
      resetForm()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Failed to update hardware component:', err)
      setError('Failed to update component. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteComponent = async (componentId: string) => {
    if (!confirm("Are you sure you want to delete this component?")) return

    try {
      setIsLoading(true)
      setError(null)
      
      await ApiClient.deleteHardware(componentId)
      
      // Refresh the hardware list from API
      await fetchHardwareComponents()
      
      setSuccess("Component deleted successfully!")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Failed to delete hardware component:', err)
      setError('Failed to delete component. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      vendor: "",
      model: "",
      serialNumber: "",
      warrantyExpiry: "",
      specifications: {},
    })
    setError(null)
    setSuccess(null)
  }

  const handleSpecificationChange = (key: string, value: string) => {
    setFormData({
      ...formData,
      specifications: {
        ...formData.specifications,
        [key]: value,
      },
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-emerald-400 bg-emerald-500/20"
      case "maintenance":
        return "text-amber-400 bg-amber-500/20"
      case "failed":
        return "text-red-400 bg-red-500/20"
      default:
        return "text-slate-400 bg-slate-500/20"
    }
  }

  const selectedTypeConfig = formData.type ? hardwareTypeConfigs[formData.type as keyof typeof hardwareTypeConfigs] : null

  // Helper function to safely parse specifications
  const parseSpecifications = (specs: string | Record<string, string>): Record<string, string> => {
    if (!specs) return {};
    
    if (typeof specs === 'string') {
      try {
        // Handle empty strings or whitespace-only strings
        if (!specs.trim()) return {};
        
        const parsed = JSON.parse(specs.trim());
        
        // Ensure the parsed result is an object
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed;
        } else {
          console.warn('Specifications parsed but not an object:', parsed);
          return {};
        }
      } catch (error) {
        console.error('Failed to parse specifications JSON:', error, 'Raw value:', specs);
        return {};
      }
    }
    
    // If it's already an object, validate it
    if (specs && typeof specs === 'object' && !Array.isArray(specs)) {
      return specs;
    }
    
    console.warn('Invalid specifications format:', specs);
    return {};
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Hardware Components</h3>
        <div className="flex items-center space-x-3">
          <Button
            onClick={fetchHardwareComponents}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            setIsCreateDialogOpen(open)
            if (!open) {
              setError(null)
              setSuccess(null)
              resetForm()
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 rounded-2xl">
                <Plus className="h-4 w-4 mr-2" />
                Add Component
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/90 backdrop-blur-2xl border-white/10 text-white rounded-3xl max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Add Hardware Component</DialogTitle>
              </DialogHeader>
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-200 text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-6 mt-6">
                {/* Basic Info - Always shown */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="comp-name" className="text-white/80">
                      Component Name
                    </Label>
                    <Input
                      id="comp-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-white/5 border-white/10 text-white rounded-xl"
                      placeholder="Enter component name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="comp-type" className="text-white/80">
                      Type
                    </Label>
                    <Select value={formData.type} onValueChange={(value) => {
                      setFormData({ ...formData, type: value, specifications: {} })
                    }}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 backdrop-blur-2xl border-white/10 rounded-xl">
                        {Object.entries(hardwareTypeConfigs).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center space-x-2">
                              <config.icon className="h-4 w-4" />
                              <span>{config.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Vendor and Model - Always shown */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="comp-vendor" className="text-white/80">
                      Vendor
                    </Label>
                    <Input
                      id="comp-vendor"
                      value={formData.vendor}
                      onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                      className="bg-white/5 border-white/10 text-white rounded-xl"
                      placeholder="Enter vendor"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="comp-model" className="text-white/80">
                      Model
                    </Label>
                    <Input
                      id="comp-model"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="bg-white/5 border-white/10 text-white rounded-xl"
                      placeholder="Enter model"
                      required
                    />
                  </div>
                </div>

                {/* Serial Number and Warranty - Always shown */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="comp-serial" className="text-white/80">
                      Serial Number
                    </Label>
                    <Input
                      id="comp-serial"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                      className="bg-white/5 border-white/10 text-white rounded-xl"
                      placeholder="Enter serial number"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="comp-warranty" className="text-white/80">
                      Warranty Expiry
                    </Label>
                    <Input
                      id="comp-warranty"
                      type="date"
                      value={formData.warrantyExpiry}
                      onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                      className="bg-white/5 border-white/10 text-white rounded-xl"
                    />
                  </div>
                </div>

                {/* Dynamic Specifications based on Type */}
                {selectedTypeConfig && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Specifications</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedTypeConfig.fields.map((field) => (
                        <div key={field.key}>
                          <Label htmlFor={`spec-${field.key}`} className="text-white/80">
                            {field.label}
                          </Label>
                          <Input
                            id={`spec-${field.key}`}
                            type={field.type}
                            value={formData.specifications[field.key] || ""}
                            onChange={(e) => handleSpecificationChange(field.key, e.target.value)}
                            className="bg-white/5 border-white/10 text-white rounded-xl"
                            placeholder={field.placeholder}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateComponent}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 rounded-xl"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    {isLoading ? "Creating..." : "Add Component"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-green-200 text-sm">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
          <Input
            placeholder="Search by name, vendor, or serial number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white rounded-2xl"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white rounded-2xl">
            <SelectValue placeholder="Component Type" />
          </SelectTrigger>
          <SelectContent className="bg-black/90 backdrop-blur-2xl border-white/10 rounded-2xl">
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(hardwareTypeConfigs).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center space-x-2">
                  <config.icon className="h-4 w-4" />
                  <span>{config.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-white/60 mr-3" />
          <span className="text-white/60">Loading hardware components...</span>
        </div>
      )}

      {/* Components Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredComponents.map((component, index) => {
            const IconComponent = componentIcons[component.type as keyof typeof componentIcons]
            return (
              <motion.div
                key={component.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                          <IconComponent className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-white">{component.name}</CardTitle>
                          <p className="text-sm text-white/60">{component.vendor} {component.model}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditComponent(component)}
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-xl"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-black/90 backdrop-blur-2xl border-white/10 text-white rounded-3xl max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-bold">Edit Hardware Component</DialogTitle>
                            </DialogHeader>
                            {error && (
                              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-200 text-sm">
                                {error}
                              </div>
                            )}
                            <div className="space-y-6 mt-6">
                              {/* Basic Info - Always shown */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="edit-comp-name" className="text-white/80">
                                    Component Name
                                  </Label>
                                  <Input
                                    id="edit-comp-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white rounded-xl"
                                    placeholder="Enter component name"
                                    required
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-comp-type" className="text-white/80">
                                    Type
                                  </Label>
                                  <Select
                                    value={formData.type}
                                    onValueChange={(value) => {
                                      setFormData({ ...formData, type: value, specifications: {} })
                                    }}
                                  >
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-black/90 backdrop-blur-2xl border-white/10 rounded-xl">
                                      {Object.entries(hardwareTypeConfigs).map(([key, config]) => (
                                        <SelectItem key={key} value={key}>
                                          <div className="flex items-center space-x-2">
                                            <config.icon className="h-4 w-4" />
                                            <span>{config.name}</span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              {/* Vendor and Model - Always shown */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="edit-comp-vendor" className="text-white/80">
                                    Vendor
                                  </Label>
                                  <Input
                                    id="edit-comp-vendor"
                                    value={formData.vendor}
                                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white rounded-xl"
                                    placeholder="Enter vendor"
                                    required
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-comp-model" className="text-white/80">
                                    Model
                                  </Label>
                                  <Input
                                    id="edit-comp-model"
                                    value={formData.model}
                                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white rounded-xl"
                                    placeholder="Enter model"
                                    required
                                  />
                                </div>
                              </div>

                              {/* Serial Number and Warranty - Always shown */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="edit-comp-serial" className="text-white/80">
                                    Serial Number
                                  </Label>
                                  <Input
                                    id="edit-comp-serial"
                                    value={formData.serialNumber}
                                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white rounded-xl"
                                    placeholder="Enter serial number"
                                    required
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-comp-warranty" className="text-white/80">
                                    Warranty Expiry
                                  </Label>
                                  <Input
                                    id="edit-comp-warranty"
                                    type="date"
                                    value={formData.warrantyExpiry}
                                    onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white rounded-xl"
                                  />
                                </div>
                              </div>

                              {/* Dynamic Specifications based on Type */}
                              {selectedTypeConfig && (
                                <div className="space-y-4">
                                  <h4 className="text-lg font-semibold text-white">Specifications</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    {selectedTypeConfig.fields.map((field) => (
                                      <div key={field.key}>
                                        <Label htmlFor={`edit-spec-${field.key}`} className="text-white/80">
                                          {field.label}
                                        </Label>
                                        <Input
                                          id={`edit-spec-${field.key}`}
                                          type={field.type}
                                          value={formData.specifications[field.key] || ""}
                                          onChange={(e) => handleSpecificationChange(field.key, e.target.value)}
                                          className="bg-white/5 border-white/10 text-white rounded-xl"
                                          placeholder={field.placeholder}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="flex justify-end space-x-3 pt-4">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setEditingComponent(null)}
                                  className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl"
                                  disabled={isLoading}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleUpdateComponent}
                                  disabled={isLoading}
                                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-xl"
                                >
                                  {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : (
                                    <Edit className="h-4 w-4 mr-2" />
                                  )}
                                  {isLoading ? "Updating..." : "Update Component"}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteComponent(component.id)}
                          disabled={isLoading}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge className={getStatusColor(component.status)}>
                          {component.status.toUpperCase()}
                        </Badge>
                        <p className="text-sm text-white/60">SN: {component.serialNumber}</p>
                      </div>
                      <div className="text-sm text-white/80 space-y-1">
                        <p>Installed: {new Date(component.installDate).toLocaleDateString()}</p>
                        {component.warrantyExpiry && (
                          <p>Warranty: {new Date(component.warrantyExpiry).toLocaleDateString()}</p>
                        )}
                      </div>
                      {(() => {
                        try {
                          const specs = parseSpecifications(component.specifications);
                          const specEntries = Object.entries(specs || {});
                          
                          return specEntries.length > 0 ? (
                            <div>
                              <p className="text-sm font-medium text-white/80 mb-2">Specifications:</p>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {specEntries.map(([key, value]) => (
                                  <div key={key} className="flex justify-between">
                                    <span className="text-white/60 capitalize">{String(key)}:</span>
                                    <span className="text-white">{String(value)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null;
                        } catch (error) {
                          console.error('Error displaying specifications for component:', component.id, error);
                          return null;
                        }
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredComponents.length === 0 && (
        <div className="text-center py-12">
          <Server className="h-12 w-12 text-white/40 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No hardware components found</h3>
          <p className="text-white/60">
            {searchQuery || typeFilter !== "all" 
              ? "Try adjusting your search or filters."
              : "Add your first hardware component to get started."
            }
          </p>
        </div>
      )}
    </div>
  )
}
