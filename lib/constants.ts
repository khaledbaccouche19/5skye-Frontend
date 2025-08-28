export const DESIGN_TOKENS = {
  colors: {
    primary: "#3B82F6",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    background: {
      light: "#FFFFFF",
      dark: "#0F172A",
    },
  },
  fonts: {
    primary: "Inter, sans-serif",
  },
  shadows: {
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
  },
  borderRadius: {
    xl: "0.75rem",
  },
}

export const TOWER_STATUSES = {
  ONLINE: "online",
  OFFLINE: "offline",
  WARNING: "warning",
  CRITICAL: "critical",
} as const

export const ALERT_SEVERITIES = {
  CRITICAL: "critical",
  WARNING: "warning",
  INFO: "info",
} as const
