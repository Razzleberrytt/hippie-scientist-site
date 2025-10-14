import Meta from '../components/Meta';
import NewsletterCard from '@/components/NewsletterCard';
import Hero from '@/components/Hero';
import { getCounters } from '@/lib/counters';

const counters = getCounters();

export default function Home() {
  const { herbCount, compoundCount, articleCount } = counters;

  return (
    <>
      <Meta
        title='The Hippie Scientist — Mindful Exploration of Psychoactive Herbs'
        description='Independent research on psychoactive herbs, entheogens, and natural neurochemistry.'
        path='/'
        pageType='website'
      />

      <Hero stats={{ herbs: herbCount, compounds: compoundCount, articles: articleCount }} />

      <section aria-label='Newsletter signup' className='container mx-auto max-w-screen-md px-4 pb-12'>
        <NewsletterCard />
      </section>
    </>
  );
}
