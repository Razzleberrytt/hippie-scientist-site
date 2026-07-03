import { getConsent } from './consent'

const GA_ID = process.env.NEXT_PUBLIC_GA4_ID?.trim() ?? ''
const AHREFS_ANALYTICS_KEY = process.env.NEXT_PUBLIC_AHREFS_ANALYTICS_KEY?.trim() ?? ''
const PLAUSIBLE_DOMAIN = 'thehippiescientist.net'
// Preserve the Plausible domain for future use without triggering unused variable warnings.
void PLAUSIBLE_DOMAIN

let loaded = false

function injectScript(src: string, attrs: Record<string, string> = {}) {
  if (typeof document === 'undefined') return
  const script = document.createElement('script')
  script.src = src
  script.async = true
  Object.entries(attrs).forEach(([key, value]) => script.setAttribute(key, value))
  document.head.appendChild(script)
}

function injectScriptOnce(id: string, src: string, attrs: Record<string, string> = {}) {
  if (typeof document === 'undefined') return
  if (document.getElementById(id)) return
  injectScript(src, { id, ...attrs })
}

export function loadAnalytics() {
  if (loaded) return
  if (typeof window === 'undefined') return

  const consent = getConsent()
  if (consent !== 'granted') return

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

  // injectScript('https://plausible.io/js/script.js', {
  //   'data-domain': PLAUSIBLE_DOMAIN,
  //   defer: 'true',
  // });

  loaded = true
}

export function onConsentChange() {
  const status = getConsent()
  if (status === 'granted') loadAnalytics()
}
