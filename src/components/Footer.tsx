import { useEffect, useState } from "react";
import ConsentManager from "./ConsentManager";
import { onOpenConsent } from "../lib/consentBus";
import NewsletterSignup from "./NewsletterSignup";
import NonEmpty from "./NonEmpty";

const exploreLinks = [
  { href: "/database", label: "Database" },
  { href: "/blend", label: "Build a Blend" },
  { href: "/blog", label: "Blog" },
  { href: "/graph", label: "NeuroHerbGraph" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/contact", label: "Contact" },
  { href: "/sitemap", label: "Sitemap" },
];

export default function Footer({ showSignup = true }: { showSignup?: boolean }) {
  const [open, setOpen] = useState(false);

  useEffect(() => onOpenConsent(() => setOpen(true)), []);

  return (
    <footer
      id="site-footer"
      className="relative z-0 mt-12 border-t border-white/10 bg-black/60 backdrop-blur-sm sm:mt-16"
    >
      {showSignup && (
        <NewsletterSignup className="mx-auto max-w-3xl px-4 py-8 sm:py-10" />
      )}
      <div className="container grid gap-8 px-4 pb-10 pt-8 sm:grid-cols-2 sm:px-6 sm:pt-10">
        <NonEmpty>
          {exploreLinks.length > 0 && (
            <div>
              <h4 className="mb-2 font-semibold">Explore</h4>
              <ul className="space-y-1 text-sm">
                {exploreLinks.map(link => (
                  <li key={link.href}>
                    <a href={link.href}>{link.label}</a>
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
                    <a href={link.href}>{link.label}</a>
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
