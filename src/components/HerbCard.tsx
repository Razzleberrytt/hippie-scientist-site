import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { cleanLine, hasVal, titleCase } from '../lib/pretty';

interface HerbCardProps {
  herb: Record<string, any>;
  index?: number;
}

export default function HerbCard({ herb, index = 0 }: HerbCardProps) {
  const [expanded, setExpanded] = useState(false);
  const intensity = String(herb.intensity || '').toLowerCase();
  const intensityClass = intensity.includes('strong')
    ? 'bg-red-500/20 border-red-500/20 text-red-200'
    : intensity.includes('moderate')
    ? 'bg-yellow-500/20 border-yellow-500/20 text-yellow-100'
    : intensity.includes('mild')
    ? 'bg-green-500/20 border-green-500/20 text-green-200'
    : 'bg-white/10 border-white/10 text-white/80';

  const compounds = Array.isArray(herb.compounds) ? herb.compounds.slice(0, 6) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
      whileHover={{ translateY: -4 }}
      className="h-full"
    >
      <Card className="flex h-full flex-col gap-4 p-4 md:p-5 transition duration-200 hover:shadow-glow">
        <header className="space-y-1">
          <h3 className="text-xl font-semibold text-brand-lime/90">
            {herb.common || herb.scientific || herb.name}
          </h3>
          {hasVal(herb.scientific) && <p className="italic text-sub">{herb.scientific}</p>}
          {hasVal(intensity) && (
            <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${intensityClass}`}>
              INTENSITY: {titleCase(intensity)}
            </span>
          )}
        </header>

        <section className="space-y-3 text-sm leading-relaxed text-sub">
          {hasVal(herb.description) && (
            <p>
              <span className="font-semibold text-text">Description:</span>{' '}
              <span className={expanded ? '' : 'clamp-3'}>{cleanLine(herb.description)}</span>
            </p>
          )}
          {hasVal(herb.effects) && (
            <p>
              <span className="font-semibold text-text">Effects:</span>{' '}
              <span className={expanded ? '' : 'clamp-3'}>{cleanLine(herb.effects)}</span>
            </p>
          )}
          {hasVal(herb.legalstatus) && (
            <p className="clamp-2">
              <span className="font-semibold text-text">Legal:</span>{' '}
              <span>{cleanLine(herb.legalstatus)}</span>
            </p>
          )}
          {compounds.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {compounds.map((compound: string, id: number) => (
                <Badge key={id}>{compound}</Badge>
              ))}
            </div>
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
