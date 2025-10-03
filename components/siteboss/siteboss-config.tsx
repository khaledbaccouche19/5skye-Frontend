'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SiteBossApiClient } from '@/lib/api-client'
import { config } from '@/lib/config'
import { CheckCircle, XCircle, AlertCircle, Settings, Wifi, WifiOff } from 'lucide-react'

interface SiteBossConfigProps {
  onConfigChange?: (config: SiteBossConfig) => void
}

interface SiteBossConfig {
  host: string
  username: string
  password: string
  enabled: boolean
}

export function SiteBossConfig({ onConfigChange }: SiteBossConfigProps) {
  const [config, setConfig] = useState<SiteBossConfig>({
    host: process.env.NEXT_PUBLIC_SITEBOSS_HOST || '10.9.1.19',
    username: process.env.NEXT_PUBLIC_SITEBOSS_USERNAME || 'admin',
    password: process.env.NEXT_PUBLIC_SITEBOSS_PASSWORD || 'password',
    enabled: process.env.NEXT_PUBLIC_SITEBOSS_ENABLED === 'true' || false,
  })

  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'success' | 'error'
    message: string
  }>({ status: 'idle', message: '' })

  const [healthStatus, setHealthStatus] = useState<{
    status: 'unknown' | 'up' | 'down'
    lastCheck: Date | null
  }>({ status: 'unknown', lastCheck: null })

  // Check health status on component mount
  useEffect(() => {
    checkHealth()
  }, [])

  const checkHealth = async () => {
    try {
      const health = await SiteBossApiClient.getHealth()
      setHealthStatus({
        status: health.status === 'UP' ? 'up' : 'down',
        lastCheck: new Date(),
      })
    } catch (error) {
      setHealthStatus({
        status: 'down',
        lastCheck: new Date(),
      })
    }
  }

  const testConnection = async () => {
    setIsTesting(true)
    setTestResult({ status: 'idle', message: '' })

    try {
      // Test with current configuration
      const result = await SiteBossApiClient.pullData()
      
      if (result.success) {
        setTestResult({
          status: 'success',
          message: `Successfully connected to SiteBoss device. Site: ${result.siteName || 'Unknown'}`,
        })
        setHealthStatus({
          status: 'up',
          lastCheck: new Date(),
        })
      } else {
        setTestResult({
          status: 'error',
          message: `Connection failed: ${result.error || 'Unknown error'}`,
        })
        setHealthStatus({
          status: 'down',
          lastCheck: new Date(),
        })
      }
    } catch (error: any) {
      setTestResult({
        status: 'error',
        message: `Connection failed: ${error.message}`,
      })
      setHealthStatus({
        status: 'down',
        lastCheck: new Date(),
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleConfigChange = (field: keyof SiteBossConfig, value: string | boolean) => {
    const newConfig = { ...config, [field]: value }
    setConfig(newConfig)
    onConfigChange?.(newConfig)
    
    // Reset test result when config changes
    setTestResult({ status: 'idle', message: '' })
  }

  const getHealthBadge = () => {
    switch (healthStatus.status) {
      case 'up':
        return <Badge variant="default" className="bg-green-500"><Wifi className="w-3 h-3 mr-1" />Connected</Badge>
      case 'down':
        return <Badge variant="destructive"><WifiOff className="w-3 h-3 mr-1" />Disconnected</Badge>
      default:
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Unknown</Badge>
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <CardTitle>SiteBoss Configuration</CardTitle>
          </div>
          {getHealthBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Switch */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="enabled">Enable SiteBoss Integration</Label>
            <p className="text-sm text-muted-foreground">
              Connect to real SiteBoss tower monitoring devices
            </p>
          </div>
          <Switch
            id="enabled"
            checked={config.enabled}
            onCheckedChange={(checked) => handleConfigChange('enabled', checked)}
          />
        </div>

        {config.enabled && (
          <>
            {/* Host Configuration */}
            <div className="space-y-2">
              <Label htmlFor="host">Device Host/IP</Label>
              <Input
                id="host"
                type="text"
                placeholder="10.9.1.19"
                value={config.host}
                onChange={(e) => handleConfigChange('host', e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                IP address or hostname of your SiteBoss device
              </p>
            </div>

            {/* Username Configuration */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                value={config.username}
                onChange={(e) => handleConfigChange('username', e.target.value)}
              />
            </div>

            {/* Password Configuration */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="password"
                value={config.password}
                onChange={(e) => handleConfigChange('password', e.target.value)}
              />
            </div>

            {/* Test Connection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Connection Test</h4>
                  <p className="text-sm text-muted-foreground">
                    Test the connection to your SiteBoss device
                  </p>
                </div>
                <Button
                  onClick={testConnection}
                  disabled={isTesting}
                  variant="outline"
                  size="sm"
                >
                  {isTesting ? 'Testing...' : 'Test Connection'}
                </Button>
              </div>

              {/* Test Result */}
              {testResult.status !== 'idle' && (
                <Alert className={testResult.status === 'success' ? 'border-green-500' : 'border-red-500'}>
                  <div className="flex items-center space-x-2">
                    {testResult.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <AlertDescription>{testResult.message}</AlertDescription>
                  </div>
                </Alert>
              )}

              {/* Health Status */}
              {healthStatus.lastCheck && (
                <div className="text-xs text-muted-foreground">
                  Last checked: {healthStatus.lastCheck.toLocaleTimeString()}
                </div>
              )}
            </div>

            {/* Current Configuration Summary */}
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2">Current Configuration</h4>
              <div className="space-y-1 text-sm">
                <div><strong>Host:</strong> {config.host}</div>
                <div><strong>Username:</strong> {config.username}</div>
                <div><strong>Password:</strong> {'*'.repeat(config.password.length)}</div>
                <div><strong>Status:</strong> {config.enabled ? 'Enabled' : 'Disabled'}</div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
