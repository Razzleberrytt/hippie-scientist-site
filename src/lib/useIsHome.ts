import { useEffect, useState } from 'react'

export function useIsHome() {
  const [home, setHome] = useState<boolean>(() => {
    const path = typeof window !== 'undefined' ? window.location.pathname : '/'
    return path === '/'
  })

  useEffect(() => {
    const update = () => {
      const path = window.location.pathname
      setHome(path === '/')
    }

    update()
    window.addEventListener('popstate', update)

    return () => {
      window.removeEventListener('popstate', update)
    }
  }, [])

  return home
}
