import type React from "react"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <div className="lg:ml-64">
        <Topbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
