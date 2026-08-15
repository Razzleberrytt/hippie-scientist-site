'use client'

import { useEffect, useRef, useState } from 'react'
import type { Heading } from './extractHeadings'

interface Props {
  headings: Heading[];
}

export default function TableOfContents({ headings }: Props) {
  const [activeId, setActiveId] = useState<string>('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.current?.observe(el);
    });

    return () => observer.current?.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  const links = (
    <nav aria-label="Table of contents">
      <ol className="space-y-0.5">
        {headings.map(h => (
          <li key={h.id} className={h.level === 3 ? 'pl-3' : ''}>
            <a
              href={`#${h.id}`}
              onClick={() => setMobileOpen(false)}
              className={[
                'block border-l-2 px-3 py-2 leading-snug transition-colors',
                h.level === 3 ? 'text-xs' : 'text-sm',
                activeId === h.id
                  ? 'border-[color:var(--hs-gold)] bg-[color:color-mix(in_srgb,var(--tone)_6%,transparent)] font-semibold text-[color:var(--hs-ink)]'
                  : 'border-transparent text-[color:var(--hs-body)] hover:border-[color:color-mix(in_srgb,var(--tone)_28%,transparent)] hover:bg-[color:color-mix(in_srgb,var(--tone)_4%,transparent)] hover:text-[color:var(--hs-ink)]',
              ].join(' ')}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );

  return (
    <>
      <div className="rounded-[1.2rem] border border-[color:var(--hs-hairline)] bg-[color:color-mix(in_srgb,var(--hs-surface)_90%,transparent)] lg:hidden">
        <button
          type="button"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(o => !o)}
          className="flex min-h-12 w-full items-center justify-between px-4 py-3 text-sm font-semibold text-[color:var(--hs-ink)]"
        >
          On this page
          <svg
            className={`size-4 transition-transform ${mobileOpen ? 'rotate-180' : ''}`}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {mobileOpen && (
          <div className="border-t border-[color:var(--hs-hairline)] px-3 py-3">
            {links}
          </div>
        )}
      </div>

      <div className="hidden lg:block">
        <p className="mb-3 font-mono text-[0.64rem] font-bold uppercase tracking-[0.14em] text-[color:var(--hs-gold-ink)]">
          On this page
        </p>
        {links}
      </div>
    </>
  );
}
