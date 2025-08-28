import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string | number
  unit?: string
  icon: LucideIcon
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  status?: "success" | "warning" | "error" | "neutral"
  className?: string
}

export function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  trend = "neutral",
  trendValue,
  status = "neutral",
  className,
}: MetricCardProps) {
  const statusColors = {
    success: "border-green-200 bg-green-50 dark:bg-green-900/20",
    warning: "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20",
    error: "border-red-200 bg-red-50 dark:bg-red-900/20",
    neutral: "border-slate-200 bg-white dark:bg-slate-800",
  }

  const iconColors = {
    success: "text-green-600",
    warning: "text-yellow-600",
    error: "text-red-600",
    neutral: "text-blue-600",
  }

  return (
    <Card className={cn(statusColors[status], className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
            <div className="flex items-baseline space-x-1">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
              {unit && <span className="text-sm text-slate-500 dark:text-slate-400">{unit}</span>}
            </div>
            {trendValue && (
              <div className="flex items-center mt-1">
                {trend === "up" && <TrendingUp className="h-4 w-4 text-green-500 mr-1" />}
                {trend === "down" && <TrendingDown className="h-4 w-4 text-red-500 mr-1" />}
                <span
                  className={cn(
                    "text-sm",
                    trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-slate-600",
                  )}
                >
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          <div
            className={cn(
              "p-3 rounded-full",
              status === "success"
                ? "bg-green-100 dark:bg-green-800"
                : status === "warning"
                  ? "bg-yellow-100 dark:bg-yellow-800"
                  : status === "error"
                    ? "bg-red-100 dark:bg-red-800"
                    : "bg-blue-100 dark:bg-blue-800",
            )}
          >
            <Icon className={cn("h-6 w-6", iconColors[status])} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
