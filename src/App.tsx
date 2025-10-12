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
import Layout from '@/components/Layout';
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
    <div id="app-root" className="min-h-screen" style={{ overflowX: "hidden", maxWidth: "100vw" }}>
      <Layout>
        <div className="relative z-10">
          <RedirectHandler />
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
      </Layout>
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
        className="relative z-10 flex-1"
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
