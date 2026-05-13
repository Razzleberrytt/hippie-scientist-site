export function dashboardEnabled() {
  return false
}

export function shouldHideDashboardRoute() {
  return !dashboardEnabled()
}
