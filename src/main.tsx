import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import { TrippyProvider } from '@/lib/trippy'
import { initConsentDefault } from './lib/consent'
import { loadAnalytics, onConsentChange } from './lib/loadAnalytics'
import { unregisterServiceWorkers } from './sw-unregister'
import './index.css'
import './styles/clamp.css'

unregisterServiceWorkers()

initConsentDefault()
loadAnalytics()

window.addEventListener('storage', (event: StorageEvent) => {
  if (event.key === 'consent.v1') onConsentChange()
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <TrippyProvider>
            <App />
          </TrippyProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
)
