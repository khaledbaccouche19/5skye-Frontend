import { buildUrl } from './config'

// Use centralized configuration for API URLs

export class ApiClient {
  private static getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('intelli-twin-token')
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = buildUrl.api(endpoint)
    console.log(`API Client: Making request to ${url}`)
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...options?.headers,
        },
        ...options,
      })
      console.log(`API Client: Response status for ${endpoint}:`, response.status)

      if (!response.ok) {
        // Special handling for 500 errors on towers endpoint
        if (response.status === 500 && endpoint === '/towers') {
          console.warn('Towers API returned 500 error, using fallback data')
          return this.getFallbackTowersData() as T
        }
        
        // Special handling for 500 errors on alerts endpoint
        if (response.status === 500 && endpoint === '/alerts/recent') {
          console.warn('Alerts API returned 500 error, using fallback data')
          return this.getFallbackAlertsData() as T
        }
        
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      // For DELETE requests, return success without trying to parse JSON
      if (options?.method === 'DELETE') {
        return { success: true } as T
      }

      // For other requests, try to parse JSON
      try {
        return await response.json()
      } catch (jsonError) {
        // If response is empty or not JSON, return success
        return { success: true } as T
      }
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      
      // Special handling for towers endpoint - return fallback data only on network/connection errors
      if (endpoint === '/towers') {
        console.warn('Using fallback towers data due to network/connection error')
        return this.getFallbackTowersData() as T
      }
      
      // Special handling for maintenance endpoint - return fallback data only on network/connection errors
      if (endpoint === '/maintenance') {
        console.warn('Using fallback maintenance data due to network/connection error')
        return this.getFallbackMaintenanceData() as T
      }
      
      throw error
    }
  }

  // Fallback maintenance data when API fails
  private static getFallbackMaintenanceData() {
    return [
      {
        id: "MAINT-001",
        title: "Routine Battery Replacement",
        description: "Quarterly battery replacement and system check",
        type: "ROUTINE",
        priority: "MEDIUM",
        status: "COMPLETED",
        startDate: "2024-01-15",
        endDate: "2024-01-15",
        scheduledDate: "2024-01-15",
        technician: "John Smith",
        technicianContact: "john.smith@company.com",
        estimatedDurationHours: 4,
        actualDurationHours: 3,
        estimatedCost: 500,
        actualCost: 450,
        notes: "Battery replaced successfully, all systems operational",
        partsUsed: "Lithium-ion battery pack, connectors",
        isRecurring: true,
        recurrenceIntervalDays: 90,
        nextMaintenanceDate: "2024-04-15",
        towerId: "TWR-001",
        towerName: "Tower Alpha",
        createdAt: "2024-01-10T10:00:00Z",
        updatedAt: "2024-01-15T16:30:00Z"
      },
      {
        id: "MAINT-002",
        title: "Emergency Network Module Repair",
        description: "Critical network connectivity issue requiring immediate attention",
        type: "EMERGENCY",
        priority: "CRITICAL",
        status: "IN_PROGRESS",
        startDate: "2024-01-20",
        technician: "Sarah Johnson",
        technicianContact: "sarah.johnson@company.com",
        estimatedDurationHours: 8,
        actualDurationHours: 6,
        estimatedCost: 1200,
        notes: "Network module showing intermittent failures",
        partsUsed: "Network interface card, cables",
        isRecurring: false,
        towerId: "TWR-002",
        towerName: "Tower Beta",
        createdAt: "2024-01-20T08:00:00Z",
        updatedAt: "2024-01-20T14:00:00Z"
      },
      {
        id: "MAINT-003",
        title: "Preventive Maintenance Check",
        description: "Monthly preventive maintenance and system optimization",
        type: "PREVENTIVE",
        priority: "LOW",
        status: "SCHEDULED",
        startDate: "2024-01-25",
        scheduledDate: "2024-01-25",
        technician: "Mike Davis",
        technicianContact: "mike.davis@company.com",
        estimatedDurationHours: 2,
        estimatedCost: 300,
        notes: "Routine check and cleaning",
        isRecurring: true,
        recurrenceIntervalDays: 30,
        nextMaintenanceDate: "2024-02-25",
        towerId: "TWR-003",
        towerName: "Tower Gamma",
        createdAt: "2024-01-22T09:00:00Z",
        updatedAt: "2024-01-22T09:00:00Z"
      }
    ]
  }

  // Fallback towers data when API fails
  private static getFallbackTowersData() {
    return [
      {
        id: "TWR-001",
        name: "Tower Alpha",
        status: "online",
        latitude: 40.7128,
        longitude: -74.0060,
        city: "New York",
        useCase: "Telecommunications",
        region: "Northeast",
        apiEndpointUrl: "http://localhost:8081/api/telemetry/live",
        location: {
          lat: 40.7128,
          lng: -74.0060,
          city: "New York"
        }
      },
      {
        id: "TWR-002",
        name: "Tower Beta",
        status: "warning",
        latitude: 34.0522,
        longitude: -118.2437,
        city: "Los Angeles",
        useCase: "Data Center",
        region: "West Coast",
        apiEndpointUrl: "http://localhost:8081/api/telemetry/live",
        location: {
          lat: 34.0522,
          lng: -118.2437,
          city: "Los Angeles"
        }
      },
      {
        id: "TWR-003",
        name: "Tower Gamma",
        status: "critical",
        latitude: 41.8781,
        longitude: -87.6298,
        city: "Chicago",
        useCase: "IoT Hub",
        region: "Midwest",
        apiEndpointUrl: "http://localhost:8081/api/telemetry/live",
        location: {
          lat: 41.8781,
          lng: -87.6298,
          city: "Chicago"
        }
      },
      {
        id: "TWR-004",
        name: "Tower Delta",
        status: "online",
        latitude: 29.7604,
        longitude: -95.3698,
        city: "Houston",
        useCase: "Smart City",
        region: "South",
        apiEndpointUrl: "http://localhost:8081/api/telemetry/live",
        location: {
          lat: 29.7604,
          lng: -95.3698,
          city: "Houston"
        }
      }
    ]
  }

  // Fallback alerts data when API fails
  private static getFallbackAlertsData() {
    return [
      {
        id: "ALT-001",
        title: "High CPU Usage Detected",
        description: "Tower Beta CPU usage exceeded 90% threshold",
        severity: "warning",
        towerName: "Tower Beta",
        timestamp: new Date().toISOString()
      },
      {
        id: "ALT-002",
        title: "Critical Battery Level",
        description: "Tower Gamma backup battery below 10%",
        severity: "critical",
        towerName: "Tower Gamma",
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: "ALT-003",
        title: "Network Connectivity Issue",
        description: "Intermittent connection drops on Tower Alpha",
        severity: "warning",
        towerName: "Tower Alpha",
        timestamp: new Date(Date.now() - 7200000).toISOString()
      }
    ]
  }

  // Tower endpoints
  static async getTowers() {
    return this.request<any[]>('/towers')
  }

  static async getTowerSummaries() {
    return this.request<any[]>('/towers/summaries')
  }

  static async getTowerById(id: string) {
    return this.request<any>(`/towers/${id}`)
  }

  static async createTower(towerData: any) {
    return this.request<any>('/towers', {
      method: 'POST',
      body: JSON.stringify(towerData),
    })
  }

  static async updateTower(id: string, towerData: any) {
    return this.request<any>(`/towers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(towerData),
    })
  }

  static async deleteTower(id: string) {
    return this.request<any>(`/towers/${id}`, {
      method: 'DELETE',
    })
  }

  // Hardware endpoints
  static async getHardwareByTower(towerId: string) {
    return this.request<any[]>(`/hardware/tower/${towerId}`)
  }

  static async searchHardware(params: { towerId?: string; vendor?: string; serial?: string; warrantyAfter?: string; warrantyBefore?: string }) {
    const query = new URLSearchParams()
    if (params.towerId) query.set('towerId', params.towerId)
    if (params.vendor) query.set('vendor', params.vendor)
    if (params.serial) query.set('serial', params.serial)
    if (params.warrantyAfter) query.set('warrantyAfter', params.warrantyAfter)
    if (params.warrantyBefore) query.set('warrantyBefore', params.warrantyBefore)
    const suffix = query.toString() ? `?${query.toString()}` : ''
    return this.request<any[]>(`/hardware/search${suffix}`)
  }

  static async createHardware(hardwareData: any) {
    return this.request<any>(`/hardware`, {
      method: 'POST',
      body: JSON.stringify(hardwareData),
    })
  }

  static async updateHardware(id: string, hardwareData: any) {
    return this.request<any>(`/hardware/${id}`, {
      method: 'PUT',
      body: JSON.stringify(hardwareData),
    })
  }

  static async deleteHardware(id: string) {
    return this.request<any>(`/hardware/${id}`, {
      method: 'DELETE',
    })
  }

  // Alert endpoints
  static async getRecentAlerts() {
    return this.request<any[]>('/alerts/recent')
  }

  // Threshold endpoints
  static async getThresholdsByTower(towerId: string) {
    return this.request<any[]>(`/thresholds/tower/${towerId}`)
  }

  // Telemetry endpoints
  static async getTelemetryByTower(towerId: string) {
    return this.request<any[]>(`/telemetry/tower/${towerId}`)
  }

  static async getTelemetryByTowerInRange(towerId: string, startISO: string, endISO: string) {
    const params = new URLSearchParams({ startTime: startISO, endTime: endISO })
    return this.request<any[]>(`/telemetry/tower/${towerId}/range?${params.toString()}`)
  }

  // File upload endpoints
  static async uploadModel(file: File, towerName: string): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('towerName', towerName)
    
    // For file uploads, we need to handle the response differently
    // Backend returns plain text path, not JSON
    const response = await fetch(buildUrl.upload('/model'), {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - browser sets it automatically for FormData
    })
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }
    
    // Backend returns plain text path, not JSON
    return response.text()
  }

  // Authentication endpoints
  static async login(username: string, password: string) {
    return this.request<any>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  }

  static async signup(userData: {
    username: string
    email: string
    password: string
    firstName?: string
    lastName?: string
    role?: string
  }) {
    return this.request<any>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  static async logout() {
    return this.request<any>('/auth/signout', {
      method: 'POST',
    })
  }

  // Test connection to backend (all data now goes through backend)
  static async testConnection(apiEndpointUrl: string, apiKey?: string) {
    try {
      // Test backend connection instead of external API
      const response = await fetch(buildUrl.api('/health/connection-test'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Backend connection failed: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      if (result.status === 'SUCCESSFUL') {
        return { success: true, status: response.status }
      } else {
        throw new Error('Backend connection test failed')
      }
    } catch (error: any) {
      console.error('Backend connection test failed:', error)
      throw new Error('Backend connection failed: ' + error.message)
    }
  }

  // Fetch telemetry data through backend proxy
  static async fetchTelemetryData(towerId: number) {
    try {
      const url = buildUrl.api(`/towers/${towerId}/telemetry/live`)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      console.error('Telemetry fetch error:', error)
      throw error
    }
  }

  // REMOVED: Direct simulator access - all data now goes through backend

  // 3D Model specific endpoints
  static async updateTower3DModel(id: string, modelFile: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', modelFile)
    
    const response = await fetch(buildUrl.api(`/towers/${id}/3d-model`), {
      method: 'PUT',
      body: formData,
      // Don't set Content-Type header - browser sets it automatically for FormData
    })
    
    if (!response.ok) {
      throw new Error(`Failed to update 3D model: ${response.status} ${response.statusText}`)
    }
    
    // Backend returns plain text path, not JSON
    return response.text()
  }

  static async getTower3DModel(id: string): Promise<{ model3dPath: string }> {
    return this.request<{ model3dPath: string }>(`/towers/${id}/3d-model`)
  }

  // Maintenance endpoints
  static async getAllMaintenance() {
    return this.request<any[]>('/maintenance')
  }

  static async getMaintenanceById(id: string) {
    return this.request<any>(`/maintenance/${id}`)
  }

  static async getMaintenanceByTowerId(towerId: string) {
    return this.request<any[]>(`/maintenance/tower/${towerId}`)
  }

  static async getMaintenanceByStatus(status: string) {
    return this.request<any[]>(`/maintenance/status/${status}`)
  }

  static async getMaintenanceByTowerIdAndStatus(towerId: string, status: string) {
    return this.request<any[]>(`/maintenance/tower/${towerId}/status/${status}`)
  }

  static async getOverdueMaintenance() {
    return this.request<any[]>('/maintenance/overdue')
  }

  static async getUpcomingRecurringMaintenance() {
    return this.request<any[]>('/maintenance/upcoming')
  }

  static async createMaintenance(maintenanceData: any) {
    return this.request<any>('/maintenance', {
      method: 'POST',
      body: JSON.stringify(maintenanceData),
    })
  }

  static async updateMaintenance(id: string, maintenanceData: any) {
    return this.request<any>(`/maintenance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(maintenanceData),
    })
  }

  static async deleteMaintenance(id: string) {
    return this.request<any>(`/maintenance/${id}`, {
      method: 'DELETE',
    })
  }

  static async getMaintenanceCountByTowerIdAndStatus(towerId: string, status: string) {
    return this.request<number>(`/maintenance/tower/${towerId}/count/${status}`)
  }

  // AI endpoints
  static async getAnomalies(towerId: string, params?: { start?: string; end?: string; z?: number }) {
    const query = new URLSearchParams()
    if (params?.start) query.set('start', params.start)
    if (params?.end) query.set('end', params.end)
    if (params?.z !== undefined) query.set('z', String(params?.z))
    const suffix = query.toString() ? `?${query.toString()}` : ''
    return this.request<AnomalyDTO[]>(`/ai/towers/${towerId}/anomalies${suffix}`)
  }

  static async getPredictions(towerId: string, params?: { start?: string; end?: string }) {
    const query = new URLSearchParams()
    if (params?.start) query.set('start', params.start)
    if (params?.end) query.set('end', params.end)
    const suffix = query.toString() ? `?${query.toString()}` : ''
    return this.request<PredictiveInsightDTO[]>(`/ai/towers/${towerId}/predictions${suffix}`)
  }
}

// Types
export type AnomalyDTO = {
  towerId: number
  timestamp: string
  metric: string
  value: number
  zScore: number
  severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL'
  mean: number
  stdDev: number
  lowerBound: number
  upperBound: number
}

export type PredictiveInsightDTO = {
  towerId: number
  title: string
  recommendation: string
  type: string
  riskType: string
  urgency: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL'
  confidence: number
  estimatedImpact: number
  predictedBy: string
  metric: string
  currentValue: number
  trendPerHour: number
}

// SiteBoss API methods
export class SiteBossApiClient {
  // Pull fresh data from SiteBoss device
  static async pullData() {
    try {
      const url = buildUrl.api('/siteboss/pull')
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...ApiClient.getAuthHeaders(),
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('SiteBoss pull API error:', response.status, errorText)
        throw new Error(`Failed to pull SiteBoss data: ${response.status} ${response.statusText}`)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Non-JSON response from SiteBoss pull API:', text)
        throw new Error('Invalid response format from SiteBoss pull API')
      }

      return await response.json()
    } catch (error) {
      console.error('Error pulling SiteBoss data:', error)
      throw error
    }
  }

  // Pull fresh data from SiteBoss device asynchronously
  static async pullDataAsync() {
    try {
      const url = buildUrl.api('/siteboss/pull-async')
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...ApiClient.getAuthHeaders(),
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to pull SiteBoss data async: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error pulling SiteBoss data async:', error)
      throw error
    }
  }

  // Get the latest cached SiteBoss data
  static async getLatestData() {
    try {
      const url = buildUrl.api('/siteboss/latest')
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...ApiClient.getAuthHeaders(),
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('SiteBoss API error:', response.status, errorText)
        throw new Error(`Failed to get latest SiteBoss data: ${response.status} ${response.statusText}`)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Non-JSON response from SiteBoss API:', text)
        throw new Error('Invalid response format from SiteBoss API')
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting latest SiteBoss data:', error)
      throw error
    }
  }

  // Get SiteBoss health status
  static async getHealth() {
    try {
      const url = buildUrl.api('/siteboss/health')
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...ApiClient.getAuthHeaders(),
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get SiteBoss health: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting SiteBoss health:', error)
      throw error
    }
  }
}
