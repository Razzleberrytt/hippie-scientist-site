'use client'

import { useEffect } from 'react'

export default function AtlasFilterRobotsGuard({ active }: { active: boolean }) {
  useEffect(() => {
    const selector = 'meta[name="robots"]'
    let meta = document.head.querySelector<HTMLMetaElement>(selector)

    if (active) {
      if (!meta) {
        meta = document.createElement('meta')
        meta.name = 'robots'
        document.head.appendChild(meta)
      }
      if (meta.dataset.atlasFilterGuard !== 'true') {
        meta.dataset.atlasPreviousContent = meta.content
      }
      meta.content = 'noindex,follow'
      meta.dataset.atlasFilterGuard = 'true'
      return
    }

    if (meta?.dataset.atlasFilterGuard === 'true') {
      const previous = meta.dataset.atlasPreviousContent
      if (previous) {
        meta.content = previous
      } else {
        meta.remove()
      }
      delete meta.dataset.atlasFilterGuard
      delete meta.dataset.atlasPreviousContent
    }
  }, [active])

  return null
}
