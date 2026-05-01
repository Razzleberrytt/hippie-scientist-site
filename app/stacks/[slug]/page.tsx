import { notFound } from 'next/navigation'
import stacks from '@/public/data/stacks.json'
import StackCard from '@/components/StackCard'

export async function generateStaticParams() {
  return stacks.map((s: any) => ({ slug: s.slug }))
}

export default function StackPage({ params }: { params: { slug: string } }) {
  const stack = stacks.find((s: any) => s.slug === params.slug)

  if (!stack) return notFound()

  return (
    <div className='space-y-6'>
      <h1 className='text-4xl font-black text-white'>{stack.title}</h1>
      <p className='text-white/70'>Simple, science-backed stack for {stack.goal.replace('_', ' ')}</p>

      <div className='grid gap-4'>
        {stack.stack.map((item: any, i: number) => (
          <StackCard key={i} item={item} />
        ))}
      </div>

      <div className='rounded-2xl border border-white/10 bg-white/[0.04] p-4'>
        <h3 className='font-bold text-white'>Who it's for</h3>
        <p className='text-white/70 mt-1'>{stack.who_for}</p>
      </div>

      <div className='rounded-2xl border border-white/10 bg-red-500/10 p-4'>
        <h3 className='font-bold text-white'>Who should avoid</h3>
        <p className='text-white/70 mt-1'>{stack.avoid_if}</p>
      </div>

      <button className='w-full rounded-2xl bg-emerald-300 py-3 font-bold text-black'>
        {stack.cta}
      </button>
    </div>
  )
}
