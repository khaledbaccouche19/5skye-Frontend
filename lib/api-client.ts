import { buildUrl } from './config'

// Use centralized configuration for API URLs

export class ApiClient {
  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = buildUrl.api(endpoint)
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      })

      if (!response.ok) {
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
      throw error
    }
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

  // Test connection to external API endpoint
  static async testConnection(apiEndpointUrl: string, apiKey?: string) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`
      }

      // Add timeout to prevent hanging requests
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(apiEndpointUrl, {
        method: 'GET',
        headers,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Connection failed: ${response.status} ${response.statusText}`)
      }

      return { success: true, status: response.status }
    } catch (error: any) {
      console.error('Connection test failed:', error)
      
      // Better error classification
      if (error.name === 'AbortError') {
        throw new Error('Connection failed: Request timed out after 10 seconds')
      } else if (error.message.includes('Failed to fetch')) {
        throw new Error('Connection failed: Network error - backend server may not be running')
      } else if (error.message.includes('CORS')) {
        throw new Error('Connection failed: CORS policy blocks this request')
      } else {
        throw error
      }
    }
  }

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
}
