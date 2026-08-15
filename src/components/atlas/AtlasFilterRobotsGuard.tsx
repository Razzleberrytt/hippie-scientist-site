'use client'

import { useEffect } from 'react'

export default function AtlasFilterRobotsGuard({ active }: { active: boolean }) {
  useEffect(() => {
    const selector = 'meta[name="robots"]'
    let meta = document.head.querySelector<HTMLMetaElement>(selector)
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'robots'
      document.head.appendChild(meta)
    }

    if (active) {
      meta.content = 'noindex,follow'
      meta.dataset.atlasFilterGuard = 'true'
      return
    }

    if (meta.dataset.atlasFilterGuard === 'true') {
      meta.content = 'index,follow'
      delete meta.dataset.atlasFilterGuard
    }
  }, [active])

  return null
}
