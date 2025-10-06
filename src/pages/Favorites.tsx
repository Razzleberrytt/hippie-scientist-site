import { Link } from 'react-router-dom';
import data from '../data/herbs/herbs.normalized.json';
import { useFavorites } from '../lib/useFavorites';

export default function Favorites() {
  const { favs, clear } = useFavorites();
  const herbs = data.filter(h => favs.includes(h.slug));

  return (
    <main className='mx-auto max-w-5xl px-4 py-8'>
      <div className='mb-4 flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Favorites ({herbs.length})</h1>
        {herbs.length > 0 && (
          <button onClick={clear} className='rounded-md border px-3 py-1'>
            Clear All
          </button>
        )}
      </div>
      {herbs.length === 0 ? (
        <p className='opacity-70'>You haven’t starred any herbs yet.</p>
      ) : (
        <div className='grid gap-4 sm:grid-cols-2'>
          {herbs.map(h => (
            <Link
              key={h.slug}
              to={`/herb/${h.slug}`}
              className='rounded-xl border p-4 hover:bg-gray-50 dark:hover:bg-gray-900'
            >
              <h2 className='text-lg font-semibold'>{h.common}</h2>
              <p className='text-sm italic opacity-80'>{h.scientific}</p>
              {h.effects && <p className='mt-2 text-sm'>{h.effects}</p>}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
