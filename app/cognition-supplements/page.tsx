import Link from 'next/link'

export default function Page() {
  return (
    <div className='space-y-6'>
      <h1 className='text-4xl font-black text-white'>Best Supplements for Cognition</h1>
      <p className='text-white/70'>Explore a science-backed cognition supplement stack for focus and performance.</p>
      <Link href='/stacks/cognition' className='text-emerald-300'>View stack</Link>
    </div>
  )
}
