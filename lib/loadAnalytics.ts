import { canLoadGa4, canTrackAnalytics, getConsent, initConsentDefault } from '@/lib/consent'
import { getSocialAttribution } from '@/lib/social-attribution'

const GA_ID = process.env.NEXT_PUBLIC_GA4_ID?.trim() ?? ''
const AHREFS_ANALYTICS_KEY = process.env.NEXT_PUBLIC_AHREFS_ANALYTICS_KEY?.trim() ?? ''
const PLAUSIBLE_DOMAIN = 'thehippiescientist.net'
// Preserve the Plausible domain for future use without triggering unused variable warnings.
void PLAUSIBLE_DOMAIN

let scheduled = false
let gaBootstrapped = false

function injectScript(src: string, attrs: Record<string, string> = {}) {
  if (typeof document === 'undefined') return
  const script = document.createElement('script')
  script.src = src
  script.async = true
  Object.entries(attrs).forEach(([key, value]) => script.setAttribute(key, value))
  script.addEventListener(
    'error',
    () => {
      script.remove()
    },
    { once: true },
  )
  document.head.appendChild(script)
}

function injectScriptOnce(id: string, src: string, attrs: Record<string, string> = {}) {
  if (typeof document === 'undefined') return
  if (document.getElementById(id)) return
  injectScript(src, { id, ...attrs })
}

function bootstrapGaQueue() {
  if (!GA_ID || gaBootstrapped || typeof window === 'undefined' || !canLoadGa4()) return

  const dataLayer = (window.dataLayer = window.dataLayer || [])
  const gtag: NonNullable<Window['gtag']> = (command, ...args) => {
    dataLayer.push([command, ...args])
  }
  window.gtag = gtag
  // Consent Mode must be enqueued before any GA configuration or collection.
  initConsentDefault()
  gtag('js', new Date())
  gtag('config', GA_ID, { anonymize_ip: true, send_page_view: false })
  gaBootstrapped = true
}

function loadAnalyticsNow() {
  scheduled = false
  // Only GA4 bypasses explicit opt-in. Ahrefs remains consent-gated.
  if (GA_ID && canLoadGa4()) {
    bootstrapGaQueue()
    injectScriptOnce('ga4-script', `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`)
  }
  if (AHREFS_ANALYTICS_KEY && canTrackAnalytics()) {
    injectScriptOnce('ahrefs-analytics', 'https://analytics.ahrefs.com/analytics.js', {
      'data-key': AHREFS_ANALYTICS_KEY,
    })
  }
}

function scheduleAnalyticsLoad() {
  if (scheduled || typeof window === 'undefined') return
  const gaNeeded = GA_ID && canLoadGa4() && !document.getElementById('ga4-script')
  const ahrefsNeeded = AHREFS_ANALYTICS_KEY && canTrackAnalytics() && !document.getElementById('ahrefs-analytics')
  if (!gaNeeded && !ahrefsNeeded) return
  scheduled = true

  const win = window as Window & {
    requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number
  }

  if (typeof win.requestIdleCallback === 'function') {
    win.requestIdleCallback(loadAnalyticsNow, { timeout: 2000 })
    return
  }

  window.setTimeout(loadAnalyticsNow, 1200)
}

export function loadAnalytics() {
  // Preserve explicit-consent requirements for first-party attribution and Ahrefs.
  if (canTrackAnalytics()) getSocialAttribution()
  if (!GA_ID && !AHREFS_ANALYTICS_KEY) return

  // GA4 is the sole default-on transport. Explicit denial and DNT/GPC prevent
  // both queue creation and script loading on fresh/reloaded pages.
  if (canLoadGa4()) bootstrapGaQueue()
  scheduleAnalyticsLoad()
}

export function onConsentChange() {
  const status = getConsent()
  if (status === 'granted') loadAnalytics()
}
