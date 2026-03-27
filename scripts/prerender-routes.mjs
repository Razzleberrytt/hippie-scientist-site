import { getSharedRouteManifest } from './shared-route-manifest.mjs'

export function getPrerenderPlan() {
  const { prerenderRoutes, routeMeta, metadata } = getSharedRouteManifest()
  return {
    routes: prerenderRoutes,
    routeMeta,
    metadata,
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { routes, metadata } = getPrerenderPlan()
  console.log(JSON.stringify({ routes, metadata }, null, 2))
}
