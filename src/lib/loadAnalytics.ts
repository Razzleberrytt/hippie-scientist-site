import { getConsent } from './consent'

const GA_ID = process.env.NEXT_PUBLIC_GA4_ID ?? ''
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

export function loadAnalytics() {
  if (!GA_ID) return
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
    injectScript(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`)
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
