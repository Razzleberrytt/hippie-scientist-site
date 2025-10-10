import { useEffect, useState } from "react";
import ConsentManager from "./ConsentManager";
import { onOpenConsent } from "../lib/consentBus";

export default function SiteFooter() {
  const [open, setOpen] = useState(false);
  const year = new Date().getFullYear();

  useEffect(() => onOpenConsent(() => setOpen(true)), []);

  return (
    <footer className="mt-10 border-t border-white/10 bg-black/70 text-sm text-white/70 backdrop-blur">
      <div className="container mx-auto flex flex-col gap-6 px-4 py-8 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="bg-gradient-to-r from-lime-300 via-cyan-300 to-pink-400 bg-clip-text text-base font-semibold text-transparent">
            The Hippie Scientist
          </h2>
          <p className="max-w-sm text-white/60">
            Psychedelic Botany & Conscious Exploration.
            <br />
            Updated daily with new herbs and compounds.
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-4 text-white/70">
          <a href="/database" className="hover:text-lime-300">
            Database
          </a>
          <a href="/build" className="hover:text-cyan-300">
            Build a Blend
          </a>
          <a href="/newsletter" className="hover:text-lime-300">
            Newsletter
          </a>
          <a href="/blog" className="hover:text-cyan-300">
            Blog
          </a>
          <a href="/graph" className="hover:text-cyan-300">
            NeuroHerbGraph
          </a>
          <a href="/about" className="hover:text-pink-300">
            About
          </a>
        </nav>

        <nav className="flex flex-wrap items-center gap-4 text-white/60">
          <a href="/privacy" className="hover:text-cyan-300">
            Privacy Policy
          </a>
          <a href="/disclaimer" className="hover:text-cyan-300">
            Disclaimer
          </a>
          <a href="/contact" className="hover:text-cyan-300">
            Contact
          </a>
          <a href="/sitemap" className="hover:text-cyan-300">
            Sitemap
          </a>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="underline hover:text-lime-300"
          >
            Privacy settings
          </button>
        </nav>

        <div className="flex items-center gap-4 text-white/60">
          <a
            href="https://github.com/razzleberrytt"
            aria-label="GitHub"
            className="transition hover:text-lime-300"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.17c-3.34.73-4.04-1.61-4.04-1.61A3.17 3.17 0 0 0 3.3 17.7c-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.26 1.84 1.26 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22a4.5 4.5 0 0 1 .12-3.17s1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.02 0c2.3-1.55 3.3-1.23 3.3-1.23a4.5 4.5 0 0 1 .12 3.17 4.54 4.54 0 0 1 1.24 3.22c0 4.61-2.81 5.62-5.49 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.21.7.83.58A12 12 0 0 0 12 .5z" />
            </svg>
          </a>
          <a
            href="https://twitter.com"
            aria-label="X / Twitter"
            className="transition hover:text-cyan-300"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.19 4.19 0 0 0 1.84-2.32 8.39 8.39 0 0 1-2.66 1.02 4.18 4.18 0 0 0-7.123.81A11.88 11.88 0 0 1 3.1 4.67a4.17 4.17 0 0 0 1.3 5.57 4.14 4.14 0 0 1-1.9-.53v.05a4.19 4.19 0 0 0 3.35 4.1 4.19 4.19 0 0 1-1.89.07 4.19 4.19 0 0 0 3.9 2.9A8.39 8.39 0 0 1 2 19.54 11.85 11.85 0 0 0 8.29 21c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.35-.02-.53A8.33 8.33 0 0 0 22.46 6z" />
            </svg>
          </a>
        </div>
      </div>

      <div className="border-t border-white/10 py-3 text-center text-xs text-white/50">
        © {year} The Hippie Scientist — All Rights Reserved
      </div>

      <ConsentManager open={open} onClose={() => setOpen(false)} />
    </footer>
  );
}
