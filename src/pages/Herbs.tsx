import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import HerbList from '../components/HerbList';
import TagFilterBar from '../components/TagFilterBar';
import CategoryAnalytics from '../components/CategoryAnalytics';
import CategoryFilter from '../components/CategoryFilter';
import SearchBar from '../components/SearchBar';
import StarfieldBackground from '../components/StarfieldBackground';
import CompoundCard from '../components/CompoundCard';
import CompoundTagFilter, { Option } from '../components/CompoundTagFilter';
import { useHerbs } from '../hooks/useHerbs';
import { useHerbFavorites } from '../hooks/useHerbFavorites';
import { useFilteredHerbs, metaCategory } from '../hooks/useFilteredHerbs';
import { useCompounds } from '../hooks/useCompounds';
import { canonicalTag } from '../utils/tagUtils';
import { decodeTag } from '../utils/format';
import { Link } from 'react-router-dom';
import { Download } from 'lucide-react';
import { getLocal, setLocal } from '../utils/localStorage';

export default function HerbsPage() {
  const herbs = useHerbs();
  const { favorites } = useHerbFavorites();
  const {
    filtered,
    query,
    setQuery,
    tags: filteredTags,
    setTags: setFilteredTags,
    matchAll,
    setMatchAll,
    categories: filteredCategories,
    setCategories: setFilteredCategories,
    favoritesOnly,
    setFavoritesOnly,
    sort,
    setSort,
    fuse,
  } = useFilteredHerbs(herbs, { favorites });

  const [tab, setTab] = useState<'herbs' | 'compounds'>('herbs');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showBar, setShowBar] = useState(true);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const cur = window.scrollY;
      setShowBar(cur < last || cur < 100);
      last = cur;
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const close = () => {
      if (window.scrollY > 150) setFiltersOpen(false);
    };
    window.addEventListener('scroll', close);
    window.addEventListener('touchmove', close);
    return () => {
      window.removeEventListener('scroll', close);
      window.removeEventListener('touchmove', close);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ids = params.get('herbs')?.split(',') || [];
    if (ids.length) {
      setTimeout(() => {
        ids.forEach(id => {
          const el = document.getElementById(`herb-${id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            el.classList.add('ring-2', 'ring-sky-300');
            setTimeout(() => el.classList.remove('ring-2', 'ring-sky-300'), 2000);
          }
        });
      }, 300);
    }
  }, []);

  useEffect(() => {
    const pos = getLocal<number>('dbScroll', 0);
    if (pos) window.scrollTo(0, pos);
    const handle = () => setLocal('dbScroll', window.scrollY);
    window.addEventListener('scroll', handle);
    return () => {
      setLocal('dbScroll', window.scrollY);
      window.removeEventListener('scroll', handle);
    };
  }, []);

  const allTags = useMemo(() => {
    const t = herbs.reduce<string[]>((acc, h) => acc.concat(h.tags), []);
    return Array.from(new Set(t.map(canonicalTag)));
  }, [herbs]);

  const summary = useMemo(() => {
    const affiliates = herbs.filter(
      h => h.affiliateLink && h.affiliateLink.startsWith('http')
    ).length;
    const moaCount = herbs.filter(
      h => h.mechanismOfAction && h.mechanismOfAction.trim()
    ).length;
    return { total: herbs.length, affiliates, moaCount };
  }, [herbs]);

  const toggleTag = useCallback(
    (tag: string) =>
      setFilteredTags(prev =>
        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
      ),
    [setFilteredTags]
  );

  // compound data
  const compounds = useCompounds();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState<string[]>([]);

  const herbMap = useMemo(() => {
    const m = new Map<string, { slug?: string; category: string }>();
    herbs.forEach(h => {
      m.set(h.name.toLowerCase(), { slug: h.slug, category: h.category });
    });
    return m;
  }, [herbs]);

  const enriched = useMemo(() => {
    return compounds.map(c => {
      const herbsFound = (c.foundIn || []).map((name: string) => {
        const info = herbMap.get(name.toLowerCase());
        return { name, slug: info?.slug, category: info?.category };
      });
      const effSet = new Set(
        herbsFound
          .map(h => (h.category ? metaCategory(h.category) : undefined))
          .filter(Boolean)
      ) as Set<string>;
      return {
        ...c,
        herbsFound,
        effectClass: Array.from(effSet).join(', '),
      };
    });
  }, [compounds, herbMap]);

  const classOptions: Option[] = useMemo(
    () =>
      Array.from(new Set(enriched.map(c => c.type)))
        .sort()
        .map(c => ({ label: c, value: c })),
    [enriched]
  );

  const filteredCompounds = useMemo(() => {
    return enriched.filter(c => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.herbsFound.some(h => h.name.toLowerCase().includes(q));
      const matchesClass = classFilter.length === 0 || classFilter.includes(c.type);
      return matchesSearch && matchesClass;
    });
  }, [search, classFilter, enriched]);

  const relatedTags = useMemo(() => {
    if (filteredTags.length === 0) return [] as string[];
    const counts: Record<string, number> = {};
    herbs.forEach(h => {
      if (filteredTags.every(t => h.tags.some(ht => canonicalTag(ht) === canonicalTag(t)))) {
        h.tags.forEach(t => {
          const canon = canonicalTag(t);
          if (!filteredTags.some(ft => canonicalTag(ft) === canon)) {
            counts[canon] = (counts[canon] || 0) + 1;
          }
        });
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([t]) => t);
  }, [filteredTags, herbs]);

  return (
    <>
      <Helmet>
        <title>Herbs &amp; Compounds - The Hippie Scientist</title>
        <meta
          name='description'
          content='Browse psychoactive herbs and their active compounds.'
        />
      </Helmet>
      <div className='relative min-h-screen px-4 pt-20'>
        <StarfieldBackground />
        <div className='relative mx-auto max-w-6xl'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className='mb-8 text-center'
          >
            <h1 className='text-gradient mb-6 text-5xl font-bold'>Herbal Index</h1>
            <p className='mx-auto max-w-4xl text-xl text-sand'>
              Explore our collection of herbs and their active compounds.
            </p>
          </motion.div>
          <div className='mx-auto mb-6 flex justify-center'>
            <div className='relative flex space-x-2 rounded-md bg-black/20 p-1 backdrop-blur'>
              {(['herbs', 'compounds'] as const).map(t => (
                <button
                  key={t}
                  type='button'
                  onClick={() => setTab(t)}
                  className={`relative z-10 rounded-md px-3 py-1 text-sm font-medium ${tab === t ? 'text-white' : 'text-sand'}`}
                >
                  {tab === t && (
                    <motion.div layoutId='tab' className='absolute inset-0 rounded-md bg-fuchsia-700/40' />
                  )}
                  <span className='relative'>{t === 'herbs' ? 'Herbs' : 'Compounds'}</span>
                </button>
              ))}
            </div>
          </div>
          <AnimatePresence mode='wait'>
            {tab === 'herbs' ? (
              <motion.div
                key='herbs'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className='sticky top-2 z-20 mb-4 flex flex-wrap items-center gap-2'
                  animate={{ y: showBar ? 0 : -60, opacity: showBar ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <SearchBar query={query} setQuery={setQuery} fuse={fuse} />
                  <button
                    type='button'
                    onClick={() => setFavoritesOnly(f => !f)}
                    className='rounded-md bg-space-dark/70 px-3 py-2 text-sm text-yellow-300 backdrop-blur-md hover:bg-white/10'
                  >
                    {favoritesOnly ? 'All Herbs' : 'My Herbs'}
                  </button>
                  <button
                    type='button'
                    onClick={() => setMatchAll(m => !m)}
                    className='hover-glow rounded-md bg-space-dark/70 px-3 py-2 text-sm text-sand backdrop-blur-md hover:bg-white/10'
                  >
                    {matchAll ? 'Match ALL' : 'Match ANY'}
                  </button>
                  <select
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                    className='rounded-md bg-space-dark/70 px-3 py-2 text-sm text-sand backdrop-blur-md hover:bg-white/10'
                  >
                    <option value=''>Sort By...</option>
                    <option value='name'>Alphabetical (A–Z)</option>
                    <option value='category'>Category</option>
                    <option value='intensity'>Psychoactive Intensity</option>
                    <option value='blend'>Blend-Friendliness</option>
                  </select>
                  <Link
                    to='/downloads'
                    className='rounded-md bg-space-dark/70 p-2 text-sand backdrop-blur-md hover:bg-white/10'
                    aria-label='Export data'
                  >
                    <Download size={18} />
                  </Link>
                  <button
                    type='button'
                    onClick={() => setFiltersOpen(o => !o)}
                    className='rounded-md bg-space-dark/70 px-3 py-2 text-sm text-sand backdrop-blur-md hover:bg-white/10 sm:hidden'
                  >
                    {filtersOpen ? 'Hide Filters' : 'Show Filters'}
                  </button>
                </motion.div>
                <div className={`mb-4 space-y-4 ${filtersOpen ? '' : 'hidden sm:block'}`}>
                  <CategoryFilter selected={filteredCategories} onChange={setFilteredCategories} />
                  <TagFilterBar allTags={allTags} activeTags={filteredTags} onToggleTag={toggleTag} />
                </div>
                {relatedTags.length > 0 && (
                  <div className='mb-4 flex flex-wrap items-center gap-2'>
                    <span className='text-sm text-moss'>Related tags:</span>
                    {relatedTags.map(tag => (
                      <button
                        key={tag}
                        type='button'
                        onClick={() => setFilteredTags(t => Array.from(new Set([...t, tag])))}
                        className='tag-pill'
                      >
                        {decodeTag(tag)}
                      </button>
                    ))}
                  </div>
                )}
                <CategoryAnalytics />
                <HerbList herbs={filtered} highlightQuery={query} />
                <footer className='mt-4 text-center text-sm text-moss'>
                  Total herbs: {summary.total} · Affiliate links: {summary.affiliates} · MOA documented: {summary.moaCount} · Updated: {new Date(__BUILD_TIME__).toLocaleDateString()}
                </footer>
              </motion.div>
            ) : (
              <motion.div
                key='compounds'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className='mb-4 flex flex-col items-center gap-4'>
                  <input
                    type='text'
                    placeholder='Search compounds or herbs...'
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className='w-full rounded-md bg-space-dark/70 px-3 py-2 text-white backdrop-blur-md focus:outline-none sm:w-72'
                  />
                  <CompoundTagFilter options={classOptions} onChange={setClassFilter} />
                </div>
                <motion.div layout className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                  <AnimatePresence>
                    {filteredCompounds.map(c => (
                      <motion.div
                        key={c.name}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <CompoundCard compound={c as any} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
