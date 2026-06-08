function isEnabledFlag(value: string | undefined) {
  return value?.trim().toLowerCase() === 'true'
}

export function isAnalyticsRouteEnabled() {
  if (process.env.NODE_ENV !== 'production') return true
  return isEnabledFlag(process.env.NEXT_PUBLIC_ENABLE_ANALYTICS_ROUTE)
}
