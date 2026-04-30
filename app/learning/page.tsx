import type { Metadata } from 'next'
import Link from 'next/link'
import { PUBLIC_ROUTES } from '@/lib/publicRoutes'

export const metadata: Metadata = {
  title: 'Learning',
  description: 'Learning hub for plain-English herbal and compound education.',
}

export default function LearningPage() {
  return (
    <section className='space-y-6'>
      <h1 className='text-3xl font-semibold tracking-tight'>Learning</h1>
      <p className='max-w-2xl text-white/75'>
        Browse core guides and educational posts designed for safety-first learning.
      </p>
      <Link href={PUBLIC_ROUTES.blog} className='inline-flex rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white/5'>Go to blog</Link>
    </section>
  )
}
