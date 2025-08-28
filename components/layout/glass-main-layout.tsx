"use client"

import { motion } from "framer-motion"
import { GlassSidebar } from "./glass-sidebar"
import { GlassTopbar } from "./glass-topbar"
import { useThemeSafe } from "@/hooks/use-theme-safe"
import { cn } from "@/lib/utils"

interface GlassMainLayoutProps {
  children: React.ReactNode
}

export function GlassMainLayout({ children }: GlassMainLayoutProps) {
  const { theme, mounted } = useThemeSafe()

  // Prevent hydration mismatch by not rendering theme-dependent classes until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen theme-transition">
        {/* Background with theme support */}
        <div className="fixed inset-0 -z-10">
          <div
            className={cn(
              "absolute inset-0 transition-all duration-1000",
              "bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800"
            )}
          />
          <div
            className={cn(
              "absolute inset-0 opacity-30 transition-opacity duration-1000",
              "bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"
            )}
          />
        </div>

        <div className="flex h-screen overflow-hidden">
          <GlassSidebar />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <GlassTopbar />
            
            <main className="flex-1 overflow-y-auto p-6 theme-transition">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="h-full"
              >
                {children}
              </motion.div>
            </main>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen theme-transition">
      {/* Background with theme support */}
      <div className="fixed inset-0 -z-10">
        <div
          className={cn(
            "absolute inset-0 transition-all duration-1000",
            theme === 'dark'
              ? "bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800"
              : "bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100"
          )}
        />
        <div
          className={cn(
            "absolute inset-0 opacity-30 transition-opacity duration-1000",
            theme === 'dark'
              ? "bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"
              : "bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]"
          )}
        />
      </div>

      <div className="flex h-screen overflow-hidden">
        <GlassSidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <GlassTopbar />
          
          <main className="flex-1 overflow-y-auto p-6 theme-transition">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  )
}
