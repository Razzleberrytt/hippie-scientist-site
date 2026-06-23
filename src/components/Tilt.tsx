'use client'
import clsx from 'clsx'
import { useEffect, useRef, useState, type CSSProperties, type HTMLAttributes } from 'react'

type Props = HTMLAttributes<HTMLDivElement> & {
  maxTilt?: number
  perspective?: number
}

export default function Tilt({
  children,
  className,
  maxTilt = 6,
  perspective = 900,
  ...rest
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [tiltTransform, setTiltTransform] = useState('rotateX(0deg) rotateY(0deg)')

  const prefersReduced =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    function handle(e: PointerEvent) {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      setTiltTransform(`rotateX(${y * -maxTilt * 2}deg) rotateY(${x * maxTilt * 2}deg)`)
    }

    function reset() {
      setTiltTransform('rotateX(0deg) rotateY(0deg)')
    }

    const el = ref.current
    if (!el) return

    el.addEventListener('pointermove', handle, { passive: true })
    el.addEventListener('pointerleave', reset)
    el.addEventListener('pointercancel', reset)
    el.addEventListener('pointerup', reset)

    return () => {
      el.removeEventListener('pointermove', handle)
      el.removeEventListener('pointerleave', reset)
      el.removeEventListener('pointercancel', reset)
      el.removeEventListener('pointerup', reset)
    }
  }, [maxTilt])

  if (prefersReduced) {
    return (
      <div ref={ref} className={className} {...rest}>
        {children}
      </div>
    )
  }

  return (
    <div
      ref={ref}
      style={{ '--tilt-perspective': `${perspective}px` } as CSSProperties}
      className={clsx(
        className,
        '[perspective:var(--tilt-perspective)] [transform-style:preserve-3d]'
      )}
      {...rest}
    >
      <div className='transition-transform duration-200 ease-out' style={{ transform: tiltTransform }}>
        {children}
      </div>
    </div>
  )
}
