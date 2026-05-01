import Link from 'next/link'

export default function Page(){
  return (
    <main className='mx-auto max-w-3xl p-6 text-white space-y-6'>
      <h1 className='text-4xl font-bold'>Magnesium vs Melatonin</h1>
      <p className='text-white/70'>Both are used for sleep, but they work differently.</p>
      <ul className='list-disc ml-5 text-white/70'>
        <li>Magnesium → relaxation support</li>
        <li>Melatonin → sleep timing</li>
      </ul>
      <div className='mt-6 flex gap-2'>
        <Link href='/top/top-3-natural-sleep-aids'>Top sleep aids →</Link>
        <Link href='/compare/magnesium-vs-melatonin'>Full comparison →</Link>
      </div>
    </main>
  )
}
