"use client"

import { Suspense, useState, useRef, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Html, Text, Box, Sphere, Cylinder, useGLTF } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, ZoomIn, ZoomOut, Maximize, Upload, X, AlertCircle } from "lucide-react"
import { config } from "@/lib/config"
import * as THREE from "three"
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js'
import React from "react" // Added for ErrorBoundary

interface Tower3DViewerProps {
  tower: {
    id: string
    name: string
    status?: string
    battery?: number
    temperature?: number
    components?: string[] // Make components optional
    model3dPath?: string // Use the correct backend field name (camelCase)
  }
}

// Custom hook to load OBJ/STL/PLY 3D file formats
function useOther3DModel(url: string | null, fileType?: string) {
  const [model, setModel] = useState<THREE.Group | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const urlRef = useRef<string | null>(null)

  useEffect(() => {
    // Only load if URL actually changed
    if (url === urlRef.current) {
      return
    }

    // Reset state when URL changes
    setModel(null)
    setError(null)
    urlRef.current = url

    if (!url) {
      setLoading(false)
      return
    }

    setLoading(true)

    const loadModel = async () => {
      try {
        // Use the provided fileType or try to extract from URL
        const fileExtension = fileType || url.split('.').pop()?.toLowerCase()
        
        if (fileExtension === 'obj') {
          const loader = new OBJLoader()
          const object = await new Promise<THREE.Group>((resolve, reject) => {
            loader.load(url, resolve, undefined, reject)
          })
          setModel(object)
        } else if (fileExtension === 'stl') {
          const loader = new STLLoader()
          const geometry = await new Promise<THREE.BufferGeometry>((resolve, reject) => {
            loader.load(url, resolve, undefined, reject)
          })
          const material = new THREE.MeshStandardMaterial({ color: 0x888888 })
          const mesh = new THREE.Mesh(geometry, material)
          const group = new THREE.Group()
          group.add(mesh)
          setModel(group)
        } else if (fileExtension === 'ply') {
          const loader = new PLYLoader()
          const geometry = await new Promise<THREE.BufferGeometry>((resolve, reject) => {
            loader.load(url, resolve, undefined, reject)
          })
          const material = new THREE.MeshStandardMaterial({ color: 0x888888 })
          const mesh = new THREE.Mesh(geometry, material)
          const group = new THREE.Group()
          group.add(mesh)
          setModel(group)
        } else if (fileExtension === 'glb' || fileExtension === 'gltf') {
          // For GLB/GLTF files, we'll handle them in the TowerModel component using useGLTF
          setError(null) // No error, let useGLTF handle it
        } else {
          setError(`File format .${fileExtension} is not yet supported. Please convert to GLB, GLTF, OBJ, STL, or PLY format.`)
        }
      } catch (err) {
        console.error('Error loading 3D model:', err)
        setError('Failed to load the 3D model. Please check the file format.')
      } finally {
        setLoading(false)
      }
    }

    loadModel()
  }, [url, fileType])

  return { model, loading, error }
}

function TowerModel({ 
  tower, 
  customModelUrl, 
  customModelFileType,
  modelScale, 
  modelPosition, 
  modelRotation 
}: { 
  tower: Tower3DViewerProps["tower"]; 
  customModelUrl?: string;
  customModelFileType?: string;
  modelScale: number;
  modelPosition: [number, number, number];
  modelRotation: [number, number, number];
}) {
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null)
  const [gltfError, setGltfError] = useState<Error | null>(null)

  console.log('TowerModel: Rendering with:', { 
    customModelUrl, 
    customModelFileType, 
    towerModelPath: tower.model3dPath 
  })

  // Check if the file is GLB/GLTF
  const isGLBOrGLTF = customModelFileType && (customModelFileType === 'glb' || customModelFileType === 'gltf')
  
  // Load OBJ, STL, PLY files using custom hook
  const { model: customModel, loading: modelLoading, error: modelError } = useOther3DModel(isGLBOrGLTF ? null : customModelUrl || null, customModelFileType || undefined)
  
  // Load GLB/GLTF files using useGLTF - must be called unconditionally
  const gltfModel = useGLTF(customModelUrl || '', true)
  
  // Add error handling for useGLTF
  useEffect(() => {
    if (isGLBOrGLTF && customModelUrl) {
      console.log('TowerModel: Attempting to load GLB/GLTF from:', customModelUrl)
      
      // Test if the URL is accessible
      fetch(customModelUrl)
        .then(response => {
          if (response.ok) {
            console.log('TowerModel: GLB file accessible, status:', response.status)
          } else {
            console.error('TowerModel: GLB file not accessible, status:', response.status)
            setGltfError(new Error(`GLB file not accessible: ${response.status}`))
          }
        })
        .catch(error => {
          console.error('TowerModel: Error accessing GLB file:', error)
          setGltfError(error instanceof Error ? error : new Error('Failed to access GLB file'))
        })
    }
  }, [isGLBOrGLTF, customModelUrl])

  // Handle GLTF loading errors gracefully
  useEffect(() => {
    if (gltfModel && gltfModel.scene) {
      console.log('TowerModel: GLTF model loaded successfully')
    }
  }, [gltfModel])

  console.log('TowerModel: Model loading state:', { 
    isGLBOrGLTF, 
    modelLoading, 
    modelError, 
    gltfModel: !!gltfModel,
    customModel: !!customModel,
    customModelUrl
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "#10B981"
      case "warning":
        return "#F59E0B"
      case "critical":
        return "#EF4444"
      default:
        return "#6B7280"
    }
  }

  const getBatteryColor = (battery: number) => {
    if (battery > 50) return "#10B981"
    if (battery > 20) return "#F59E0B"
    return "#EF4444"
  }

  const getTemperatureColor = (temp: number) => {
    if (temp < 45) return "#3B82F6"
    if (temp < 55) return "#F59E0B"
    return "#EF4444"
  }

  return (
    <>
      {customModelUrl && modelLoading ? (
        <Html position={[0, 0, 0]} center>
          <div className="bg-black bg-opacity-75 text-white px-3 py-2 rounded text-sm">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Loading 3D Model...</span>
            </div>
          </div>
        </Html>
      ) : customModelUrl && isGLBOrGLTF && gltfModel && !gltfError ? (
        <primitive 
          object={gltfModel.scene} 
          scale={[modelScale, modelScale, modelScale]}
          position={modelPosition}
          rotation={modelRotation}
        />
      ) : customModelUrl && customModel ? (
        <primitive 
          object={customModel} 
          scale={[modelScale, modelScale, modelScale]}
          position={modelPosition}
          rotation={modelRotation}
        />
      ) : customModelUrl && (modelError || gltfError) ? (
        <Html position={[0, 0, 0]} center>
          <div className="bg-red-500 bg-opacity-75 text-white px-3 py-2 rounded text-sm max-w-xs text-center">
            <div className="font-semibold mb-1">3D Model Error</div>
            <div className="text-xs">
              {modelError || gltfError?.message || 'Failed to load 3D model'}
            </div>
            <div className="text-xs mt-1 opacity-75">
              Auto-retry in progress...
            </div>
          </div>
        </Html>
      ) : (
        <>
          {/* Tower Base */}
          <Cylinder args={[1.5, 1.5, 0.5]} position={[0, -2, 0]}>
            <meshStandardMaterial color="#64748B" />
          </Cylinder>

          {/* Main Tower Structure */}
          <Cylinder args={[0.3, 0.5, 8]} position={[0, 2, 0]}>
            <meshStandardMaterial color="#475569" />
          </Cylinder>

          {/* Status Indicator */}
          <Sphere args={[0.2]} position={[0, 6.5, 0]}>
            <meshStandardMaterial
              color={getStatusColor(tower.status || 'offline')}
              emissive={getStatusColor(tower.status || 'offline')}
              emissiveIntensity={0.3}
            />
          </Sphere>

          {/* Battery Indicator */}
          <Cylinder args={[0.1, 0.1, 0.8]} position={[-1.5, 5, 0]}>
            <meshStandardMaterial color={getBatteryColor(tower.battery || 0)} />
          </Cylinder>
          <Html position={[-1.5, 5.5, 0]} center>
            <div className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
              Battery: {tower.battery || 0}%
            </div>
          </Html>

          {/* Temperature Indicator */}
          <Cylinder args={[0.1, 0.1, 0.8]} position={[1.5, 5, 0]}>
            <meshStandardMaterial color={getTemperatureColor(tower.temperature || 25)} />
          </Cylinder>
          <Html position={[1.5, 5.5, 0]} center>
            <div className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
              Temperature: {tower.temperature || 25}°C
            </div>
          </Html>

          {/* Communication Arrays */}
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              args={[0.1, 0.1, 1.5]}
              position={[1.2, 5 - i * 0.5, 0]}
              rotation={[0, (i * Math.PI * 2) / 3, 0]}
              onPointerOver={() => setHoveredComponent(`antenna-${i}`)}
              onPointerOut={() => setHoveredComponent(null)}
            >
              <meshStandardMaterial color="#374151" />
              {hoveredComponent === `antenna-${i}` && (
                <Html position={[0, 0, 0.8]} center>
                  <div className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                    {tower.components?.[i] || "Communication Array"}
                  </div>
                </Html>
              )}
            </Box>
          ))}

          {/* Tower Label */}
          <Text position={[0, -3, 0]} fontSize={0.5} color="#1F2937" anchorX="center" anchorY="middle">
            {tower.name || "Tower"}
          </Text>

          {/* Status Badge */}
          <Html position={[0, 7, 0]} center>
            <Badge
              variant={tower.status === "online" ? "default" : tower.status === "warning" ? "secondary" : "destructive"}
              className="text-xs"
            >
              {(tower.status || "offline").toUpperCase()}
            </Badge>
          </Html>
        </>
      )}
    </>
  )
}

// Fallback component for 3D model loading failures
function LoadingFallback() {
  return (
    <Html center>
      <div className="text-center p-4 bg-black/50 rounded-lg border border-white/20">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-white/80 text-sm">Loading 3D model...</p>
      </div>
    </Html>
  )
}

// Error fallback component
function ModelErrorFallback() {
  return (
    <Html center>
      <div className="text-center p-4 bg-red-500/20 rounded-lg border border-red-500/30">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-red-200 text-sm">Failed to load 3D model</p>
        <p className="text-red-300 text-xs mt-1">Please check the file format and try again</p>
      </div>
    </Html>
  )
}

// Error boundary component for 3D models
function ModelErrorBoundary({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) {
  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  )
}

// Simple ErrorBoundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('3D Model Error Boundary caught an error:', error, errorInfo)
    // Prevent infinite re-renders by not updating state again
    if (!this.state.hasError) {
      this.setState({ hasError: true, error })
    }
  }

  // Reset error state when props change (new model URL)
  componentDidUpdate(prevProps: { children: React.ReactNode; fallback: React.ReactNode }) {
    if (this.state.hasError && prevProps.children !== this.props.children) {
      this.setState({ hasError: false, error: null })
    }
  }

  render() {
    if (this.state.hasError) {
      return <>{this.props.fallback}</>
    }
    return this.props.children
  }
}

export function Tower3DViewer({ tower }: Tower3DViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // Convert tower.model3dPath to full URL if it exists
  const getModelUrl = (modelPath: string | undefined) => {
    if (!modelPath) return null
    // If it's already a full URL, use it as is
    if (modelPath.startsWith('http://') || modelPath.startsWith('https://')) {
      return modelPath
    }
    // If it's a relative path, convert to full backend URL
    if (modelPath.startsWith('/')) {
      return `${config.backend.baseUrl}${modelPath}`
    }
    return `${config.backend.baseUrl}${config.backend.modelsPath}/${modelPath}`
  }
  
  const [customModelUrl, setCustomModelUrl] = useState<string | null>(getModelUrl(tower.model3dPath))
  const [customModelFileType, setCustomModelFileType] = useState<string | null>(tower.model3dPath ? 'glb' : null)
  const [isLoadingModel, setIsLoadingModel] = useState(false)
  const [modelError, setModelError] = useState<string | null>(null)
  const [modelScale, setModelScale] = useState(2.0)
  const [modelPosition, setModelPosition] = useState<[number, number, number]>([0, 0, 0])
  const [modelRotation, setModelRotation] = useState<[number, number, number]>([0, 0, 0])
  const [showModelControls, setShowModelControls] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update customModelUrl when tower.model3dPath changes
  useEffect(() => {
    console.log('Tower3DViewer: tower.model3dPath changed:', tower.model3dPath)
    if (tower.model3dPath && !customModelUrl) {
      const modelUrl = getModelUrl(tower.model3dPath)
      console.log('Tower3DViewer: Setting customModelUrl to:', modelUrl)
      setCustomModelUrl(modelUrl)
      setCustomModelFileType('glb')
      // Reset any previous errors when loading a new model
      setModelError(null)
    }
  }, [tower.model3dPath, customModelUrl])

  // Add retry mechanism for failed model loads
  useEffect(() => {
    if (modelError && customModelUrl) {
      console.log('Tower3DViewer: Model error detected, will retry in 3 seconds...')
      const retryTimer = setTimeout(() => {
        console.log('Tower3DViewer: Retrying model load...')
        setModelError(null)
        // Force a re-render by updating the URL slightly
        const currentUrl = customModelUrl
        setCustomModelUrl(null)
        setTimeout(() => setCustomModelUrl(currentUrl), 100)
      }, 3000)
      
      return () => clearTimeout(retryTimer)
    }
  }, [modelError, customModelUrl])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log("Loading 3D model:", file.name, file.type)
      
      // Check file type - support OBJ, STL, PLY, GLB, GLTF
      const fileExtension = file.name.toLowerCase().split('.').pop()
      const supportedFormats = ['obj', 'stl', 'ply', 'glb', 'gltf']
      
      if (!supportedFormats.includes(fileExtension || '')) {
        setModelError(`Unsupported file format: ${fileExtension}. Currently supported formats: OBJ, STL, PLY, GLB, GLTF.`)
        return
      }
      
      setIsLoadingModel(true)
      setModelError(null)
      
      // Revoke previous URL if it exists
      if (customModelUrl) {
        URL.revokeObjectURL(customModelUrl)
      }
      
      try {
        const url = URL.createObjectURL(file)
        console.log("Created object URL:", url)
        setCustomModelUrl(url)
        setCustomModelFileType(fileExtension || null)
      } catch (error) {
        console.error("Error creating object URL:", error)
        setModelError("Failed to load the 3D model file.")
      } finally {
        setIsLoadingModel(false)
      }
    }
    
    // Clear the input value to allow re-uploading the same file
    event.target.value = ''
  }

  const removeCustomModel = () => {
    if (customModelUrl) {
      URL.revokeObjectURL(customModelUrl)
      setCustomModelUrl(null)
      setCustomModelFileType(null)
      setModelError(null)
      setModelScale(2.0)
      setModelPosition([0, 0, 0])
      setModelRotation([0, 0, 0])
      setShowModelControls(false)
    }
  }

  return (
    <div
      className={`relative ${isFullscreen ? "fixed inset-0 z-50 bg-white dark:bg-slate-900" : "h-96"} rounded-lg overflow-hidden`}
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <Button 
          size="sm" 
          variant="outline" 
          className="bg-white/90 dark:bg-slate-800/90"
          onClick={() => {
            if (customModelUrl) {
              setModelError(null)
              const currentUrl = customModelUrl
              setCustomModelUrl(null)
              setTimeout(() => setCustomModelUrl(currentUrl), 100)
            }
          }}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" className="bg-white/90 dark:bg-slate-800/90">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" className="bg-white/90 dark:bg-slate-800/90">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" className="bg-white/90 dark:bg-slate-800/90" onClick={toggleFullscreen}>
          <Maximize className="h-4 w-4" />
        </Button>
      </div>

      {/* File Upload Controls */}
      <div className="absolute top-4 left-4 z-10 flex space-x-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".obj,.stl,.ply,.glb,.gltf"
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button 
          size="sm" 
          variant="outline" 
          className="bg-white/90 dark:bg-slate-800/90"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
        </Button>
        {customModelUrl && (
          <>
            <Button 
              size="sm" 
              variant="outline" 
              className="bg-white/90 dark:bg-slate-800/90"
              onClick={removeCustomModel}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="bg-white/90 dark:bg-slate-800/90"
              onClick={() => setShowModelControls(!showModelControls)}
            >
              ⚙️
            </Button>
          </>
        )}
      </div>

      {/* Tower Info Overlay */}
      <div className="absolute top-16 left-4 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg p-3">
        <div className="space-y-2">
          <h3 className="font-semibold text-slate-900 dark:text-white">{tower.name || "Tower"}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">{tower.id || "Unknown"}</p>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                tower.status === "online" ? "bg-green-500" : tower.status === "warning" ? "bg-yellow-500" : "bg-red-500"
              }`}
            />
            <span className="text-xs text-slate-600 dark:text-slate-400">{tower.status || "offline"}</span>
          </div>
          {tower.model3dPath && customModelUrl === tower.model3dPath
            ? "Built-in 3D Model"
            : customModelUrl
            ? "Custom 3D Model Loaded"
            : "No 3D Model"}
        </div>
      </div>

      {/* Component Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg p-3">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Components</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="text-slate-600 dark:text-slate-400">Temperature Sensor</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-slate-600 dark:text-slate-400">Battery Unit</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-500 rounded-full" />
            <span className="text-slate-600 dark:text-slate-400">Communication Arrays</span>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [5, 5, 5], fov: 60 }}
        style={{ background: "linear-gradient(to bottom, #e0f2fe, #f8fafc)" }}
      >
        <Suspense fallback={null}>
          <Environment preset="city" />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <ModelErrorBoundary fallback={<LoadingFallback />}>
            <TowerModel 
              key={`tower-${tower.id}-${customModelUrl || 'no-model'}`}
              tower={tower} 
              customModelUrl={customModelUrl || undefined}
              customModelFileType={customModelFileType || undefined}
              modelScale={modelScale}
              modelPosition={modelPosition}
              modelRotation={modelRotation}
            />
          </ModelErrorBoundary>
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} maxDistance={20} minDistance={3} />
        </Suspense>
      </Canvas>

      {/* Loading Overlay */}
      {isLoadingModel && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-white">Loading 3D Model...</p>
          </div>
        </div>
      )}

      {/* Model Controls Panel */}
      {showModelControls && customModelUrl && (
        <div className="absolute top-16 left-4 z-10 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg p-4 min-w-64">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Model Controls</h4>
          
          {/* Scale Control */}
          <div className="mb-3">
            <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Scale</label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={modelScale}
              onChange={(e) => e.target && setModelScale(parseFloat(e.target.value || '0.5'))}
              className="w-full"
            />
            <span className="text-xs text-slate-500">{modelScale.toFixed(1)}</span>
          </div>

          {/* Position Controls */}
          <div className="mb-3">
            <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Position</label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-slate-500">X</label>
                <input
                  type="number"
                  step="0.1"
                  value={modelPosition[0]}
                  onChange={(e) => e.target && setModelPosition([parseFloat(e.target.value || '0'), modelPosition[1], modelPosition[2]])}
                  className="w-full text-xs p-1 border rounded"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Y</label>
                <input
                  type="number"
                  step="0.1"
                  value={modelPosition[1]}
                  onChange={(e) => e.target && setModelPosition([modelPosition[0], parseFloat(e.target.value || '0'), modelPosition[2]])}
                  className="w-full text-xs p-1 border rounded"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Z</label>
                <input
                  type="number"
                  step="0.1"
                  value={modelPosition[2]}
                  onChange={(e) => e.target && setModelPosition([modelPosition[0], modelPosition[1], parseFloat(e.target.value || '0')])}
                  className="w-full text-xs p-1 border rounded"
                />
              </div>
            </div>
          </div>

          {/* Rotation Controls */}
          <div className="mb-3">
            <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Rotation (degrees)</label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-slate-500">X</label>
                <input
                  type="number"
                  step="1"
                  value={Math.round(modelRotation[0] * 180 / Math.PI)}
                  onChange={(e) => e.target && setModelRotation([parseFloat(e.target.value || '0') * Math.PI / 180, modelRotation[1], modelRotation[2]])}
                  className="w-full text-xs p-1 border rounded"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Y</label>
                <input
                  type="number"
                  step="1"
                  value={Math.round(modelRotation[1] * 180 / Math.PI)}
                  onChange={(e) => e.target && setModelRotation([modelRotation[0], parseFloat(e.target.value || '0') * Math.PI / 180, modelRotation[2]])}
                  className="w-full text-xs p-1 border rounded"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Z</label>
                <input
                  type="number"
                  step="1"
                  value={Math.round(modelRotation[2] * 180 / Math.PI)}
                  onChange={(e) => e.target && setModelRotation([modelRotation[0], modelRotation[1], parseFloat(e.target.value || '0') * Math.PI / 180])}
                  className="w-full text-xs p-1 border rounded"
                />
              </div>
            </div>
          </div>

          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setShowModelControls(false)}
            className="w-full"
          >
            Close
          </Button>
        </div>
      )}

      {/* Error Overlay */}
      {modelError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 max-w-sm mx-4">
            <div className="flex items-center space-x-2 mb-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Model Loading Error</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{modelError}</p>
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setModelError(null)}
                className="flex-1"
              >
                Dismiss
              </Button>
              <Button 
                size="sm" 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Close Button */}
      {isFullscreen && (
        <Button
          className="absolute top-4 right-20 z-20 bg-transparent"
          variant="outline"
          size="sm"
          onClick={toggleFullscreen}
        >
          Exit Fullscreen
        </Button>
      )}
    </div>
  )
}
