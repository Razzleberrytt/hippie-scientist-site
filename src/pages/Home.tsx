import Meta from '../components/Meta';
import NewsletterCard from '@/components/NewsletterCard';
import Hero from '@/components/Hero';

export default function Home() {
  return (
    <>
      <Meta
        title='The Hippie Scientist — Mindful Exploration of Psychoactive Herbs'
        description='Independent research on psychoactive herbs, entheogens, and natural neurochemistry.'
        path='/'
        pageType='website'
      />

      <Hero />

      <section aria-label='Newsletter signup' className='container mx-auto max-w-screen-md px-4 pb-12'>
        <NewsletterCard />
      </section>
    </>
  );
}
