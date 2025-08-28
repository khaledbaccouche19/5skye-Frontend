"use client"

import { X, Battery, Thermometer, Wifi, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MetricCard } from "./metric-card"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface TowerDrawerProps {
  tower: {
    id: string
    name: string
    location: { lat: number; lng: number; city: string }
    status: string
    battery: number
    temperature: number
    uptime: number
    networkLoad: number
    useCase: string
    region: string
    components: string[]
  }
  isOpen: boolean
  onClose: () => void
}

export function TowerDrawer({ tower, isOpen, onClose }: TowerDrawerProps) {
  const router = useRouter()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "warning":
        return "bg-yellow-500"
      case "critical":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getBatteryStatus = (battery: number) => {
    if (battery > 50) return "success"
    if (battery > 20) return "warning"
    return "error"
  }

  const getTemperatureStatus = (temp: number) => {
    if (temp < 45) return "success"
    if (temp < 55) return "warning"
    return "error"
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />}

      {/* Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-96 bg-white dark:bg-slate-800 shadow-xl transform transition-transform duration-300 ease-in-out z-50",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Tower Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto h-full pb-20">
          {/* Tower Header */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className={cn("w-3 h-3 rounded-full", getStatusColor(tower.status))} />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{tower.name}</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {tower.id} • {tower.location.city}
            </p>
            <div className="flex space-x-2">
              <Badge variant="outline">{tower.useCase}</Badge>
              <Badge variant="outline">{tower.region}</Badge>
            </div>
          </div>

          {/* Metrics */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-900 dark:text-white">Real-time Metrics</h4>
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                title="Battery"
                value={tower.battery}
                unit="%"
                icon={Battery}
                status={getBatteryStatus(tower.battery)}
                className="text-xs"
              />
              <MetricCard
                title="Temperature"
                value={tower.temperature}
                unit="°C"
                icon={Thermometer}
                status={getTemperatureStatus(tower.temperature)}
                className="text-xs"
              />
              <MetricCard
                title="Uptime"
                value={tower.uptime}
                unit="%"
                icon={Activity}
                status="success"
                className="text-xs"
              />
              <MetricCard
                title="Network Load"
                value={tower.networkLoad}
                unit="%"
                icon={Wifi}
                status={tower.networkLoad > 80 ? "warning" : "success"}
                className="text-xs"
              />
            </div>
          </div>

          {/* Components */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-900 dark:text-white">Installed Components</h4>
            <div className="space-y-2">
              {tower.components.map((component, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700 rounded-md"
                >
                  <span className="text-sm text-slate-700 dark:text-slate-300">{component}</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button className="w-full" size="sm" onClick={() => router.push(`/towers/${tower.id}`)}>
              View Full Details & 3D Model
            </Button>
            <Button variant="outline" className="w-full bg-transparent" size="sm">
              View Telemetry
            </Button>
            <Button variant="outline" className="w-full bg-transparent" size="sm">
              Maintenance History
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
