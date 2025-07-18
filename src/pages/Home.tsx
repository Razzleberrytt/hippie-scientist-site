import React from 'react'
import { motion } from 'framer-motion'
import HerbList from '../components/HerbList'
import HeroSection from '../components/HeroSection'
import SearchFilter from '../components/SearchFilter'
import Pagination from '../components/Pagination'
import { herbs } from '../data/herbs'

export default function Home() {
  const [filtered, setFiltered] = React.useState(herbs)
  const [page, setPage] = React.useState(1)
  const perPage = 6

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = React.useMemo(
    () => filtered.slice((page - 1) * perPage, page * perPage),
    [filtered, page]
  )

  const handleFilter = (res: typeof herbs) => {
    setFiltered(res)
    setPage(1)
  }

  return (
    <main className='min-h-screen bg-white text-black dark:bg-black dark:text-white px-4 py-10'>
      <HeroSection />
      <section className='mx-auto max-w-4xl space-y-10'>
        <p className='text-center text-lg text-opal'>
          Discover visionary plants used throughout history. Search the database or browse page by
          page.
        </p>
        <SearchFilter herbs={herbs} onFilter={handleFilter} />
        <motion.div layout>
          <h2 className='text-gradient mb-4 font-display text-3xl'>Herb Index</h2>
          <HerbList herbs={paginated} />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </motion.div>
      </section>
    </main>
  )
}
