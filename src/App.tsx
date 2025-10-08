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
import SiteHeader from './components/SiteHeader';
import Footer from './components/Footer';
import AppToaster from './components/ui/Toaster';
// Import other pages as needed

export default function App() {
  useGA();
  return (
    <>
      <RedirectHandler />
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/database" element={<Database />} />
          <Route path="/blend" element={<BuildBlend />} />
          <Route path="/favorites" element={<Favorites />} />
          {/* Add other routes here */}
          <Route path="/herb-index" element={<HerbIndex />} />
          <Route path="/herb/:slug" element={<HerbDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/data-report" element={<DataReport />} />
          <Route path="/data-fix" element={<DataFix />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function RootLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-bg text-text">
      <SiteHeader />
      <main className="pt-2 md:pt-4 pb-10">
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
      <AppToaster />
    </div>
  );
}
