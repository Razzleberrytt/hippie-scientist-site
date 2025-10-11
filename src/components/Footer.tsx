import { useEffect, useState } from "react";
import ConsentManager from "./ConsentManager";
import { onOpenConsent } from "../lib/consentBus";
import NewsletterSignup from "./NewsletterSignup";

export default function Footer(){
  const [open, setOpen] = useState(false);

  useEffect(() => onOpenConsent(() => setOpen(true)), []);

  return (
    <footer id="site-footer" className="border-t mt-16 sm:mt-24"
      style={{background:"color-mix(in oklab, var(--surface-c) 88%, transparent 12%)"}}>
      <div className="container py-10 grid gap-8 sm:grid-cols-2">
        <NewsletterSignup />
        <section className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Explore</h4>
            <ul className="space-y-1 text-sm">
              <li><a href="/database">Database</a></li>
              <li><a href="/build">Build a Blend</a></li>
              <li><a href="/blog">Blog</a></li>
              <li><a href="/graph">NeuroHerbGraph</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Legal</h4>
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
        </section>
      </div>
      <div className="container py-6 text-xs" style={{color:"var(--muted-c)"}}>
        © 2025 The Hippie Scientist — All Rights Reserved
      </div>
      <ConsentManager open={open} onClose={() => setOpen(false)} />
    </footer>
  );
}
