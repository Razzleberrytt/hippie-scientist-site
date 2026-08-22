'use client'

import { lazy, Suspense, useEffect, useRef, useState } from 'react'

const ProfileFeedbackControls = lazy(() => import('./ProfileFeedbackControls'))

export default function DeferredProfileFeedbackControls() {
  const [ready, setReady] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ready) return
    const node = sentinelRef.current
    if (!node) return

    if (typeof IntersectionObserver === 'undefined') {
      setReady(true)
      return
    }

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      setReady(true)
      observer.disconnect()
    }, { rootMargin: '700px 0px' })

    observer.observe(node)
    return () => observer.disconnect()
  }, [ready])

  if (!ready) {
    return <div ref={sentinelRef} className='h-px' aria-hidden='true' data-profile-feedback-sentinel />
  }

  return (
    <Suspense fallback={null}>
      <ProfileFeedbackControls />
    </Suspense>
  )
}
