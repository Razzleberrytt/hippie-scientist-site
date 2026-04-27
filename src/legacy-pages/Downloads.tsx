import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Meta from '../components/Meta'
import Card from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import BundleUpgradeCard from '../components/BundleUpgradeCard'
import ResultsSummaryCard from '../components/ResultsSummaryCard'
import {
  clearGeneratedGuides,
  deleteGeneratedGuide,
  downloadStarterPackByFilename,
  getGeneratedGuides,
  type GeneratedGuideRecord,
} from '../utils/starterPack'

export default function Downloads() {
  const [guides, setGuides] = useState<GeneratedGuideRecord[]>(() => getGeneratedGuides())

  const hasGuides = guides.length > 0
  const sortedGuides = useMemo(
    () =>
      [...guides].sort(
        (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
      ),
    [guides]
  )

  const handleDownloadAgain = (guide: GeneratedGuideRecord) => {
    downloadStarterPackByFilename(guide.filename, guide.content)
  }

  const handleDelete = (id: string) => {
    setGuides(deleteGeneratedGuide(id))
  }

  const handleClearAll = () => {
    clearGeneratedGuides()
    setGuides([])
  }

  return (
    <main className='container space-y-8 py-8 sm:py-10'>
      <Meta
        title='My Guides - The Hippie Scientist'
        description='Your saved Starter Packs and generated blend downloads.'
        path='/downloads'
      />

      <header className='space-y-3'>
        <p className='text-xs uppercase tracking-[0.3em] text-white/60'>Digital library</p>
        <h1 className='h1-grad text-3xl font-semibold md:text-4xl'>My Guides</h1>
        <p className='max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base'>
          Your saved Starter Packs and generated blend downloads.
        </p>
      </header>

      <BundleUpgradeCard sourcePage='downloads' currentBlendName={sortedGuides[0]?.blendName} />

      {!hasGuides && (
        <Card className='border-white/15/80 from-black/40/92 to-black/40/70 flex flex-col items-center gap-4 rounded-2xl border bg-gradient-to-br p-8 text-center'>
          <p className='text-xl font-semibold text-white'>No guides saved yet</p>
          <p className='max-w-lg text-sm leading-relaxed text-white/60'>
            Once you generate a Starter Pack, it will appear here so you can download it any time.
          </p>
          <Link to='/blend'>
            <Button className='border border-lime-400/40 bg-lime-400/20 text-lime-300 shadow-[0_0_24px_-12px_rgba(163,230,53,0.95)] hover:bg-lime-400/30'>
              Build Your First Blend
            </Button>
          </Link>
        </Card>
      )}

      {hasGuides && (
        <>
          <div className='flex justify-end'>
            <Button
              variant='ghost'
              onClick={handleClearAll}
              className='text-white/60 hover:text-white'
            >
              Clear All
            </Button>
          </div>
          <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
            {sortedGuides.map(guide => (
              <ResultsSummaryCard
                key={guide.id}
                goal={guide.goal}
                blendName={guide.blendName}
                explanation='Saved Starter Pack guide ready to download whenever you need it.'
                herbs={guide.herbs}
                timestamp={guide.generatedAt}
                variant='compact'
                ctaButtons={
                  <div className='mt-auto flex w-full flex-col gap-2'>
                    <Button onClick={() => handleDownloadAgain(guide)} className='justify-center'>
                      Download Again
                    </Button>
                    <Button
                      variant='ghost'
                      onClick={() => handleDelete(guide.id)}
                      className='justify-center text-white/60 hover:text-white'
                    >
                      Delete
                    </Button>
                  </div>
                }
                className='flex h-full flex-col'
              />
            ))}
          </section>
        </>
      )}
    </main>
  )
}
