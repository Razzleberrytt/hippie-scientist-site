import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './contexts/theme';
import Navbar from './components/Navbar';
import FloatingElements from './components/FloatingElements';
import MouseTrail from './components/MouseTrail';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Research = lazy(() => import('./pages/Research'));
const Database = lazy(() => import('./pages/Database'));
const Safety = lazy(() => import('./pages/Safety'));
const Community = lazy(() => import('./pages/Community'));
const NotFound = lazy(() => import('./pages/NotFound'));

const PageRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/research" element={<Research />} />
          <Route path="/database" element={<Database />} />
          <Route path="/safety" element={<Safety />} />
          <Route path="/community" element={<Community />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => (
  <HelmetProvider>
    <ThemeProvider>
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <Router>
            <Navbar />
            <MouseTrail />
            <FloatingElements />
            <PageRoutes />
          </Router>
        </Suspense>
      </ErrorBoundary>
    </ThemeProvider>
  </HelmetProvider>
);

export default App;
