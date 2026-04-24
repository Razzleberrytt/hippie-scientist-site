import React, { Suspense, lazy } from 'react'
import { Routes, Route, Outlet, useLocation, Navigate, useParams, Link } from 'react-router-dom'
import { AnimatePresence, motion } from '@/lib/motion'
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const HerbsPage = lazy(() => import('./pages/Herbs'))
const Favorites = lazy(() => import('./pages/Favorites'))
const BuildBlend = lazy(() => import('./pages/BuildBlend'))
const BlendView = lazy(() => import('./pages/BlendView'))
const NotFound = lazy(() => import('./pages/NotFound'))
import { RedirectHandler } from './RedirectHandler'
import { useGA } from './lib/useGA'
const HerbIndex = lazy(() => import('./pages/HerbIndex'))
const CompoundsPage = lazy(() => import('./pages/Compounds'))
const HerbDetail = lazy(() => import('./pages/HerbDetail'))
const Compare = lazy(() => import('./pages/Compare'))
const DataReport = lazy(() => import('./pages/DataReport'))
const DataFix = lazy(() => import('./pages/DataFix'))
const Sitemap = lazy(() => import('./pages/Sitemap'))
const Newsletter = lazy(() => import('./pages/Newsletter'))
const Contact = lazy(() => import('./pages/Contact'))
const Contribute = lazy(() => import('./pages/Contribute'))
import Footer from './components/Footer'
import AppToaster from './components/ui/Toaster'
import ConsentBanner from './components/ConsentBanner'
import ErrorBoundary from './components/ErrorBoundary'
import SiteLayout from '@/components/SiteLayout'
import NavBar from './components/NavBar'
import Meta from '@/components/Meta'
const BlogList = lazy(() => import('./pages/BlogList'))
const BlogPost = lazy(() => import('./pages/BlogPost'))
const GraphPage = lazy(() => import('./pages/Graph'))
const Theme = lazy(() => import('./pages/Theme'))
const CompoundDetail = lazy(() => import('./pages/CompoundDetail'))
const StarterPackSuccess = lazy(() => import('./pages/StarterPackSuccess'))
const Downloads = lazy(() => import('./pages/Downloads'))
const LearningPaths = lazy(() => import('./pages/LearningPaths'))
const HerbGoalPage = lazy(() => import('./pages/HerbGoalPage'))
const GoalProfilePage = lazy(() => import('./pages/GoalProfilePage'))
const BestHerbsEntryPage = lazy(() => import('./pages/BestHerbsEntryPage'))
const Methodology = lazy(() => import('./pages/Methodology'))
const InteractionsPage = lazy(() => import('./pages/InteractionsPage'))
const CollectionPage = lazy(() => import('./pages/CollectionPage'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const DisclaimerPage = lazy(() => import('./pages/DisclaimerPage'))
const UnknownCompoundSurvivalGuide = lazy(() => import('./pages/UnknownCompoundSurvivalGuide'))
const DevAnalyticsViewer = import.meta.env.DEV
  ? lazy(() => import('@/dev/AnalyticsViewer'))
  : null
import { useGrowthTracking } from '@/lib/growth'
import { isAnalyticsRouteEnabled } from '@/lib/analyticsAccess'
// Import other pages as needed

function ChunkErrorFallback() {
  return (
    <div className='container-page flex min-h-screen flex-col items-center justify-center gap-4 text-center'>
      <p className='text-lg font-semibold text-white'>Something went wrong loading this page.</p>
      <p className='text-sm text-white/65'>This can happen after a site update. Try refreshing.</p>
      <button onClick={() => window.location.reload()} className='btn-primary mt-2'>
        Refresh page
      </button>
    </div>
  )
}

export default function App() {
  useGA()
  useGrowthTracking()
  const location = useLocation()

  return (
    <div id='app-root'>
      <SiteLayout>
        <NavBar />
        <div className='relative z-10 flex-1'>
          <RedirectHandler />
          <ErrorBoundary fallback={<ChunkErrorFallback />}>
            <Suspense fallback={<div className='container-page py-8 text-white/75'>Loading…</div>}>
              <Routes>
                <Route element={<RootLayout />}>
                  <Route path='/' element={<Home />} />
                  <Route path='/about' element={<About />} />
                  <Route path='/database' element={<Navigate to='/herbs' replace />} />
                  <Route path='/herbs' element={<HerbsPage />} />
                  <Route path='/compounds' element={<CompoundsPage />} />
                  <Route path='/browse' element={<Navigate to='/browse/herbs' replace />} />
                  <Route path='/browse/herbs' element={<HerbIndex />} />
                  <Route path='/browse/compounds' element={<Navigate to='/compounds' replace />} />
                  <Route path='/blend' element={<BlendView />} />
                  <Route path='/build' element={<BuildBlend />} />
                  <Route path='/starter-pack-success' element={<StarterPackSuccess />} />
                  <Route path='/downloads' element={<Downloads />} />
                  <Route
                    path='/guides/unknown-compound-survival-guide'
                    element={<UnknownCompoundSurvivalGuide />}
                  />
                  <Route path='/learning' element={<LearningPaths />} />
                  <Route path='/herbs-for-:goal' element={<HerbGoalPage />} />
                  <Route path='/goals/:slug' element={<GoalProfilePage />} />
                  <Route path='/best-herbs-for-:intent' element={<BestHerbsEntryPage />} />
                  <Route path='/favorites' element={<Favorites />} />
                  <Route path='/newsletter' element={<Newsletter />} />
                  <Route path='/contact' element={<Contact />} />
                  <Route path='/privacy' element={<PrivacyPolicy />} />
                  <Route path='/privacy-policy' element={<PrivacyPolicy />} />
                  <Route path='/disclaimer' element={<DisclaimerPage />} />
                  <Route path='/contribute' element={<Contribute />} />
                  <Route path='/methodology' element={<Methodology />} />
                  <Route path='/interactions' element={<InteractionsPage />} />
                  <Route path='/collections/:slug' element={<CollectionPage />} />
                  <Route
                    path='/analytics'
                    element={
                      isAnalyticsRouteEnabled() ? <AnalyticsPage /> : <AnalyticsNotAvailable />
                    }
                  />
                  {/* Add other routes here */}
                  <Route path='/blog' element={<BlogList />} />
                  <Route path='/blog/page/:page' element={<BlogList />} />
                  <Route path='/blog/:slug' element={<BlogPost />} />
                  <Route path='/blog/:slug/' element={<LegacyBlogRedirect />} />
                  <Route path='/theme' element={<Theme />} />
                  <Route path='/herb-index' element={<Navigate to='/herbs' replace />} />
                  <Route path='/herb-index/*' element={<Navigate to='/herbs' replace />} />
                  <Route path='/herb/:slug' element={<LegacyHerbRedirect />} />
                  <Route path='/herbs/:slug' element={<HerbDetail />} />
                  <Route path='/compounds/:slug' element={<CompoundDetail />} />
                  <Route path='/compare' element={<Compare />} />
                  <Route path='/data-report' element={<DataReport />} />
                  <Route path='/data-fix' element={<DataFix />} />
                  <Route path='/sitemap' element={<Sitemap />} />
                  <Route path='*' element={<NotFound />} />
                </Route>
                <Route path='/graph' element={<GraphPage />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </div>
      </SiteLayout>
    </div>
  )
}

function AnalyticsNotAvailable() {
  return (
    <section className='container-page py-16 text-center'>
      <Meta
        title='Analytics Not Available | The Hippie Scientist'
        description='This internal analytics page is disabled for public visitors.'
        path='/analytics'
        noindex
      />
      <div className='mx-auto max-w-lg rounded-2xl border border-white/15 bg-white/5 p-6 text-white/85'>
        <h1 className='text-2xl font-semibold text-white'>Analytics not available</h1>
        <p className='mt-3 text-sm text-white/70'>
          This page is disabled for public visitors in production.
        </p>
        <Link
          className='mt-5 inline-block text-sm font-medium text-emerald-300 hover:text-emerald-200'
          to='/'
        >
          Return home
        </Link>
      </div>
    </section>
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
      {DevAnalyticsViewer ? (
        <Suspense fallback={null}>
          <DevAnalyticsViewer />
        </Suspense>
      ) : null}
    </div>
  )
}
