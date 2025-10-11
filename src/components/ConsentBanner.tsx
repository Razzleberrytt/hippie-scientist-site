import React, { useEffect, useState } from 'react';
import {
  getConsent,
  setConsent,
  initConsentDefault,
  getSystemNoTracking,
} from '../lib/consent';
import { hashLink } from '../lib/routes';

export default function ConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    initConsentDefault();
    const c = getConsent();
    setShow(c === null);
  }, []);

  if (!show) return null;

  const dnt = getSystemNoTracking();

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto max-w-3xl m-3 rounded-xl border border-white/10 bg-black/80 backdrop-blur p-4 text-sm text-white/85">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-1">
            <strong className="font-semibold">Privacy &amp; cookies</strong>
            <p className="text-white/70">
              We use privacy-friendly analytics to understand site usage. No personal data unless you opt in.
              Read our <a className="underline" href={hashLink('/privacy')}>Privacy Policy</a>.
              {dnt && (
                <span className="ml-2 text-amber-300">
                  Detected “Do Not Track / GPC”. Defaulting to no tracking.
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              className="px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10"
              onClick={() => {
                setConsent('denied');
                setShow(false);
              }}
            >
              Decline
            </button>
            <button
              className="px-3 py-1.5 rounded-lg font-medium text-sm border bg-gradient-to-r from-lime-400/30 to-cyan-400/20 text-lime-200 border-lime-300/20 hover:from-lime-400/40 hover:to-cyan-400/30"
              onClick={() => {
                setConsent('granted');
                setShow(false);
                import('../lib/loadAnalytics').then((module) => module.loadAnalytics());
              }}
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
