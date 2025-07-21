import React from 'react';
import { useParams, Link } from 'react-router-dom';
import herbs from '../data/herbs';
import HerbCardAccordion from '../components/HerbCardAccordion';
import { slugify } from '../utils/slugify';

export default function HerbCardPage() {
  const { herbId } = useParams<{ herbId?: string }>();
  const id = herbId?.toLowerCase() || '';
  const herb = React.useMemo(() => {
    return herbs.find(
      h =>
        h.id?.toLowerCase() === id ||
        slugify(h.name).toLowerCase() === id ||
        h.name?.toLowerCase() === id
    );
  }, [id]);

  if (!herb || typeof herb !== 'object' || !herb.name) {
    return (
      <div className='flex min-h-screen items-center justify-center p-6'>
        <div className='space-y-4 text-center'>
          <h1 className='text-4xl font-bold'>404 – Herb Not Found</h1>
          <Link to='/database' className='text-comet underline'>Back to database</Link>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-3xl px-4 py-8'>
      <HerbCardAccordion herb={herb} />
    </div>
  );
}
