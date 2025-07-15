import React from 'react'
import { Helmet } from 'react-helmet-async'
import HeroSection from '../components/HeroSection'
import HerbGrid from '../components/HerbGrid'
import PanelWrapper from '../components/PanelWrapper'
import type { Herb } from '../types'

export default function Home() {
  const [herbs, setHerbs] = React.useState<Herb[]>([])

  React.useEffect(() => {
    import('../data/herbs.json').then(m => {
      setHerbs(m.default as Herb[])
    })
  }, [])

  return (
    <>
      <Helmet>
        <title>The Hippie Scientist</title>
        <meta name='description' content='Explore psychedelic botany and conscious exploration.' />
      </Helmet>
      <HeroSection />
      <PanelWrapper className='mx-auto max-w-7xl px-4 py-20'>
        <HerbGrid herbs={herbs} />
      </PanelWrapper>
    </>
  )
}
