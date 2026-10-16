'use client'

import { lazy, Suspense, useEffect, useState } from 'react'
import { onOpenConsent } from '../lib/consentBus'

const ConsentManager = lazy(() => import('./ConsentManager'))

export default function FooterConsentControls({ buttonClassName, label = 'Privacy settings' }: { buttonClassName: string; label?: string }) {
  const [open, setOpen] = useState(false)

  useEffect(() => onOpenConsent(() => setOpen(true)), [])

  return (
    <>
      <button className={buttonClassName} type='button' onClick={() => setOpen(true)}>
        {label}
      </button>
      {open ? (
        <Suspense fallback={null}>
          <ConsentManager open onClose={() => setOpen(false)} />
        </Suspense>
      ) : null}
    </>
  )
}
