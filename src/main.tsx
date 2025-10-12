import React from 'react';
import ReactDOM from 'react-dom/client';
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
        <TrippyProvider>
          <App />
        </TrippyProvider>
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
);
