function isEnabledFlag(value: string | undefined) {
  return value?.trim().toLowerCase() === 'true'
}

export function isAnalyticsRouteEnabled() {
  if (import.meta.env.DEV) return true
  return isEnabledFlag(import.meta.env.VITE_ENABLE_ANALYTICS_ROUTE)
}
