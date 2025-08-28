"use client"

import { useState } from "react"
import { AlertTriangle, Info, AlertCircle, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AlertItemProps {
  alert: {
    id: string
    timestamp: string
    message: string
    severity: "critical" | "warning" | "info"
    towerId: string
    towerName: string
    resolved: boolean
  }
}

export function AlertItem({ alert }: AlertItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const severityConfig = {
    critical: {
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-200",
      badgeVariant: "destructive" as const,
    },
    warning: {
      icon: AlertTriangle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      borderColor: "border-yellow-200",
      badgeVariant: "secondary" as const,
    },
    info: {
      icon: Info,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200",
      badgeVariant: "outline" as const,
    },
  }

  const config = severityConfig[alert.severity]
  const Icon = config.icon

  return (
    <Card className={cn(config.bgColor, config.borderColor, alert.resolved && "opacity-60")}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <Icon className={cn("h-5 w-5 mt-0.5", config.color)} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <Badge variant={config.badgeVariant} className="text-xs">
                  {alert.severity.toUpperCase()}
                </Badge>
                <span className="text-sm text-slate-500">{new Date(alert.timestamp).toLocaleString()}</span>
                {alert.resolved && (
                  <Badge variant="outline" className="text-xs">
                    RESOLVED
                  </Badge>
                )}
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">{alert.message}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {alert.towerName} ({alert.towerId})
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="ml-2">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Alert ID:</span>
                <p className="text-slate-600 dark:text-slate-400">{alert.id}</p>
              </div>
              <div>
                <span className="font-medium">Tower:</span>
                <p className="text-slate-600 dark:text-slate-400">{alert.towerName}</p>
              </div>
            </div>
            <div className="mt-3 flex space-x-2">
              <Button size="sm" variant="outline">
                View Tower
              </Button>
              {!alert.resolved && <Button size="sm">Mark Resolved</Button>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
