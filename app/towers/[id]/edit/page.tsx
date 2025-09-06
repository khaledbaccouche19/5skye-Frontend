"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, Globe, MapPin, Settings, Activity, Loader2 } from "lucide-react"
import { GlassMainLayout } from "@/components/layout/glass-main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ApiClient } from "@/lib/api-client"
import { motion } from "framer-motion"

export default function EditTowerPage() {
  const params = useParams()
  const router = useRouter()
  const towerId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tower, setTower] = useState<any>(null)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [connectionMessage, setConnectionMessage] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    status: "online",
    latitude: "",
    longitude: "",
    city: "",
    battery: "",
    temperature: "",
    uptime: "",
    networkLoad: "",
    useCase: "",
    region: "",
    lastMaintenance: "",
    apiEndpointUrl: "",
    apiKey: "",
    newModelFile: null as File | null,
  })

  // Fetch tower data on component mount
  useEffect(() => {
    const fetchTower = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const towerData = await ApiClient.getTowerById(towerId)
        setTower(towerData)
        
        // Populate form with existing data
        setFormData({
          name: towerData.name || "",
          status: towerData.status?.toLowerCase() || "online", // Convert backend uppercase to frontend lowercase
          latitude: towerData.latitude?.toString() || towerData.location?.lat?.toString() || "",
          longitude: towerData.longitude?.toString() || towerData.location?.lng?.toString() || "",
          city: towerData.city || towerData.location?.city || "",
          battery: towerData.battery?.toString() || "0",
          temperature: towerData.temperature?.toString() || "0",
          uptime: towerData.uptime?.toString() || "0",
          networkLoad: towerData.networkLoad?.toString() || "0",
          useCase: towerData.useCase || "",
          region: towerData.region || "",
          lastMaintenance: towerData.lastMaintenance ? towerData.lastMaintenance.split('T')[0] : "",
          apiEndpointUrl: towerData.apiEndpointUrl || "",
          apiKey: towerData.apiKey || "",
        })
      } catch (err) {
        console.error('Failed to fetch tower:', err)
        setError('Failed to load tower data')
      } finally {
        setIsLoading(false)
      }
    }

    if (towerId) {
      fetchTower()
    }
  }, [towerId])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const testConnection = async () => {
    if (!formData.apiEndpointUrl) {
      setConnectionStatus("error")
      setConnectionMessage("Please enter an API endpoint URL to test the connection")
      return
    }

    setConnectionStatus("testing")
    setConnectionMessage("Testing connection...")

    try {
      const result = await ApiClient.testConnection(formData.apiEndpointUrl, formData.apiKey)
      
      if (result.success) {
        setConnectionStatus("success")
        setConnectionMessage("✅ Connection successful!")
      } else {
        setConnectionStatus("error")
        setConnectionMessage("❌ Connection failed")
      }
    } catch (error: any) {
      setConnectionStatus("error")
      setConnectionMessage(`❌ ${error.message}`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      // Validate required fields
      if (!formData.name || !formData.city || !formData.useCase || !formData.region || !formData.latitude || !formData.longitude) {
        setError('Please fill in all required fields')
        setIsSaving(false)
        return
      }

      // Handle 3D model upload if a new file is selected
      let model3dPath = tower?.model3dPath || null
      if (formData.newModelFile) {
        try {
          console.log('Starting 3D model upload for file:', {
            name: formData.newModelFile.name,
            size: formData.newModelFile.size,
            type: formData.newModelFile.type
          })
          
          const uploadResult = await ApiClient.uploadModel(formData.newModelFile, formData.name || 'unnamed-tower')
          model3dPath = uploadResult.fileUrl
          console.log('3D model uploaded successfully:', model3dPath)
          
          // Add a small delay to ensure backend processing is complete
          console.log('Waiting for backend processing...')
          await new Promise(resolve => setTimeout(resolve, 1000))
          console.log('Backend processing delay completed')
        } catch (uploadError: any) {
          console.error('Failed to upload 3D model:', uploadError)
          
          // Show more specific error messages
          let errorMessage = 'Failed to upload 3D model. '
          if (uploadError.message) {
            if (uploadError.message.includes('413')) {
              errorMessage += 'File too large. Please use a smaller file.'
            } else if (uploadError.message.includes('415')) {
              errorMessage += 'Invalid file type. Please use a GLB file.'
            } else if (uploadError.message.includes('500')) {
              errorMessage += 'Server error. Please try again later.'
            } else if (uploadError.message.includes('empty file path')) {
              errorMessage += 'Backend returned invalid response. Please try again.'
            } else if (uploadError.message.includes('Failed to upload')) {
              errorMessage += uploadError.message.replace('Failed to upload 3D model: ', '')
            } else {
              errorMessage += uploadError.message
            }
          } else {
            errorMessage += 'Please try again.'
          }
          
          setError(errorMessage)
          setIsSaving(false)
          return
        }
      }

      // Convert form data to match backend structure
      const towerData = {
        name: formData.name,
        status: formData.status.toUpperCase(), // Convert to uppercase for backend validation
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        city: formData.city,
        battery: parseInt(formData.battery) || 0,
        temperature: parseFloat(formData.temperature) || 0,
        uptime: parseInt(formData.uptime) || 0,
        networkLoad: parseInt(formData.networkLoad) || 0,
        useCase: formData.useCase,
        region: formData.region,
        lastMaintenance: formData.lastMaintenance || null,
        model3dPath: model3dPath,
        apiEndpointUrl: formData.apiEndpointUrl || null,
        apiKey: formData.apiKey || null,
      }

      console.log('Updating tower with data:', towerData)
      await ApiClient.updateTower(towerId, towerData)
      
      // Redirect back to tower details
      router.push(`/towers/${towerId}`)
    } catch (err) {
      console.error('Failed to update tower:', err)
      setError('Failed to update tower. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <GlassMainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/60">Loading tower data...</p>
          </div>
        </div>
      </GlassMainLayout>
    )
  }

  if (error && !tower) {
    return (
      <GlassMainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Error Loading Tower</h2>
            <p className="text-white/60 mb-4">{error}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </GlassMainLayout>
    )
  }

  if (!tower) {
    return (
      <GlassMainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Tower Not Found</h2>
            <p className="text-white/60 mb-4">The requested tower could not be found.</p>
            <Button onClick={() => router.push("/towers")}>Return to Towers</Button>
          </div>
        </div>
      </GlassMainLayout>
    )
  }

  return (
    <GlassMainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Edit Tower
              </h1>
              <p className="text-white/60 text-lg mt-1">
                Modify {tower.name}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 space-y-8"
        >
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-200">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Globe className="h-6 w-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Basic Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/80">Tower Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Downtown 5G Tower"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-white/80">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white/10 border-white/20">
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="useCase" className="text-white/80">Use Case *</Label>
                <Input
                  id="useCase"
                  value={formData.useCase}
                  onChange={(e) => handleInputChange("useCase", e.target.value)}
                  placeholder="5G Coverage"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="region" className="text-white/80">Region *</Label>
                <Select value={formData.region} onValueChange={(value) => handleInputChange("region", value)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/10 border-white/20">
                    <SelectItem value="Middle East">Middle East</SelectItem>
                    <SelectItem value="Europe">Europe</SelectItem>
                    <SelectItem value="Asia Pacific">Asia Pacific</SelectItem>
                    <SelectItem value="North America">North America</SelectItem>
                    <SelectItem value="South America">South America</SelectItem>
                    <SelectItem value="Africa">Africa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <MapPin className="h-6 w-6 text-green-400" />
              <h2 className="text-2xl font-bold text-white">Location</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-white/80">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="New York"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="latitude" className="text-white/80">Latitude *</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.000001"
                  value={formData.latitude}
                  onChange={(e) => handleInputChange("latitude", e.target.value)}
                  placeholder="40.7128"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude" className="text-white/80">Longitude *</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.000001"
                  value={formData.longitude}
                  onChange={(e) => handleInputChange("longitude", e.target.value)}
                  placeholder="-74.006"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  required
                />
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Activity className="h-6 w-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Metrics</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label htmlFor="battery" className="text-white/80">Battery (%)</Label>
                <Input
                  id="battery"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.battery}
                  onChange={(e) => handleInputChange("battery", e.target.value)}
                  placeholder="92"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature" className="text-white/80">Temperature (°C)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => handleInputChange("temperature", e.target.value)}
                  placeholder="21.5"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="uptime" className="text-white/80">Uptime (%)</Label>
                <Input
                  id="uptime"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.uptime}
                  onChange={(e) => handleInputChange("uptime", e.target.value)}
                  placeholder="99"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="networkLoad" className="text-white/80">Network Load (%)</Label>
                <Input
                  id="networkLoad"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.networkLoad}
                  onChange={(e) => handleInputChange("networkLoad", e.target.value)}
                  placeholder="38"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
            </div>
          </div>

          {/* Maintenance */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Settings className="h-6 w-6 text-orange-400" />
              <h2 className="text-2xl font-bold text-white">Maintenance</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="lastMaintenance" className="text-white/80">Last Maintenance Date</Label>
                <Input
                  id="lastMaintenance"
                  type="date"
                  value={formData.lastMaintenance}
                  onChange={(e) => handleInputChange("lastMaintenance", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
          </div>

          {/* 3D Model */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Globe className="h-6 w-6 text-green-400" />
              <h2 className="text-2xl font-bold text-white">3D Model</h2>
            </div>
            
            <div className="space-y-4">
              {/* Current 3D Model Display */}
              {tower?.model3dPath && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-white/80">Current 3D Model:</span>
                      <span className="text-white font-medium">{tower.model3dPath.split('/').pop()}</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, model3dPath: null }))}
                      className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}

              {/* 3D Model Upload */}
              <div className="space-y-4">
                <Label className="text-white/80">Upload New 3D Model (Optional)</Label>
                <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-white/40 transition-colors">
                  <input
                    type="file"
                    accept=".glb"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        if (!file.name.toLowerCase().endsWith('.glb')) {
                          setError('Please select a valid GLB file (.glb)')
                          return
                        }
                        if (file.size > 50 * 1024 * 1024) {
                          setError('File size must be less than 50MB')
                          return
                        }
                        setFormData(prev => ({ ...prev, newModelFile: file }))
                        setError(null)
                      }
                    }}
                    className="hidden"
                    id="model-upload"
                  />
                  <label
                    htmlFor="model-upload"
                    className="cursor-pointer flex flex-col items-center space-y-3"
                  >
                    <Globe className="h-12 w-12 text-white/40" />
                    <div>
                      <p className="text-white font-medium">Click to upload 3D model</p>
                      <p className="text-white/60 text-sm">GLB files only, max 50MB</p>
                    </div>
                  </label>
                </div>
                
                {/* File Info Display */}
                {formData.newModelFile && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                        <span className="text-white/80">New Model:</span>
                        <span className="text-white font-medium">{formData.newModelFile.name}</span>
                        <span className="text-white/60 text-sm">({(formData.newModelFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, newModelFile: null }))}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Data Source Configuration */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Globe className="h-6 w-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Data Source Configuration</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-white/60 text-sm">
                Configure the external API endpoint where your backend will fetch tower telemetry data from. This is optional and can be configured later.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="apiEndpointUrl" className="text-white/80">API Endpoint URL (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="apiEndpointUrl"
                      type="url"
                      value={formData.apiEndpointUrl}
                      onChange={(e) => handleInputChange("apiEndpointUrl", e.target.value)}
                      placeholder="https://api.company.com/telemetry/tower-123"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleInputChange("apiEndpointUrl", "http://localhost:8080/api/telemetry/live")}
                      className="whitespace-nowrap"
                    >
                      Use Simulator
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiKey" className="text-white/80">API Key (Optional)</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) => handleInputChange("apiKey", e.target.value)}
                    placeholder="Enter API key if required"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>
              </div>

              {/* Connection Test */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={testConnection}
                    disabled={connectionStatus === "testing"}
                    className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                  >
                    {connectionStatus === "testing" ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Globe className="w-4 h-4 mr-2" />
                    )}
                    {connectionStatus === "testing" ? "Testing..." : "Test Connection"}
                  </Button>
                  
                  {connectionMessage && (
                    <div className={`text-sm px-3 py-1 rounded-lg ${
                      connectionStatus === "success" 
                        ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                        : connectionStatus === "error"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    }`}>
                      {connectionMessage}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </motion.form>
      </div>
    </GlassMainLayout>
  )
}
