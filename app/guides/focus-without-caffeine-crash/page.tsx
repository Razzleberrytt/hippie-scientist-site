import Link from 'next/link'

export default function Page(){
  return (
    <main className='mx-auto max-w-3xl p-6 text-white space-y-6'>
      <h1 className='text-4xl font-bold'>Focus Without a Caffeine Crash</h1>
      <p className='text-white/70'>Caffeine works, but not everyone tolerates the crash. These alternatives aim for smoother focus.</p>
      <ul className='list-disc ml-5 text-white/70'>
        <li>L-theanine → smoother focus</li>
        <li>Creatine → energy stability</li>
        <li>Rhodiola → stress + fatigue</li>
      </ul>
      <div className='mt-6 flex gap-2'>
        <Link href='/top/top-3-supplements-for-focus'>Top focus supplements →</Link>
        <Link href='/compare/creatine-vs-caffeine'>Creatine vs Caffeine →</Link>
      </div>
    </main>
  )
}
