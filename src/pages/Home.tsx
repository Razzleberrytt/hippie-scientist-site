import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import HeroSection from '../components/HeroSection'
import HerbGrid from '../components/HerbGrid'
import TagFilterBar from '../components/TagFilterBar'
import FeaturedHerb from '../components/FeaturedHerb'
import BlogPreviewCard from '../components/BlogPreviewCard'
import PanelWrapper from '../components/PanelWrapper'
import { useHerbs } from '../hooks/useHerbs'
import { posts } from '../data/posts'

export default function Home() {
  const herbs = useHerbs()
  const allTags = Array.from(new Set(herbs.flatMap(h => h.tags))).sort()
  const [activeTags, setActiveTags] = useState<string[]>([])

  const toggleTag = (tag: string) => {
    setActiveTags(t => (t.includes(tag) ? t.filter(x => x !== tag) : [...t, tag]))
  }

  const filtered = activeTags.length
    ? herbs.filter(h => activeTags.every(t => h.tags.includes(t)))
    : herbs

  return (
    <>
      <Helmet>
        <title>The Hippie Scientist</title>
        <meta name='description' content='Explore psychedelic botany and conscious exploration.' />
      </Helmet>
      <HeroSection />
      <FeaturedHerb herbs={herbs} />
      <TagFilterBar tags={allTags} active={activeTags} toggle={toggleTag} />
      <PanelWrapper className='mx-auto max-w-7xl px-4 py-12'>
        <HerbGrid herbs={filtered} />
      </PanelWrapper>
      <section className='mx-auto max-w-4xl space-y-4 px-4 py-12'>
        {posts.map(post => (
          <BlogPreviewCard key={post.id} post={post} />
        ))}
      </section>
    </>
  )
}
