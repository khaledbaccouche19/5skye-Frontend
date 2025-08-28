"use client"

import { motion } from "framer-motion"
import { 
  Plus, 
  Download, 
  Upload, 
  Settings, 
  AlertTriangle, 
  BarChart3, 
  Map, 
  Users,
  Bell,
  Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  badge?: string
  onClick: () => void
}

interface QuickActionsProps {
  className?: string
}

export function QuickActions({ className = "" }: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      id: "add-tower",
      title: "Add Tower",
      description: "Register new tower",
      icon: Plus,
      color: "from-blue-500/20 to-cyan-500/20",
      onClick: () => console.log("Add tower")
    },
    {
      id: "export-data",
      title: "Export Data",
      description: "Download reports",
      icon: Download,
      color: "from-green-500/20 to-emerald-500/20",
      onClick: () => console.log("Export data")
    },
    {
      id: "import-models",
      title: "Import Models",
      description: "Upload 3D models",
      icon: Upload,
      color: "from-purple-500/20 to-violet-500/20",
      onClick: () => console.log("Import models")
    },
    {
      id: "alerts",
      title: "Alerts",
      description: "View notifications",
      icon: AlertTriangle,
      color: "from-red-500/20 to-pink-500/20",
      badge: "3",
      onClick: () => console.log("View alerts")
    },
    {
      id: "analytics",
      title: "Analytics",
      description: "Performance insights",
      icon: BarChart3,
      color: "from-orange-500/20 to-amber-500/20",
      onClick: () => console.log("View analytics")
    },
    {
      id: "map-view",
      title: "Map View",
      description: "Global overview",
      icon: Map,
      color: "from-indigo-500/20 to-blue-500/20",
      onClick: () => console.log("Open map view")
    },
    {
      id: "team",
      title: "Team",
      description: "Manage users",
      icon: Users,
      color: "from-teal-500/20 to-cyan-500/20",
      onClick: () => console.log("Manage team")
    },
    {
      id: "notifications",
      title: "Notifications",
      description: "Configure alerts",
      icon: Bell,
      color: "from-yellow-500/20 to-orange-500/20",
      badge: "5",
      onClick: () => console.log("Configure notifications")
    },
    {
      id: "automation",
      title: "Automation",
      description: "Smart workflows",
      icon: Zap,
      color: "from-pink-500/20 to-rose-500/20",
      onClick: () => console.log("Configure automation")
    },
    {
      id: "settings",
      title: "Settings",
      description: "System configuration",
      icon: Settings,
      color: "from-gray-500/20 to-slate-500/20",
      onClick: () => console.log("Open settings")
    }
  ]

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
        <Badge variant="secondary" className="bg-white/10 text-white/70">
          {actions.length} actions
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              className="w-full h-auto p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
              onClick={action.onClick}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className={`relative p-3 rounded-xl bg-gradient-to-r ${action.color} group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className="h-5 w-5 text-white" />
                  {action.badge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      {action.badge}
                    </Badge>
                  )}
                </div>
                <div className="text-center">
                  <h4 className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-xs text-white/60 mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 