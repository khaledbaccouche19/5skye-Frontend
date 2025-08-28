// Cesium Manager to prevent multiple instances
class CesiumManager {
  private static instance: CesiumManager
  private activeViewers: Map<string, any> = new Map()
  private isInitializing = false

  private constructor() {}

  static getInstance(): CesiumManager {
    if (!CesiumManager.instance) {
      CesiumManager.instance = new CesiumManager()
    }
    return CesiumManager.instance
  }

  async createViewer(containerId: string, container: HTMLElement, options: any = {}) {
    // Check if a viewer already exists for this container
    if (this.activeViewers.has(containerId)) {
      console.warn(`Cesium viewer already exists for container: ${containerId}`)
      return this.activeViewers.get(containerId)
    }

    // Prevent multiple simultaneous initializations
    if (this.isInitializing) {
      console.warn("Cesium is already being initialized, please wait...")
      return null
    }

    this.isInitializing = true

    try {
      console.log("Setting up Cesium environment...")
      
      // Set up Cesium base URL
      if (typeof window !== 'undefined') {
        (window as any).CESIUM_BASE_URL = '/cesium/'
        console.log("Set CESIUM_BASE_URL to:", (window as any).CESIUM_BASE_URL)
      }

      // Import Cesium
      console.log("Importing Cesium library...")
      const Cesium = await import("cesium")
      console.log("Cesium imported successfully:", Cesium)
      
      // Set access token
      Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4OGM5ODQwZi04Mjg3LTRhOWUtODE4Ni1lNjY4MWYyZWVhMTciLCJpZCI6MzE4NTAzLCJpYXQiOjE3NTM4NjYzNzZ9.MaHbYfTkIsEXD7p27X1CQw4yRA-gfLzQZ0j-XwYkyCo"
      console.log("Cesium access token set")

      // Verify container dimensions
      console.log("Container dimensions:", {
        width: container.offsetWidth,
        height: container.offsetHeight,
        clientWidth: container.clientWidth,
        clientHeight: container.clientHeight
      })

      // Create viewer with default options
      const defaultOptions = {
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        animation: false,
        timeline: false,
        fullscreenButton: false,
        infoBox: false,
        selectionIndicator: false,
        ...options
      }

      console.log("Creating Cesium viewer with options:", defaultOptions)
      const viewer = new Cesium.Viewer(container, {
        ...defaultOptions,
        targetFrameRate: 60,
        requestRenderMode: true,
        maximumRenderTimeChange: Infinity,
      })
      
      console.log("Cesium viewer created successfully")
      
      // Store the viewer
      this.activeViewers.set(containerId, viewer)
      
      console.log(`Cesium viewer created for container: ${containerId}`)
      return viewer

    } catch (error) {
      console.error("Failed to create Cesium viewer:", error)
      this.isInitializing = false
      throw error
    } finally {
      this.isInitializing = false
    }
  }

  destroyViewer(containerId: string) {
    const viewer = this.activeViewers.get(containerId)
    if (viewer) {
      try {
        viewer.destroy()
        this.activeViewers.delete(containerId)
        console.log(`Cesium viewer destroyed for container: ${containerId}`)
      } catch (error) {
        console.warn(`Error destroying Cesium viewer for container ${containerId}:`, error)
      }
    }
  }

  getViewer(containerId: string) {
    return this.activeViewers.get(containerId)
  }

  hasViewer(containerId: string) {
    return this.activeViewers.has(containerId)
  }

  getActiveViewerCount() {
    return this.activeViewers.size
  }

  destroyAllViewers() {
    this.activeViewers.forEach((viewer, containerId) => {
      this.destroyViewer(containerId)
    })
  }
}

export const cesiumManager = CesiumManager.getInstance() 