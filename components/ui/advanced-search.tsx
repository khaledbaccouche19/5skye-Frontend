"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, X, MapPin, Activity, Battery, Thermometer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SearchFilters {
  query: string
  region: string
  status: string
  batteryLevel: string
  temperature: string
  useCase: string
}

interface AdvancedSearchProps {
  onFiltersChange: (filters: SearchFilters) => void
  className?: string
}

export function AdvancedSearch({ onFiltersChange, className = "" }: AdvancedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    region: "all",
    status: "all",
    batteryLevel: "all",
    temperature: "all",
    useCase: "all"
  })

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      query: "",
      region: "all",
      status: "all",
      batteryLevel: "all",
      temperature: "all",
      useCase: "all"
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== "all" && value !== "")

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
        <Input
          placeholder="Search towers, locations, or components..."
          value={filters.query}
          onChange={(e) => handleFilterChange("query", e.target.value)}
          className="pl-10 bg-white/5 backdrop-blur-xl border-white/10 text-white placeholder:text-white/50 rounded-2xl"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-8 w-8"
        >
          <Filter className="h-4 w-4 text-white/50" />
        </Button>
      </div>

      {/* Active Filters */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {filters.query && (
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                Search: {filters.query}
                <button
                  onClick={() => handleFilterChange("query", "")}
                  className="ml-1 hover:text-blue-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.region !== "all" && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                <MapPin className="h-3 w-3 mr-1" />
                {filters.region}
                <button
                  onClick={() => handleFilterChange("region", "all")}
                  className="ml-1 hover:text-green-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.status !== "all" && (
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                <Activity className="h-3 w-3 mr-1" />
                {filters.status}
                <button
                  onClick={() => handleFilterChange("status", "all")}
                  className="ml-1 hover:text-purple-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-white/60 hover:text-white text-xs"
            >
              Clear all
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl"
          >
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/70">Region</label>
              <Select value={filters.region} onValueChange={(value) => handleFilterChange("region", value)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent className="bg-black/80 backdrop-blur-2xl border-white/10">
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="Middle East">Middle East</SelectItem>
                  <SelectItem value="Europe">Europe</SelectItem>
                  <SelectItem value="Asia Pacific">Asia Pacific</SelectItem>
                  <SelectItem value="North America">North America</SelectItem>
                  <SelectItem value="Africa">Africa</SelectItem>
                  <SelectItem value="South America">South America</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-white/70">Status</label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-black/80 backdrop-blur-2xl border-white/10">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-white/70">Battery Level</label>
              <Select value={filters.batteryLevel} onValueChange={(value) => handleFilterChange("batteryLevel", value)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent className="bg-black/80 backdrop-blur-2xl border-white/10">
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="high">High (&gt;80%)</SelectItem>
                  <SelectItem value="medium">Medium (20-80%)</SelectItem>
                  <SelectItem value="low">Low (&lt;20%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-white/70">Temperature</label>
              <Select value={filters.temperature} onValueChange={(value) => handleFilterChange("temperature", value)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="All Temperatures" />
                </SelectTrigger>
                <SelectContent className="bg-black/80 backdrop-blur-2xl border-white/10">
                  <SelectItem value="all">All Temperatures</SelectItem>
                  <SelectItem value="normal">Normal (&lt;45°C)</SelectItem>
                  <SelectItem value="warm">Warm (45-55°C)</SelectItem>
                  <SelectItem value="hot">Hot (&gt;55°C)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-white/70">Use Case</label>
              <Select value={filters.useCase} onValueChange={(value) => handleFilterChange("useCase", value)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="All Use Cases" />
                </SelectTrigger>
                <SelectContent className="bg-black/80 backdrop-blur-2xl border-white/10">
                  <SelectItem value="all">All Use Cases</SelectItem>
                  <SelectItem value="Smart City">Smart City</SelectItem>
                  <SelectItem value="Industrial IoT">Industrial IoT</SelectItem>
                  <SelectItem value="Emergency Response">Emergency Response</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 