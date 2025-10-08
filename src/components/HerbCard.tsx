import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card from './ui/Card';
import { cleanLine, hasVal, titleCase } from '../lib/pretty';
import { chipClassFor } from '../lib/tags';

interface HerbCardProps {
  herb: Record<string, any>;
  index?: number;
}

export default function HerbCard({ herb, index = 0 }: HerbCardProps) {
  const [expanded, setExpanded] = useState(false);
  const intensity = String(herb.intensity || '').toLowerCase();
  const intensityClass = intensity.includes('strong')
    ? 'chip chip--warn font-semibold uppercase tracking-wide'
    : intensity.includes('moderate')
    ? 'chip chip--stim font-semibold uppercase tracking-wide'
    : intensity.includes('mild')
    ? 'chip chip--adapt font-semibold uppercase tracking-wide'
    : '';

  const compounds = Array.isArray(herb.compounds) ? herb.compounds.slice(0, 3) : [];
  const tags = Array.isArray(herb.tags) ? herb.tags.slice(0, 6) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 250, damping: 15, delay: index * 0.02 }}
      whileHover={{ scale: 1.015, y: -2 }}
      whileTap={{ scale: 0.985 }}
      className="h-full"
    >
      <Card className="flex h-full flex-col gap-4 p-4 transition-shadow duration-200 hover:shadow-glow md:p-5">
        <header className="stack">
          <h2 className="h2 text-lime-300">{herb.common || herb.scientific || herb.name}</h2>
          {hasVal(herb.scientific) && <p className="italic small text-white/65">{herb.scientific}</p>}
          {hasVal(intensity) && (
            <span className={intensityClass || 'chip'}>INTENSITY: {titleCase(intensity)}</span>
          )}
        </header>

        <section className="stack text-white/80">
          {hasVal(herb.description) && (
            <p className={`small text-white/85 ${expanded ? '' : 'line-clamp-3'}`}>
              {cleanLine(herb.description)}
            </p>
          )}
          {hasVal(herb.effects) && (
            <p className={`small text-white/70 ${expanded ? '' : 'line-clamp-3'}`}>
              <span className="text-white/85">Effects:</span> {cleanLine(herb.effects)}
            </p>
          )}
          {hasVal(herb.legalstatus) && (
            <p className="small text-white/60">
              <span className="text-white/75">Legal:</span> {cleanLine(herb.legalstatus)}
            </p>
          )}
          {tags.length > 0 && (
            <div className="cluster">
              {tags.map((t: string, i: number) => (
                <span key={i} className={chipClassFor(t)}>
                  {t}
                </span>
              ))}
            </div>
          )}
          {compounds.length > 0 && (
            <p className="small text-cyan-200">
              Active Compounds: {compounds.join(', ')}
            </p>
          )}
        </section>

        <footer className="mt-auto flex items-center justify-between text-sm">
          {(hasVal(herb.effects) || hasVal(herb.description)) && (
            <button
              type="button"
              className="text-sub underline decoration-dotted underline-offset-4 transition hover:text-text"
              onClick={() => setExpanded(value => !value)}
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
          <Link
            to={`/herb/${herb.slug ?? ''}`}
            className="text-sub underline underline-offset-4 transition hover:text-text"
          >
            View details
          </Link>
        </footer>
      </Card>
    </motion.div>
  );
}
