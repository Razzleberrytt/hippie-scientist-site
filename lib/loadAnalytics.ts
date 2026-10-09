import { canTrackAnalytics, getConsent } from '@/lib/consent'
import { getSocialAttribution } from '@/lib/social-attribution'

const GA_ID = process.env.NEXT_PUBLIC_GA4_ID?.trim() ?? ''
const AHREFS_ANALYTICS_KEY = process.env.NEXT_PUBLIC_AHREFS_ANALYTICS_KEY?.trim() ?? ''
const PLAUSIBLE_DOMAIN = 'thehippiescientist.net'
// Preserve the Plausible domain for future use without triggering unused variable warnings.
void PLAUSIBLE_DOMAIN

let loaded = false
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
      loaded = false
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
  if (!GA_ID || gaBootstrapped || typeof window === 'undefined' || !canTrackAnalytics()) return

  const dataLayer = (window.dataLayer = window.dataLayer || [])
  const gtag: NonNullable<Window['gtag']> = (command, ...args) => {
    dataLayer.push([command, ...args])
  }
  window.gtag = gtag
  gtag('js', new Date())
  gtag('config', GA_ID, { anonymize_ip: true, send_page_view: false })
  gaBootstrapped = true
}

function loadAnalyticsNow() {
  if (loaded) return
  scheduled = false
  if (!GA_ID && !AHREFS_ANALYTICS_KEY) return
  if (!canTrackAnalytics()) return

  // The local GA command queue is created synchronously after consent so events
  // emitted before the deferred network script arrives are preserved.
  bootstrapGaQueue()

  if (GA_ID) {
    injectScriptOnce('ga4-script', `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`)
  }

  if (AHREFS_ANALYTICS_KEY) {
    injectScriptOnce('ahrefs-analytics', 'https://analytics.ahrefs.com/analytics.js', {
      'data-key': AHREFS_ANALYTICS_KEY,
    })
  }

  loaded = true
}

function scheduleAnalyticsLoad() {
  if (scheduled || loaded || typeof window === 'undefined') return
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
  if (!canTrackAnalytics()) return

  // A consented tagged landing needs its bounded session attribution even
  // without a configured GA4/Ahrefs transport. getSocialAttribution() owns
  // first-touch, input validation, and never stores raw query strings.
  getSocialAttribution()
  if (!GA_ID && !AHREFS_ANALYTICS_KEY) return

  // Bootstrap only the in-memory queue immediately. Network loading remains
  // deferred for performance, and nothing is created before analytics consent.
  bootstrapGaQueue()
  scheduleAnalyticsLoad()
}

export function onConsentChange() {
  const status = getConsent()
  if (status === 'granted') loadAnalytics()
}
