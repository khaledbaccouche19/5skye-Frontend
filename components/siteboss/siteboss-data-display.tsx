'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { SiteBossApiClient } from '@/lib/api-client'
import { 
  RefreshCw, 
  Thermometer, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  MapPin,
  Activity,
  Zap,
  Wifi,
  Battery,
  Gauge,
  Wind,
  Droplets,
  Signal,
  Eye,
  EyeOff
} from 'lucide-react'

interface SiteBossData {
  success: boolean
  timestamp: string
  siteName: string
  serial: string
  uptime: string
  sensorCount: number
  data: {
    unit: {
      siteName: string
      serial: string
      version: string
      hardware: string
      location: {
        latitude: number
        longitude: number
      }
      uptime: string
      timestamp: {
        date: string
        time: string
        lastUpdated: string
      }
    }
    sensors: Array<{
      id: string
      group: string
      type: string
      name: string
      status: string
      value: string
      alertLevel: 'normal' | 'warning' | 'critical'
      enabled: boolean
    }>
    summary: {
      totalSensors: number
      sensorsByType: Record<string, number>
      alertCounts: {
        normal: number
        warning: number
        critical: number
      }
      lastPull: string
    }
  }
}

interface SiteBossDataDisplayProps {
  config?: {
    host: string
    username: string
    password: string
    enabled: boolean
  }
}

export function SiteBossDataDisplay({ config }: SiteBossDataDisplayProps) {
  const [data, setData] = useState<SiteBossData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [showSensors, setShowSensors] = useState(true)
  const [pullStatus, setPullStatus] = useState<'idle' | 'success' | 'failed' | 'pulling'>('idle')

  // Derived timestamps from payload
  const deviceTimeStr = data?.data?.unit?.timestamp
    ? `${data.data.unit.timestamp.date} ${data.data.unit.timestamp.time}`
    : null

  const lastPullStr = data?.data?.summary?.lastPull
    ? new Date(data.data.summary.lastPull).toLocaleTimeString()
    : (data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : null)

  // Debug logging
  console.log('SiteBossDataDisplay received config:', config)

  const fetchData = async () => {
    if (!config?.enabled) {
      console.log('SiteBoss disabled, skipping data fetch')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await SiteBossApiClient.getLatestData()
      
      // Check if data has actually changed by comparing timestamps
      const newLastPull = result?.data?.summary?.lastPull
      const currentLastPull = data?.data?.summary?.lastPull
      
      if (newLastPull !== currentLastPull) {
        console.log('🔄 SiteBoss data updated:', {
          old: currentLastPull,
          new: newLastPull
        })
        setData(result)
        setLastRefresh(new Date())
        
      } else {
        console.log('📊 SiteBoss data unchanged, skipping UI update')
      }
    } catch (err: any) {
      console.error('SiteBoss fetch error:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const pullFreshData = async () => {
    if (!config?.enabled) {
      console.log('SiteBoss disabled, skipping data pull')
      return
    }

    setIsLoading(true)
    setError(null)
    setPullStatus('pulling')

    try {
      // Trigger a fresh pull on the backend
      await SiteBossApiClient.pullData()
      
      // Wait a moment for the backend to process the data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Read the latest data and check if it's actually new
      const latest = await SiteBossApiClient.getLatestData()
      const newLastPull = latest?.data?.summary?.lastPull
      const currentLastPull = data?.data?.summary?.lastPull
      
      if (newLastPull !== currentLastPull) {
        console.log('✅ Fresh data pulled successfully:', {
          old: currentLastPull,
          new: newLastPull
        })
        setData(latest)
        setLastRefresh(new Date())
        setPullStatus('success')
      } else {
        console.log('⚠️ Pull completed but data unchanged')
        setPullStatus('success') // Still show success since pull completed
      }
      
      // Reset status after 3 seconds
      setTimeout(() => setPullStatus('idle'), 3000)
    } catch (err: any) {
      console.error('SiteBoss pull error:', err)
      setError(err.message)
      setPullStatus('failed')
      
      // Reset status after 5 seconds
      setTimeout(() => setPullStatus('idle'), 5000)
    } finally {
      setIsLoading(false)
    }
  }


  // Auto-refresh cached latest every 2 seconds by default
  useEffect(() => {
    console.log('🔧 SiteBoss config changed:', config)
    if (!config?.enabled) {
      console.log('🔧 SiteBoss disabled, clearing data')
      setData(null)
      setError(null)
      setPullStatus('idle')
      return
    }

    console.log('🔧 SiteBoss enabled, starting auto refresh of latest cache')
    // Read from backend cache immediately
    fetchData()
    // Poll cached latest every 2s to avoid long-running pulls
    const interval = setInterval(fetchData, 2000)
    return () => clearInterval(interval)
  }, [config?.enabled, config?.host, config?.username, config?.password])


  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />
    }
  }

  const getAlertBadge = (level: string) => {
    switch (level) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>
      case 'warning':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Warning</Badge>
      default:
        return <Badge variant="secondary">Normal</Badge>
    }
  }

  const getSensorIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'temperature':
        return <Thermometer className="w-4 h-4" />
      case 'contact closure':
        return <Shield className="w-4 h-4" />
      case 'output':
        return <Zap className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  if (!config?.enabled) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-orange-500/20 rounded-full">
            <AlertTriangle className="w-8 h-8 text-orange-400" />
          </div>
          <h3 className="text-xl font-semibold text-white">SiteBoss Integration Disabled</h3>
          <p className="text-white/60 max-w-md">
            SiteBoss integration is not configured for this tower. Enable it in the tower settings to view real-time sensor data.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">SiteBoss Real-Time Data</h3>
              <p className="text-sm text-white/60">
                Auto-updating every 30s
                {deviceTimeStr ? ` • Device time: ${deviceTimeStr}` : ''}
                {lastPullStr ? ` • Last pull: ${lastPullStr}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={fetchData}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={pullFreshData}
              disabled={isLoading}
              size="sm"
              className={`${
                pullStatus === 'success' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : pullStatus === 'failed'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {pullStatus === 'pulling' ? 'Pulling...' : 'Pull Fresh'}
            </Button>
          </div>
        </div>
      </div>

      {/* Pull Status Indicator */}
      {config?.enabled && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              pullStatus === 'success' ? 'bg-green-500' :
              pullStatus === 'failed' ? 'bg-red-500' :
              pullStatus === 'pulling' ? 'bg-yellow-500 animate-pulse' :
              'bg-gray-500'
            }`} />
            <div>
              <p className="text-sm font-medium text-white">
                {pullStatus === 'success' ? '✅ Pull Successful' :
                 pullStatus === 'failed' ? '❌ Pull Failed' :
                 pullStatus === 'pulling' ? '🔄 Pulling Data...' :
                 '⏸️ Ready to Pull'}
              </p>
              <p className="text-xs text-white/60">
                {pullStatus === 'success' ? 'Data updated successfully' :
                 pullStatus === 'failed' ? 'Failed to pull fresh data' :
                 pullStatus === 'pulling' ? 'Requesting fresh data from device...' :
                 'Click "Pull Fresh" to get latest data'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-4">
          <div className="flex items-center space-x-3">
            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-red-400">Connection Error</h4>
              <p className="text-sm text-red-300 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !data && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Loading SiteBoss Data</h3>
            <p className="text-white/60">Fetching real-time sensor data from SiteBoss device...</p>
          </div>
        </div>
      )}

      {/* Data Display */}
      {data && (
        <div className="space-y-6">
          {/* Site Information */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <MapPin className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Site Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-white/60 uppercase tracking-wider">Site Name</span>
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                </div>
                <div className="text-lg font-semibold text-white">{data.data.unit.siteName}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-white/60 uppercase tracking-wider">Serial Number</span>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                </div>
                <div className="text-lg font-semibold text-white">{data.data.unit.serial}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-white/60 uppercase tracking-wider">Version</span>
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                </div>
                <div className="text-lg font-semibold text-white">{data.data.unit.version}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-white/60 uppercase tracking-wider">Uptime</span>
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                </div>
                <div className="text-lg font-semibold text-white">{data.data.unit.uptime}</div>
              </div>
            </div>
            <div className="mt-6 bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="w-4 h-4 text-white/60" />
                <span className="text-sm font-medium text-white/60">Location</span>
              </div>
              <p className="text-sm text-white">
                {data.data.unit.location.latitude.toFixed(6)}, {data.data.unit.location.longitude.toFixed(6)}
              </p>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Gauge className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Sensor Summary</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  <span className="text-2xl font-bold text-green-400">{data.data.summary.alertCounts.normal}</span>
                </div>
                <p className="text-sm text-white/60">Normal</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-center mb-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
                  <span className="text-2xl font-bold text-yellow-400">{data.data.summary.alertCounts.warning}</span>
                </div>
                <p className="text-sm text-white/60">Warning</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-center mb-2">
                  <XCircle className="w-5 h-5 text-red-400 mr-2" />
                  <span className="text-2xl font-bold text-red-400">{data.data.summary.alertCounts.critical}</span>
                </div>
                <p className="text-sm text-white/60">Critical</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-center mb-2">
                  <Activity className="w-5 h-5 text-blue-400 mr-2" />
                  <span className="text-2xl font-bold text-white">{data.data.summary.totalSensors}</span>
                </div>
                <p className="text-sm text-white/60">Total Sensors</p>
              </div>
            </div>
          </div>

          {/* Sensors */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Activity className="w-5 h-5 text-orange-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Sensor Data</h3>
                <Badge variant="outline" className="text-xs">
                  {data.data.sensors.length} sensors
                </Badge>
              </div>
              <Button
                onClick={() => setShowSensors(!showSensors)}
                variant="outline"
                size="sm"
                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                {showSensors ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showSensors ? 'Hide' : 'Show'} Sensors
              </Button>
            </div>
            
            {showSensors && (
              <div className="space-y-3">
                {data.data.sensors.map((sensor, index) => (
                  <div
                    key={sensor.id || index}
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-white/10 rounded-lg">
                        {getSensorIcon(sensor.type)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{sensor.name}</p>
                        <p className="text-sm text-white/60">
                          {sensor.type} • {sensor.group}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold text-white text-lg">{sensor.value}</p>
                        <p className="text-sm text-white/60">{sensor.status}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getAlertIcon(sensor.alertLevel)}
                        {getAlertBadge(sensor.alertLevel)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Last Update Info removed per request */}
        </div>
      )}
    </div>
  )
}
