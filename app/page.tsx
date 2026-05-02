import type { Metadata } from 'next'
import Link from 'next/link'
import { getCompounds, getHerbs } from '@/lib/runtime-data'
import stacksData from '@/public/data/stacks.json'
import { supplementComparisons } from '@/data/comparisons'

// (rest unchanged until insertion)

// ADD SECTION AFTER STACKS

      <section className='rounded-3xl border border-white/10 p-5'>
        <h2 className='text-2xl font-bold text-white'>Popular Comparisons</h2>
        <div className='mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3'>
          {supplementComparisons.slice(0,6).map(c=>(
            <Link key={c.slug} href={`/compare/${c.slug}`} className='group rounded-2xl border border-white/10 p-4 hover:border-emerald-300/40'>
              <h3 className='font-bold text-white'>{c.title}</h3>
              <p className='text-sm text-white/60 mt-1'>{c.summary}</p>
              <span className='text-emerald-300 text-sm mt-2 inline-block'>Compare →</span>
            </Link>
          ))}
        </div>
      </section>

// rest of file unchanged
