import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { TrippyProvider } from '@/lib/trippy';
import { initConsentDefault } from './lib/consent';
import { loadAnalytics, onConsentChange } from './lib/loadAnalytics';
import { initTheme } from './lib/theme';
import { unregisterServiceWorkers } from './sw-unregister';
import './index.css';
import './styles/clamp.css';

unregisterServiceWorkers();

initTheme();
initConsentDefault();
loadAnalytics();

window.addEventListener('storage', (event: StorageEvent) => {
  if (event.key === 'consent.v1') onConsentChange();
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        {/* HashRouter prevents 404 on refresh by using URL hash for routing */}
        <Router>
          <TrippyProvider>
            <App />
          </TrippyProvider>
        </Router>
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
);
