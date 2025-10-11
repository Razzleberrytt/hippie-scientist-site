import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import TrippyShader from '@/components/TrippyShader';
import { TrippyProvider, useTrippy } from '@/lib/trippy';
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

function Shell() {
  const { level } = useTrippy();

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      {level !== 'off' && <TrippyShader />}
      <App />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        {/* HashRouter prevents 404 on refresh by using URL hash for routing */}
        <HashRouter>
          <TrippyProvider>
            <Shell />
          </TrippyProvider>
        </HashRouter>
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
);
