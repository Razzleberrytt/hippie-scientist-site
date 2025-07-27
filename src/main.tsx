import React from 'react'
import ReactDOM from 'react-dom/client'
// HashRouter keeps URLs after a '#' so GitHub Pages can serve the SPA without 404s
import { HashRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import { ThemeProvider } from './contexts/theme'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

const params = new URLSearchParams(window.location.search)
const redirect = params.get('redirect')
if (redirect) {
  const url = decodeURIComponent(redirect)
  window.history.replaceState(null, '', url)
}

registerSW({ immediate: true })

// Store the current path so 404.html can redirect after refresh
window.addEventListener('beforeunload', () => {
  sessionStorage.redirectTo = window.location.pathname
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <ThemeProvider>
          {/* Hash-based routing avoids server-side routing issues on GitHub Pages */}
          <HashRouter>
            <App />
          </HashRouter>
        </ThemeProvider>
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
)
