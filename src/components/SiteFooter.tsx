import { useEffect, useState } from "react";
import ConsentManager from "./ConsentManager";
import { onOpenConsent } from "../lib/consentBus";

export default function SiteFooter() {
  const [open, setOpen] = useState(false);

  useEffect(() => onOpenConsent(() => setOpen(true)), []);

  return (
    <footer className="border-t mt-12" style={{ background: "color-mix(in oklab, var(--surface-c) 88%, transparent 12%)" }}>
      <div className="container py-10 grid gap-8 sm:grid-cols-2">
        <section className="card p-4" style={{ background: "color-mix(in oklab, var(--surface-c) 94%, transparent 6%)" }}>
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-c)" }}>
            Join our Newsletter
          </h3>
          <form className="flex flex-col gap-2 sm:flex-row">
            <input
              className="input focus-glow"
              placeholder="you@example.com"
              type="email"
              aria-label="Email address"
            />
            <button className="btn primary hover-glow focus-glow" type="submit">
              Subscribe
            </button>
          </form>
        </section>
        <section className="grid grid-cols-2 gap-4" style={{ color: "var(--text-c)" }}>
          <div>
            <h4 className="font-semibold mb-2">Explore</h4>
            <ul className="space-y-1 text-sm" style={{ color: "var(--muted-c)" }}>
              <li><a href="/database">Database</a></li>
              <li><a href="/build">Build a Blend</a></li>
              <li><a href="/blog">Blog</a></li>
              <li><a href="/graph">NeuroHerbGraph</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Legal</h4>
            <ul className="space-y-1 text-sm" style={{ color: "var(--muted-c)" }}>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/disclaimer">Disclaimer</a></li>
              <li><a href="/contact">Contact</a></li>
              <li><a href="/sitemap">Sitemap</a></li>
              <li>
                <button
                  type="button"
                  className="link"
                  onClick={() => setOpen(true)}
                  style={{ color: "var(--accent)" }}
                >
                  Privacy settings
                </button>
              </li>
            </ul>
          </div>
        </section>
      </div>
      <div className="container py-6 text-xs" style={{ color: "var(--muted-c)" }}>
        © {new Date().getFullYear()} The Hippie Scientist — All Rights Reserved
      </div>
      <ConsentManager open={open} onClose={() => setOpen(false)} />
    </footer>
  );
}
