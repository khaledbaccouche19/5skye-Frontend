"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function useThemeSafe() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Return a safe theme value that won't cause hydration mismatches
  const safeTheme = mounted ? theme : "dark" // Default to dark theme during SSR

  return {
    theme: safeTheme,
    setTheme,
    mounted
  }
}
