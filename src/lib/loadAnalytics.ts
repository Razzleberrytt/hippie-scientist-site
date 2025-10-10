import { getConsent } from './consent';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: any[]) => void;
  }
}

const GA_ID = 'G-7DFJL2FC6F';
const PLAUSIBLE_DOMAIN = 'thehippiescientist.net';
// Preserve the Plausible domain for future use without triggering unused variable warnings.
void PLAUSIBLE_DOMAIN;

let loaded = false;

function injectScript(src: string, attrs: Record<string, string> = {}) {
  if (typeof document === 'undefined') return;
  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  Object.entries(attrs).forEach(([key, value]) => script.setAttribute(key, value));
  document.head.appendChild(script);
}

export function loadAnalytics() {
  if (loaded) return;
  if (typeof window === 'undefined') return;

  const consent = getConsent();
  if (consent !== 'granted') return;

  if (GA_ID) {
    const dataLayer = (window.dataLayer = window.dataLayer || []);
    const gtag = (...args: any[]) => {
      (dataLayer as any).push(args);
    };
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
    injectScript(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`);
  }

  // injectScript('https://plausible.io/js/script.js', {
  //   'data-domain': PLAUSIBLE_DOMAIN,
  //   defer: 'true',
  // });

  loaded = true;
  console.log('Analytics loaded (consent granted).');
}

export function onConsentChange() {
  const status = getConsent();
  if (status === 'granted') loadAnalytics();
}
