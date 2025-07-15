import { Helmet } from 'react-helmet-async';
import HeroSection from '../components/HeroSection';
import HerbGrid from '../components/HerbGrid';
import { herbs } from '../data/herbs';

export default function Home() {
  return (
    <>
      <Helmet>
        <title>The Hippie Scientist</title>
        <meta
          name="description"
          content="Explore psychedelic botany and conscious exploration."
        />
      </Helmet>
      <HeroSection />
      <div className="mx-auto max-w-7xl px-4 py-20">
        <HerbGrid herbs={herbs} />
      </div>
    </>
  );
}
