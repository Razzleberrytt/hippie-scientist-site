import { useEffect, useRef, useState } from 'react'

export default function AmbientCursor() {
  const [enabled, setEnabled] = useState(false)
  const rafRef = useRef<number | null>(null)

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
    const pointer = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 }
    const current = { ...pointer }

    const tick = () => {
      current.x += (pointer.x - current.x) * 0.14
      current.y += (pointer.y - current.y) * 0.14
      root.style.setProperty('--cursor-x', `${current.x}px`)
      root.style.setProperty('--cursor-y', `${current.y}px`)
      rafRef.current = window.requestAnimationFrame(tick)
    }

    const move = (event: PointerEvent) => {
      pointer.x = event.clientX
      pointer.y = event.clientY
    }

    rafRef.current = window.requestAnimationFrame(tick)
    window.addEventListener('pointermove', move, { passive: true })

    return () => {
      window.removeEventListener('pointermove', move)
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div
      aria-hidden
      className='ambient-cursor pointer-events-none fixed inset-0 z-0 hidden transition-opacity transition-transform duration-500 ease-out motion-safe:block motion-reduce:hidden'
      style={{
        background: [
          'radial-gradient(240px 240px at var(--cursor-x, 50%) var(--cursor-y, 50%), rgba(45, 212, 191, 0.18), transparent 72%)',
          'radial-gradient(320px 320px at calc(var(--cursor-x, 50%) - 11%) calc(var(--cursor-y, 50%) + 10%), rgba(168, 85, 247, 0.12), transparent 75%)',
          'radial-gradient(360px 360px at calc(var(--cursor-x, 50%) + 14%) calc(var(--cursor-y, 50%) - 14%), rgba(59, 130, 246, 0.1), transparent 78%)',
        ].join(','),
        filter: 'blur(16px) saturate(1.05)',
        mixBlendMode: 'screen',
        opacity: 0.62,
      }}
    />
  )
}
