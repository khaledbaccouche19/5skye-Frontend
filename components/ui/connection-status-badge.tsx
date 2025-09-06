"use client"

import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Cpu, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConnectionStatusBadgeProps {
  isConnected: boolean
  dataSource: 'real-world' | 'simulator' | 'fallback'
  className?: string
}

export function ConnectionStatusBadge({ 
  isConnected, 
  dataSource, 
  className 
}: ConnectionStatusBadgeProps) {
  const getStatusConfig = () => {
    if (!isConnected) {
      return {
        label: "Disconnected",
        variant: "destructive" as const,
        icon: WifiOff,
        description: "No data source"
      }
    }

    switch (dataSource) {
      case 'real-world':
        return {
          label: "Real-World",
          variant: "default" as const,
          icon: Globe,
          description: "Connected to real tower data"
        }
      case 'simulator':
        return {
          label: "Simulator",
          variant: "secondary" as const,
          icon: Cpu,
          description: "Using simulated data"
        }
      case 'fallback':
        return {
          label: "Fallback",
          variant: "outline" as const,
          icon: Wifi,
          description: "Using fallback data"
        }
      default:
        return {
          label: "Unknown",
          variant: "outline" as const,
          icon: Wifi,
          description: "Unknown data source"
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <Badge 
      variant={config.variant}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 text-xs font-medium",
        className
      )}
      title={config.description}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

// Helper function to determine data source from tower data
export function getTowerDataSource(tower: any): 'real-world' | 'simulator' | 'fallback' {
  // Check if tower has an API endpoint configured
  if (tower?.apiEndpointUrl) {
    // Check if it's pointing to the simulator (port 8080 or contains simulator)
    if (tower.apiEndpointUrl.includes(':8080') || 
        tower.apiEndpointUrl.includes('localhost:8080') ||
        tower.apiEndpointUrl.includes('simulator') ||
        tower.apiEndpointUrl.includes('telemetry-simulator')) {
      return 'simulator'
    }
    // Otherwise it's a real-world endpoint
    return 'real-world'
  }
  
  // No API endpoint means it's using fallback/static data
  return 'fallback'
}

// Helper function to check if tower is connected
export function isTowerConnected(tower: any): boolean {
  return !!(tower?.apiEndpointUrl)
}
