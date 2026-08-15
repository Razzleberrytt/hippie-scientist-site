import { canTrackAnalytics, getConsent } from '@/lib/consent'

const GA_ID = process.env.NEXT_PUBLIC_GA4_ID?.trim() ?? ''
const AHREFS_ANALYTICS_KEY = process.env.NEXT_PUBLIC_AHREFS_ANALYTICS_KEY?.trim() ?? ''
const PLAUSIBLE_DOMAIN = 'thehippiescientist.net'
// Preserve the Plausible domain for future use without triggering unused variable warnings.
void PLAUSIBLE_DOMAIN

let loaded = false
let scheduled = false

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

function loadAnalyticsNow() {
  if (loaded) return
  scheduled = false
  if (!GA_ID && !AHREFS_ANALYTICS_KEY) return
  if (!canTrackAnalytics()) return

  if (GA_ID) {
    const dataLayer = (window.dataLayer = window.dataLayer || [])
    const gtag: NonNullable<Window['gtag']> = (command, ...args) => {
      dataLayer.push([command, ...args])
    }
    window.gtag = gtag
    gtag('js', new Date())
    gtag('config', GA_ID, { anonymize_ip: true })
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
  if (!GA_ID && !AHREFS_ANALYTICS_KEY) return
  if (!canTrackAnalytics()) return
  scheduleAnalyticsLoad()
}

export function onConsentChange() {
  const status = getConsent()
  if (status === 'granted') loadAnalytics()
}
