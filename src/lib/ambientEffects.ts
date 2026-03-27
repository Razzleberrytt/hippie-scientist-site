import { useEffect, useMemo, useState } from 'react'

const CONTENT_HEAVY_PREFIXES = ['/blog', '/herbs', '/compounds', '/collections', '/browse/herbs']

export type AmbientRoutePolicy = {
  background: boolean
  cursor: boolean
}

export function getAmbientRoutePolicy(pathname: string): AmbientRoutePolicy {
  const normalizedPath = pathname.toLowerCase()

  if (normalizedPath === '/') {
    return { background: true, cursor: true }
  }

  const isContentHeavy = CONTENT_HEAVY_PREFIXES.some((prefix) =>
    normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)
  )

  if (isContentHeavy) {
    return { background: false, cursor: false }
  }

  return { background: true, cursor: true }
}

function readPowerState() {
  if (typeof navigator === 'undefined') return false

  const connection = navigator.connection as
    | (NetworkInformation & { saveData?: boolean })
    | undefined

  if (connection?.saveData) return true

  const deviceMemory = 'deviceMemory' in navigator ? (navigator.deviceMemory ?? 8) : 8
  const cores = navigator.hardwareConcurrency ?? 8

  return deviceMemory <= 4 || cores <= 4
}

export function useAmbientEnvironmentGate() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [lowPowerDevice, setLowPowerDevice] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return

    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncReducedMotion = () => setPrefersReducedMotion(media.matches)

    syncReducedMotion()

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', syncReducedMotion)
      return () => media.removeEventListener('change', syncReducedMotion)
    }

    if (typeof media.addListener === 'function') {
      media.addListener(syncReducedMotion)
      return () => media.removeListener(syncReducedMotion)
    }

    return undefined
  }, [])

  useEffect(() => {
    setLowPowerDevice(readPowerState())

    const connection = navigator.connection
    if (!connection || typeof connection.addEventListener !== 'function') return

    const syncPower = () => setLowPowerDevice(readPowerState())
    connection.addEventListener('change', syncPower)

    return () => connection.removeEventListener('change', syncPower)
  }, [])

  return useMemo(
    () => ({
      prefersReducedMotion,
      lowPowerDevice,
      disableAmbientEffects: prefersReducedMotion || lowPowerDevice,
    }),
    [lowPowerDevice, prefersReducedMotion]
  )
}
