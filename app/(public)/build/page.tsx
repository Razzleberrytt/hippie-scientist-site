import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Build',
  description: 'Build your herb and compound learning stack.',
}

export default function BuildPage() {
  return (
    <section className='space-y-4'>
      <h1 className='text-3xl font-semibold tracking-tight'>Build</h1>
      <p className='max-w-2xl text-white/75'>
        Build your own learning path by exploring herbs, compounds, and evidence-backed notes.
      </p>
    </section>
  )
}
