import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Best Natural Sleep Aids That Actually Work',
  description: 'A simple guide to herbs commonly discussed for sleep onset, relaxation, and nighttime calm.',
}

export default function Page(){
  return (
    <main className='mx-auto max-w-3xl p-6 text-white space-y-6'>
      <h1 className='text-4xl font-bold'>Best Natural Sleep Aids That Work</h1>
      <p className='text-white/70'>Sleep issues are often tied to stress and nervous system activation.</p>
      <ul className='list-disc ml-5 text-white/70'>
        <li>Valerian → sleep onset</li>
        <li>Lemon balm → calming</li>
        <li>Passionflower → relaxation</li>
      </ul>
      <div className='mt-6 flex gap-2'>
        <Link href='/top/top-3-natural-sleep-aids'>Top sleep aids →</Link>
        <Link href='/compare/magnesium-vs-melatonin'>Magnesium vs melatonin →</Link>
      </div>
    </main>
  )
}
