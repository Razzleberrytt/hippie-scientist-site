import Link from 'next/link'

export default function Page() {
  return (
    <div className='space-y-6'>
      <h1 className='text-4xl font-black text-white'>Best Supplements for Fat Loss</h1>
      <p className='text-white/70'>Explore a science-backed stack for fat loss including dosage, timing, and safety.</p>
      <Link href='/stacks/fat-loss' className='text-emerald-300'>View stack</Link>
    </div>
  )
}
