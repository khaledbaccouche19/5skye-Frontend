// Centralized configuration for the application
export const config = {
  // Backend API configuration
  backend: {
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8088',
    apiPath: '/api',
    modelsPath: '/models',
    uploadPath: '/upload',
  },
  
  // Simulator configuration
  simulator: {
    baseUrl: process.env.NEXT_PUBLIC_SIMULATOR_URL || 'http://localhost:8080',
    apiPath: '/api',
    telemetryEndpoint: '/telemetry/live',
    towersEndpoint: '/towers/summaries',
  },
  
  // Frontend configuration
  frontend: {
    port: process.env.NEXT_PUBLIC_FRONTEND_PORT || 3000,
    baseUrl: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
  },
  
  // 3D Model configuration
  models: {
    maxFileSize: 50 * 1024 * 1024, // 50MB in bytes
    supportedFormats: ['.glb', '.gltf'],
    uploadEndpoint: '/upload/model',
  },
  
  // Cesium configuration
  cesium: {
    accessToken: process.env.NEXT_PUBLIC_CESIUM_ACCESS_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4OGM5ODQwZi04Mjg3LTRhOWUtODE4Ni1lNjY4MWYyZWVhMTciLCJpZCI6MzE4NTAzLCJpYXQiOjE3NTM4NjYzNzZ9.MaHbYfTkIsEXD7p27X1CQw4yRA-gfLzQZ0j-XwYkyCo',
    baseUrl: '/cesium',
  },
} as const

// Helper functions for building URLs
export const buildUrl = {
  api: (endpoint: string) => `${config.backend.baseUrl}${config.backend.apiPath}${endpoint}`,
  simulator: (endpoint: string) => `${config.simulator.baseUrl}${config.simulator.apiPath}${endpoint}`,
  model: (modelPath: string) => {
    if (modelPath.startsWith('http://') || modelPath.startsWith('https://')) {
      return modelPath
    }
    if (modelPath.startsWith('/')) {
      return `${config.backend.baseUrl}${modelPath}`
    }
    return `${config.backend.baseUrl}${config.backend.modelsPath}/${modelPath}`
  },
  upload: (endpoint: string) => `${config.backend.baseUrl}${config.backend.apiPath}${config.backend.uploadPath}${endpoint}`,
}
