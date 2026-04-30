import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Learning',
  description: 'Learning resources from The Hippie Scientist.',
}

export default function LearningPage() {
  return (
    <section className='space-y-4'>
      <h1 className='text-3xl font-semibold tracking-tight'>Learning</h1>
      <p className='max-w-2xl text-white/75'>
        A growing set of educational resources for herbs, compounds, and safer research habits.
      </p>
    </section>
  )
}
