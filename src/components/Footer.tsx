import { useEffect, useState } from "react";
import ConsentManager from "./ConsentManager";
import { onOpenConsent } from "../lib/consentBus";
import NewsletterSignup from "./NewsletterSignup";
import NonEmpty from "./NonEmpty";
import { toHash } from "../lib/routing";

const exploreLinks = [
  { href: "/database", label: "Database" },
  { href: "/build", label: "Build a Blend" },
  { href: "/blog", label: "Blog" },
  { href: "/graph", label: "NeuroHerbGraph" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/contact", label: "Contact" },
  { href: "/sitemap", label: "Sitemap" },
];

let __renderedOnce = false;

export default function Footer({ showSignup = true }: { showSignup?: boolean }) {
  if (__renderedOnce) return null;
  __renderedOnce = true;

  const [open, setOpen] = useState(false);

  useEffect(() => onOpenConsent(() => setOpen(true)), []);

  return (
    <footer
      id="site-footer"
      className="relative z-10 mt-12 border-t border-white/10 bg-black/20 backdrop-blur sm:mt-16"
    >
      {showSignup && (
        <div className="mx-auto mt-12 max-w-5xl px-4 sm:px-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 sm:p-6">
            <NewsletterSignup />
          </div>
        </div>
      )}
      <div className="container grid gap-8 px-4 pb-10 pt-8 sm:grid-cols-2 sm:px-6 sm:pt-10">
        <NonEmpty>
          {exploreLinks.length > 0 && (
            <div>
              <h4 className="mb-2 font-semibold">Explore</h4>
              <ul className="space-y-1 text-sm">
                {exploreLinks.map(link => (
                  <li key={link.href}>
                    <a href={toHash(link.href)}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </NonEmpty>
        <NonEmpty>
          {legalLinks.length > 0 && (
            <div>
              <h4 className="mb-2 font-semibold">Legal</h4>
              <ul className="space-y-1 text-sm">
                {legalLinks.map(link => (
                  <li key={link.href}>
                    <a href={toHash(link.href)}>{link.label}</a>
                  </li>
                ))}
                <li>
                  <button className="link" type="button" onClick={() => setOpen(true)}>
                    Privacy settings
                  </button>
                </li>
              </ul>
            </div>
          )}
        </NonEmpty>
      </div>
      <div className="container px-4 pb-8 text-xs sm:px-6" style={{ color: "var(--muted-c)" }}>
        © 2025 The Hippie Scientist — All Rights Reserved
      </div>
      <ConsentManager open={open} onClose={() => setOpen(false)} />
    </footer>
  );
}
