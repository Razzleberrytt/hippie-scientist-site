import Link from 'next/link'
import stacks from '@/public/data/stacks.json'

export default function StacksPage() {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {stacks.map((s: any) => (
        <Link key={s.slug} href={`/stacks/${s.slug}`} className='rounded-2xl border border-white/10 bg-white/[0.04] p-4 hover:bg-white/[0.08]'>
          <h2 className='font-bold text-white'>{s.title}</h2>
          <p className='text-sm text-white/60 mt-1'>{s.short_description}</p>
        </Link>
      ))}
    </div>
  )
}
