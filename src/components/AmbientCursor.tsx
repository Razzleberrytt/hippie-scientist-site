import { useEffect, useState } from 'react'

export default function AmbientCursor() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')

    const sync = () => {
      setEnabled(!media.matches)
    }

    sync()

    if (media.addEventListener) {
      media.addEventListener('change', sync)
    } else {
      media.addListener(sync)
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', sync)
      } else {
        media.removeListener(sync)
      }
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    const root = document.documentElement
    const move = (event: PointerEvent) => {
      root.style.setProperty('--cursor-x', `${event.clientX}px`)
      root.style.setProperty('--cursor-y', `${event.clientY}px`)
    }

    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [enabled])

  if (!enabled) return null

  return (
    <div
      aria-hidden
      className='pointer-events-none fixed inset-0 z-0 hidden motion-safe:block'
      style={{
        background:
          'radial-gradient(220px 220px at var(--cursor-x, 50%) var(--cursor-y, 50%), rgba(56, 189, 248, 0.16), rgba(147, 51, 234, 0.08) 45%, transparent 70%)',
        mixBlendMode: 'screen',
        filter: 'blur(24px) saturate(1.08)',
      }}
    />
  )
}
