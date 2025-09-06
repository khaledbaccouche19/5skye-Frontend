"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Globe, MapPin, Settings, Activity, Upload, File, X } from "lucide-react"
import { GlassMainLayout } from "@/components/layout/glass-main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ApiClient } from "@/lib/api-client"
import { buildUrl, config } from "@/lib/config"
import { motion } from "framer-motion"

export default function NewTowerPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")

  // Data preview state
  const [fetchedData, setFetchedData] = useState<any>(null)
  const [dataFetchError, setDataFetchError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    status: "ONLINE",
    latitude: "",
    longitude: "",
    city: "",
    battery: "100",
    temperature: "25",
    uptime: "100",
    networkLoad: "0",
    useCase: "",
    region: "North America",
    lastMaintenance: "",
    apiEndpointUrl: "",
    apiKey: "",
  })

  // 3D Model upload state
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [modelFileName, setModelFileName] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // File handling functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type - accept both .glb and .gltf files
      const fileExtension = file.name.toLowerCase()
      if (!fileExtension.endsWith('.glb') && !fileExtension.endsWith('.gltf')) {
        setError('Please select a valid 3D model file (.glb or .gltf)')
        return
      }
      
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB')
        return
      }
      
      setModelFile(file)
      setModelFileName(file.name)
      setError(null)
    }
  }

  const removeModelFile = () => {
    setModelFile(null)
    setModelFileName("")
    setUploadProgress(0)
  }

  const uploadModelFile = async (): Promise<string | null> => {
    if (!modelFile) return null
    
    setIsUploading(true)
    setUploadProgress(0)
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)
      
      console.log('Starting 3D model upload for file:', {
        name: modelFile.name,
        size: modelFile.size,
        type: modelFile.type
      })
      
      // Upload using API client
      const result = await ApiClient.uploadModel(modelFile, formData.name || 'unnamed-tower')
      
      setUploadProgress(100)
      
      // Wait a bit to show 100% progress
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // The API client now returns the file path directly as a string
      console.log('Upload result:', result)
      return result
    } catch (error: any) {
      console.error('Failed to upload 3D model:', error)
      
      // Show more specific error messages
      let errorMessage = 'Failed to upload 3D model. '
      if (error.message) {
        if (error.message.includes('413')) {
          errorMessage += 'File too large. Please use a smaller file.'
        } else if (error.message.includes('415')) {
          errorMessage += 'Invalid file type. Please use a GLB file.'
        } else if (error.message.includes('500')) {
          errorMessage += 'Server error. Please try again later.'
        } else if (error.message.includes('Failed to upload')) {
          errorMessage += error.message.replace('Failed to upload 3D model: ', '')
        } else {
          errorMessage += error.message
        }
      } else {
        errorMessage += 'Please try again.'
      }
      
      setError(errorMessage)
      return null
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const testConnection = async () => {
    if (!formData.apiEndpointUrl) {
      setError('Please enter an API endpoint URL to test the connection')
      return
    }

    setIsTestingConnection(true)
    setConnectionStatus("idle")
    setError(null)
    setFetchedData(null)
    setDataFetchError(null)

    try {
      // Test the connection using ApiClient
      const result = await ApiClient.testConnection(formData.apiEndpointUrl, formData.apiKey)
      
      if (result.success) {
        setConnectionStatus("success")
        console.log('✅ Connection test successful for:', formData.apiEndpointUrl)
        
        // Now fetch the actual data to show in preview
        try {
          const data = await ApiClient.fetchTelemetryData(formData.apiEndpointUrl, formData.apiKey)
          setFetchedData(data)
          console.log('✅ Fetched telemetry data:', data)
        } catch (dataError: any) {
          setDataFetchError(`Connection successful but failed to fetch data: ${dataError.message}`)
          console.warn('⚠️ Connection test passed but data fetch failed:', dataError)
        }
      } else {
        setConnectionStatus("error")
        setError('Connection test failed')
      }
    } catch (err: any) {
      setConnectionStatus("error")
      console.error('❌ Connection test failed:', err)
      
      // Better error detection and messages
      if (err.message.includes('Failed to fetch')) {
        setError('❌ Connection failed: Unable to reach the API endpoint. Please check if the backend is running and the URL is correct.')
      } else if (err.message.includes('CORS')) {
        setError('❌ CORS error: The API endpoint does not allow cross-origin requests.')
      } else if (err.message.includes('Connection failed')) {
        setError(`❌ ${err.message}`)
      } else if (err.message.includes('NetworkError')) {
        setError('❌ Network error: The backend server is not running or unreachable.')
      } else {
        setError(`❌ Connection failed: ${err.message}`)
      }
    } finally {
      setIsTestingConnection(false)
    }
  }

  const populateFormWithTelemetryData = () => {
    if (!fetchedData) return

    console.log('🔄 Populating form with telemetry data:', fetchedData)

    // Update form data with fetched telemetry values
    setFormData(prev => ({
      ...prev,
      // Only update fields that have values in the telemetry data
      status: fetchedData.status ? fetchedData.status.toUpperCase() : prev.status,
      battery: fetchedData.battery !== null ? fetchedData.battery.toString() : prev.battery,
      temperature: fetchedData.temperature !== null ? fetchedData.temperature.toString() : prev.temperature,
      uptime: fetchedData.uptime !== null ? fetchedData.uptime.toString() : prev.uptime,
      networkLoad: fetchedData.networkLoad !== null ? fetchedData.networkLoad.toString() : prev.networkLoad,
    }))

    console.log('✅ Form populated with telemetry data')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Enhanced validation matching backend requirements
      const errors: string[] = []
      
      // Name validation: 2-100 characters
      if (!formData.name || formData.name.length < 2 || formData.name.length > 100) {
        errors.push('Tower name must be between 2 and 100 characters')
      }
      
      // City validation: 2-100 characters
      if (!formData.city || formData.city.length < 2 || formData.city.length > 100) {
        errors.push('City must be between 2 and 100 characters')
      }
      
      // Use case validation
      if (!formData.useCase) {
        errors.push('Use case is required')
      }
      
      // Region validation
      if (!formData.region) {
        errors.push('Region is required')
      }
      
      // Latitude validation: -90.0 to 90.0
      const lat = parseFloat(formData.latitude)
      if (isNaN(lat) || lat < -90.0 || lat > 90.0) {
        errors.push('Latitude must be between -90.0 and 90.0')
      }
      
      // Longitude validation: -180.0 to 180.0
      const lng = parseFloat(formData.longitude)
      if (isNaN(lng) || lng < -180.0 || lng > 180.0) {
        errors.push('Longitude must be between -180.0 and 180.0')
      }
      
      // Status validation: Must be UPPERCASE
      const validStatuses = ['ONLINE', 'OFFLINE', 'WARNING', 'CRITICAL', 'DEACTIVATED']
      if (!validStatuses.includes(formData.status)) {
        errors.push('Status must be one of: ONLINE, OFFLINE, WARNING, CRITICAL, DEACTIVATED')
      }
      
      if (errors.length > 0) {
        setError(errors.join('. '))
        setIsLoading(false)
        return
      }

      // Upload 3D model if provided
      let modelUrl: string | null = null
      if (modelFile) {
        modelUrl = await uploadModelFile()
        console.log('Model upload result - modelUrl:', modelUrl)
        if (!modelUrl) {
          setError('Failed to upload 3D model. Please try again.')
          setIsLoading(false)
          return
        }
      }

      // Convert form data to match backend structure
      const towerData = {
        name: formData.name,
        status: formData.status,
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
        model3dPath: modelUrl, // Use the correct backend field name (camelCase)
        apiEndpointUrl: formData.apiEndpointUrl || null,
        apiKey: formData.apiKey || null,
      }

      console.log('Sending tower data to backend:', towerData)
      console.log('Backend URL:', buildUrl.api('/towers'))
      
      try {
        const result = await ApiClient.createTower(towerData)
        console.log('Tower creation successful:', result)
        
        // Redirect to towers list
        router.push("/towers")
      } catch (apiError: any) {
        console.error('API call failed:', apiError)
        console.error('Error details:', {
          message: apiError.message,
          stack: apiError.stack,
          name: apiError.name
        })
        throw apiError // Re-throw to be caught by outer catch block
      }
    } catch (err: any) {
      console.error('Failed to create tower:', err)
      
      // Show more specific error messages
      let errorMessage = 'Failed to create tower. '
      if (err.message) {
        if (err.message.includes('API request failed')) {
          if (err.message.includes('500')) {
            errorMessage += 'Server error (500). Please check your backend logs.'
          } else if (err.message.includes('404')) {
            errorMessage += 'API endpoint not found. Please check your backend configuration.'
          } else if (err.message.includes('Failed to fetch')) {
            errorMessage += `Network error. Please check if your backend server is running at ${config.backend.baseUrl}.`
          } else {
            errorMessage += `Backend error: ${err.message}`
          }
        } else if (err.message.includes('Failed to fetch')) {
          errorMessage += `Network error. Please check if your backend server is running at ${config.backend.baseUrl}.`
        } else if (err.message.includes('413')) {
          errorMessage += 'Request too large. Please check your data.'
        } else if (err.message.includes('500')) {
          errorMessage += 'Server error. Please check your backend logs.'
        } else {
          errorMessage += err.message
        }
      } else {
        errorMessage += 'Unknown error occurred. Please try again.'
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
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
                Add New Tower
              </h1>
              <p className="text-white/60 text-lg mt-1">
                Configure a new telecommunications tower with optional 3D model and API configuration
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
                  maxLength={100}
                />
                <p className="text-white/40 text-xs">2-100 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-white/80">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white/10 border-white/20">
                    <SelectItem value="ONLINE">Online</SelectItem>
                    <SelectItem value="WARNING">Warning</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                    <SelectItem value="OFFLINE">Offline</SelectItem>
                    <SelectItem value="DEACTIVATED">Deactivated</SelectItem>
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
                  maxLength={100}
                />
                <p className="text-white/40 text-xs">2-100 characters</p>
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
                  min="-90"
                  max="90"
                />
                <p className="text-white/40 text-xs">Range: -90.0 to 90.0</p>
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
                  min="-180"
                  max="180"
                />
                <p className="text-white/40 text-xs">Range: -180.0 to 180.0</p>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Activity className="h-6 w-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Initial Metrics</h2>
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

          {/* 3D Model Upload */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <File className="h-6 w-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">3D Model (Optional)</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-white/60 text-sm">
                Upload a GLB or GLTF 3D model file to customize the tower's appearance in the 3D viewer. 
                Maximum file size: 50MB. Supported formats: .glb and .gltf.
              </p>
              
              {!modelFile ? (
                <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-white/40 transition-colors">
                  <input
                    type="file"
                    id="model-upload"
                    accept=".glb,.gltf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="model-upload"
                    className="cursor-pointer flex flex-col items-center space-y-3"
                  >
                    <Upload className="h-12 w-12 text-white/40" />
                    <div>
                      <p className="text-white font-medium">Click to upload 3D model</p>
                      <p className="text-white/40 text-sm">GLB/GLTF files only, max 50MB</p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <File className="h-8 w-8 text-purple-400" />
                      <div>
                        <p className="text-white font-medium">{modelFileName}</p>
                        <p className="text-white/60 text-sm">
                          {(modelFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeModelFile}
                      className="text-white/60 hover:text-white hover:bg-white/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {isUploading && (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm text-white/80">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Data Source Configuration */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Globe className="h-6 w-6 text-green-400" />
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
                    placeholder="sk_live_abc123def456ghi789"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={testConnection}
                  disabled={isTestingConnection}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  {isTestingConnection ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  ) : (
                    <Globe className="h-4 w-4 mr-2" />
                  )}
                  {isTestingConnection ? "Testing..." : "Test Connection"}
                </Button>
              </div>

              {/* Connection Status Feedback */}
              {connectionStatus === "success" && (
                <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-green-200 text-center">
                  ✅ Connection successful! The API endpoint is accessible.
                </div>
              )}
              
              {connectionStatus === "error" && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-200 text-center">
                  ❌ Connection failed. Please check the URL and API key.
                </div>
              )}

              {/* Show error message below status */}
              {error && connectionStatus === "error" && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-200 text-sm">
                  <strong>Error Details:</strong> {error}
                </div>
              )}
            </div>
          </div>

          {/* Data Preview - Integrated into the form */}
          {fetchedData && (
            <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white/80 text-lg flex items-center">
                  <Activity className="h-5 w-5 text-purple-400 mr-2" />
                  Fetched Telemetry Data
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={populateFormWithTelemetryData}
                  className="bg-green-500/20 border-green-500/30 text-green-200 hover:bg-green-500/30"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Populate Form
                </Button>
              </div>
              <div className="overflow-x-auto">
                <pre className="bg-white/10 border border-white/20 rounded-lg p-4 text-white text-sm max-h-64 overflow-y-auto">
                  {JSON.stringify(fetchedData, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {dataFetchError && (
            <div className="mt-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 text-yellow-200 text-sm">
              <strong>Warning:</strong> {dataFetchError}
            </div>
          )}

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
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isLoading ? "Creating..." : "Create Tower"}
            </Button>
          </div>
        </motion.form>
      </div>
    </GlassMainLayout>
  )
}
