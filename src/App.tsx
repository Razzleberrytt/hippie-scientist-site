import React from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Home from './pages/Home';
import About from './pages/About';
import Database from './pages/Database';
import Favorites from './pages/Favorites';
import BuildBlend from './pages/BuildBlend';
import NotFound from './pages/NotFound';
import { RedirectHandler } from './RedirectHandler';
import { useGA } from './lib/useGA';
import HerbIndex from './pages/HerbIndex';
import HerbDetail from './pages/HerbDetail';
import Compare from './pages/Compare';
import DataReport from './pages/DataReport';
import DataFix from './pages/DataFix';
import Sitemap from './pages/Sitemap';
import Newsletter from './pages/Newsletter';
import Contact from './pages/Contact';
import Header from './components/Header';
import Footer from './components/Footer';
import AppToaster from './components/ui/Toaster';
import ConsentBanner from './components/ConsentBanner';
import AmbientCursor from './components/AmbientCursor';
import MeltBackground from '@/components/bg/MeltBackground';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import GraphPage from './pages/Graph';
import Theme from './pages/Theme';
import { useTrippy } from '@/lib/trippy';
// Import other pages as needed

export default function App() {
  useGA();
  const { level } = useTrippy();
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-transparent text-text">
      <RedirectHandler />
      <MeltBackground />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/20 via-black/10 to-transparent" />
      {level !== "off" && <AmbientCursor />}
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/database" element={<Database />} />
          <Route path="/blend" element={<BuildBlend />} />
          <Route path="/build" element={<BuildBlend />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/newsletter" element={<Newsletter />} />
          <Route path="/contact" element={<Contact />} />
          {/* Add other routes here */}
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/theme" element={<Theme />} />
          <Route path="/herb-index" element={<HerbIndex />} />
          <Route path="/herb/:slug" element={<HerbDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/data-report" element={<DataReport />} />
          <Route path="/data-fix" element={<DataFix />} />
          <Route path="/sitemap" element={<Sitemap />} />
        </Route>
        <Route path="/graph" element={<GraphPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function RootLayout() {
  const location = useLocation();

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main
        id="main"
        className="relative z-0 flex-1"
      >
        <AnimatePresence mode="wait">
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
  );
}
