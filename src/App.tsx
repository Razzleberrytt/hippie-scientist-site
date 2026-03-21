import React from 'react'
import { Routes, Route, Outlet, useLocation, Navigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Home from './pages/Home'
import About from './pages/About'
import HerbsPage from './pages/Herbs'
import Favorites from './pages/Favorites'
import BuildBlend from './pages/BuildBlend'
import NotFound from './pages/NotFound'
import { RedirectHandler } from './RedirectHandler'
import { useGA } from './lib/useGA'
import HerbIndex from './pages/HerbIndex'
import CompoundIndex from './pages/CompoundIndex'
import CompoundsPage from './pages/Compounds'
import HerbDetail from './pages/HerbDetail'
import Compare from './pages/Compare'
import DataReport from './pages/DataReport'
import DataFix from './pages/DataFix'
import Sitemap from './pages/Sitemap'
import Newsletter from './pages/Newsletter'
import Contact from './pages/Contact'
import Footer from './components/Footer'
import AppToaster from './components/ui/Toaster'
import ConsentBanner from './components/ConsentBanner'
import AmbientCursor from './components/AmbientCursor'
import SiteLayout from '@/components/SiteLayout'
import NavBar from './components/NavBar'
import BlogList from './pages/BlogList'
import BlogPost from './pages/BlogPost'
import GraphPage from './pages/Graph'
import Theme from './pages/Theme'
import CompoundDetail from './pages/CompoundDetail'
import StarterPackSuccess from './pages/StarterPackSuccess'
import Downloads from './pages/Downloads'
import LearningPaths from './pages/LearningPaths'
import HerbGoalPage from './pages/HerbGoalPage'
import { useTrippy } from '@/lib/trippy'
import { useGrowthTracking } from '@/lib/growth'
// Import other pages as needed

export default function App() {
  useGA()
  useGrowthTracking()
  const { level } = useTrippy()
  return (
    <div id='app-root'>
      <SiteLayout>
        <NavBar />
        <div className='relative z-10 flex-1'>
          <RedirectHandler />
          {level !== 'off' && <AmbientCursor />}
          <Routes>
            <Route element={<RootLayout />}>
              <Route path='/' element={<Home />} />
              <Route path='/about' element={<About />} />
              <Route path='/database' element={<Navigate to='/herbs' replace />} />
              <Route path='/herbs' element={<HerbsPage />} />
              <Route path='/compounds' element={<CompoundsPage />} />
              <Route path='/browse' element={<Navigate to='/browse/herbs' replace />} />
              <Route path='/browse/herbs' element={<HerbIndex />} />
              <Route path='/browse/compounds' element={<CompoundIndex />} />
              <Route path='/blend' element={<BuildBlend />} />
              <Route path='/build' element={<BuildBlend />} />
              <Route path='/starter-pack-success' element={<StarterPackSuccess />} />
              <Route path='/downloads' element={<Downloads />} />
              <Route path='/learning' element={<LearningPaths />} />
              <Route path='/herbs-for-:goal' element={<HerbGoalPage />} />
              <Route path='/favorites' element={<Favorites />} />
              <Route path='/newsletter' element={<Newsletter />} />
              <Route path='/contact' element={<Contact />} />
              {/* Add other routes here */}
              <Route path='/blog' element={<BlogList />} />
              <Route path='/blog/page/:page' element={<BlogList />} />
              <Route path='/blog/:slug' element={<BlogPost />} />
              <Route path='/blog/:slug/' element={<LegacyBlogRedirect />} />
              <Route path='/theme' element={<Theme />} />
              <Route path='/herb-index' element={<HerbIndex />} />
              <Route path='/herb/:slug' element={<LegacyHerbRedirect />} />
              <Route path='/herbs/:slug' element={<HerbDetail />} />
              <Route path='/compounds/:slug' element={<CompoundDetail />} />
              <Route path='/compare' element={<Compare />} />
              <Route path='/data-report' element={<DataReport />} />
              <Route path='/data-fix' element={<DataFix />} />
              <Route path='/sitemap' element={<Sitemap />} />
            </Route>
            <Route path='/graph' element={<GraphPage />} />
            <Route path='*' element={<NotFound />} />
          </Routes>
        </div>
      </SiteLayout>
    </div>
  )
}

function LegacyHerbRedirect() {
  const { slug = '' } = useParams()
  return <Navigate to={`/herbs/${encodeURIComponent(slug)}`} replace />
}

function LegacyBlogRedirect() {
  const { slug = '' } = useParams()
  return <Navigate to={`/blog/${encodeURIComponent(slug)}`} replace />
}

function RootLayout() {
  const location = useLocation()

  return (
    <div className='relative flex min-h-screen flex-col'>
      <main id='main' className='main relative z-10 flex-1'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <ConsentBanner />
      <AppToaster />
    </div>
  )
}
