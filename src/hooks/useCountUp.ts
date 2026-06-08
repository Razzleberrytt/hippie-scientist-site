import { useEffect, useRef, useState } from 'react'

export function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0)
  const raf = useRef<number>(0)

  useEffect(() => {
    const start = performance.now()
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      setCount(Math.floor(progress * target))
      if (progress < 1) raf.current = requestAnimationFrame(step)
    }

    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])

  return count
}
