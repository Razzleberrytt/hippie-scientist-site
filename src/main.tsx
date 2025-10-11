import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom'; // Use HashRouter for GitHub Pages compatibility
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { initConsentDefault } from './lib/consent';
import { loadAnalytics, onConsentChange } from './lib/loadAnalytics';
import { initTheme } from './lib/theme';
import './index.css';
import './styles/clamp.css';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations?.()
    .then((rs) => {
      rs.forEach((r) => r.unregister());
    })
    .catch(() => {});
}

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
        <HashRouter>
          <App />
        </HashRouter>
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
);
