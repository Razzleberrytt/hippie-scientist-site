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
      className='pointer-events-none fixed inset-0 z-0 hidden transition-opacity duration-500 ease-out motion-safe:block motion-reduce:hidden'
      style={{
        background: [
          'radial-gradient(260px 260px at var(--cursor-x, 50%) var(--cursor-y, 50%), rgba(34, 211, 238, 0.18), transparent 70%)',
          'radial-gradient(300px 300px at calc(var(--cursor-x, 50%) - 12%) calc(var(--cursor-y, 50%) + 10%), rgba(168, 85, 247, 0.12), transparent 72%)',
          'radial-gradient(360px 360px at calc(var(--cursor-x, 50%) + 14%) calc(var(--cursor-y, 50%) - 14%), rgba(16, 185, 129, 0.08), transparent 74%)',
        ].join(','),
        filter: 'blur(18px) saturate(1.05)',
      }}
    />
  )
}
