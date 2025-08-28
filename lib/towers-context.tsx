"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { dummyTowers } from "./dummy-data"

interface Tower {
  id: string
  name: string
  location: { lat: number; lng: number; city: string }
  status: "online" | "warning" | "critical"
  battery: number
  temperature: number
  uptime: number
  networkLoad: number
  useCase: string
  region: string
  components: string[]
  lastMaintenance: string
}

interface TowersContextType {
  towers: Tower[]
  addTower: (
    tower: Omit<Tower, "id" | "status" | "battery" | "temperature" | "uptime" | "networkLoad" | "lastMaintenance">,
  ) => void
  updateTower: (id: string, updates: Partial<Tower>) => void
  deleteTower: (id: string) => void
  getTowerById: (id: string) => Tower | undefined
}

const TowersContext = createContext<TowersContextType | undefined>(undefined)

export function TowersProvider({ children }: { children: ReactNode }) {
  const [towers, setTowers] = useState<Tower[]>(dummyTowers)

  const addTower = (
    towerData: Omit<Tower, "id" | "status" | "battery" | "temperature" | "uptime" | "networkLoad" | "lastMaintenance">,
  ) => {
    const newTower: Tower = {
      ...towerData,
      id: `TWR-${String(towers.length + 1).padStart(3, "0")}`,
      status: "online",
      battery: Math.floor(Math.random() * 40) + 60, // 60-100%
      temperature: Math.floor(Math.random() * 20) + 35, // 35-55°C
      uptime: Math.floor(Math.random() * 5) + 95, // 95-100%
      networkLoad: Math.floor(Math.random() * 60) + 20, // 20-80%
      lastMaintenance: new Date().toISOString(),
    }
    setTowers((prev) => [...prev, newTower])
  }

  const updateTower = (id: string, updates: Partial<Tower>) => {
    setTowers((prev) => prev.map((tower) => (tower.id === id ? { ...tower, ...updates } : tower)))
  }

  const deleteTower = (id: string) => {
    setTowers((prev) => prev.filter((tower) => tower.id !== id))
  }

  const getTowerById = (id: string) => {
    return towers.find((tower) => tower.id === id)
  }

  return (
    <TowersContext.Provider
      value={{
        towers,
        addTower,
        updateTower,
        deleteTower,
        getTowerById,
      }}
    >
      {children}
    </TowersContext.Provider>
  )
}

export function useTowers() {
  const context = useContext(TowersContext)
  if (context === undefined) {
    throw new Error("useTowers must be used within a TowersProvider")
  }
  return context
}
