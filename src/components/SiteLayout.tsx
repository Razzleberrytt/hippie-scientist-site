import { PropsWithChildren, useEffect, useState } from 'react'
import BackgroundStage from './BackgroundStage'
import { useTrippy } from '@/lib/trippy'
import { useMelt } from '@/melt/useMelt'

export default function SiteLayout({ children }: PropsWithChildren) {
  const { level, enabled: trippyEnabled } = useTrippy()
  const { enabled, setEnabled, effect } = useMelt()
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')

    const update = () => setPrefersReducedMotion(media.matches)
    update()

    const handler = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches)

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', handler)
      return () => media.removeEventListener('change', handler)
    }

    if (typeof media.addListener === 'function') {
      media.addListener(handler)
      return () => media.removeListener(handler)
    }

    return undefined
  }, [])

  useEffect(() => {
    if (prefersReducedMotion && enabled) {
      setEnabled(false)
    }
  }, [enabled, prefersReducedMotion, setEnabled])

  const shouldAnimate = trippyEnabled && level !== 'off' && enabled && !prefersReducedMotion

  return (
    <div className='relative min-h-svh overflow-x-hidden'>
      <BackgroundStage enabled={shouldAnimate} effect={effect} />
      <div className='relative z-10 flex min-h-svh flex-col'>{children}</div>
    </div>
  )
}
