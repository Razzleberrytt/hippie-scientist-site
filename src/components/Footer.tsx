import { useEffect, useState } from "react";
import ConsentManager from "./ConsentManager";
import { onOpenConsent } from "../lib/consentBus";
import NewsletterSignup from "./NewsletterSignup";

export default function Footer({ showSignup = true }: { showSignup?: boolean }) {
  const [open, setOpen] = useState(false);

  useEffect(() => onOpenConsent(() => setOpen(true)), []);

  return (
    <footer
      id="site-footer"
      className="relative z-0 mt-12 border-t border-white/10 bg-surface/80 backdrop-blur sm:mt-16"
      style={{ background: "color-mix(in oklab, var(--surface-c) 88%, transparent 12%)" }}
    >
      {showSignup && (
        <NewsletterSignup className="mx-auto max-w-3xl px-4 py-8 sm:py-10" />
      )}
      <div className="container grid gap-8 px-4 pb-10 pt-8 sm:grid-cols-2 sm:px-6 sm:pt-10">
        <div>
          <h4 className="mb-2 font-semibold">Explore</h4>
          <ul className="space-y-1 text-sm">
            <li><a href="/database">Database</a></li>
            <li><a href="/build">Build a Blend</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="/graph">NeuroHerbGraph</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-2 font-semibold">Legal</h4>
          <ul className="space-y-1 text-sm">
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/disclaimer">Disclaimer</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/sitemap">Sitemap</a></li>
            <li>
              <button className="link" type="button" onClick={() => setOpen(true)}>
                Privacy settings
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div className="container px-4 pb-8 text-xs sm:px-6" style={{ color: "var(--muted-c)" }}>
        © 2025 The Hippie Scientist — All Rights Reserved
      </div>
      <ConsentManager open={open} onClose={() => setOpen(false)} />
    </footer>
  );
}
