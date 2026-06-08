import type { Metadata } from 'next'
import Link from 'next/link'
import SafetyRedirectClient from './SafetyRedirectClient'

export const metadata: Metadata = {
  title: 'Safety & Interaction Checker | The Hippie Scientist',
  description: 'Evidence-aware safety interaction checker and cautions reference.',
}

export default function SafetyRedirectPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center space-y-4">
      <SafetyRedirectClient />
      <h1 className="text-2xl font-bold text-ink">Safety &amp; Interaction Checker</h1>
      <p className="text-muted">Redirecting you to our interactive safety tool...</p>
      <p className="text-sm">
        If you are not redirected automatically,{' '}
        <Link href="/safety-checker/" className="text-emerald-700 font-semibold underline">
          click here to open the Safety Checker
        </Link>
        .
      </p>
    </div>
  )
}
