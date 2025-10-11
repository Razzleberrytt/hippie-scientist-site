import { memo, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Card from './ui/Card';
import { cleanLine, hasVal, titleCase } from '../lib/pretty';
import { chipClassFor } from '../lib/tags';
import { hashLink } from '../lib/routes';
import { slugify } from '../lib/slug';

interface HerbCardProps {
  herb: Record<string, any>;
  index?: number;
  compact?: boolean;
}

function HerbCard({ herb, index = 0, compact = false }: HerbCardProps) {
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
  const tagLimit = compact ? 3 : 6;
  const tags = Array.isArray(herb.tags) ? herb.tags.slice(0, tagLimit) : [];
  const showDescription = !compact && hasVal(herb.description);
  const showEffects = !compact && hasVal(herb.effects);
  const showLegal = !compact && hasVal(herb.legalstatus);
  const showCompounds = !compact && compounds.length > 0;
  const showShowMore = !compact && (hasVal(herb.effects) || hasVal(herb.description));

  const detailHref = useMemo(() => {
    const slug = hasVal(herb.slug)
      ? String(herb.slug)
      : slugify(String(herb.common || herb.scientific || ''));
    if (!slug) return hashLink('/herb');
    return hashLink(`/herb/${encodeURIComponent(slug)}`);
  }, [herb.common, herb.scientific, herb.slug]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 250, damping: 15, delay: index * 0.02 }}
      whileHover={{ scale: 1.015, y: -2 }}
      whileTap={{ scale: 0.985 }}
      className="h-full"
    >
      <Card
        className={`flex h-full flex-col ${compact ? 'gap-3 mini-card' : 'gap-4'} card-pad transition-shadow duration-200 hover:shadow-glow`}
      >
        <header className="stack">
          {compact ? (
            <h3 className="text-lime-300 font-semibold">{herb.common || herb.scientific || herb.name}</h3>
          ) : (
            <h2 className="h2 text-lime-300">{herb.common || herb.scientific || herb.name}</h2>
          )}
          {hasVal(herb.scientific) && (
            <p className="italic small text-white/65">{herb.scientific}</p>
          )}
          {hasVal(intensity) && (
            <span className={`${intensityClass || 'chip'} ${compact ? 'int' : ''}`}>
              INTENSITY: {titleCase(intensity)}
            </span>
          )}
        </header>

        <section className="stack text-white/80">
          {showDescription && (
            <p className={`small text-white/85 ${expanded ? '' : 'line-clamp-3'}`}>
              {cleanLine(herb.description)}
            </p>
          )}
          {showEffects && (
            <p className={`small text-white/70 ${expanded ? '' : 'line-clamp-3'}`}>
              <span className="text-white/85">Effects:</span> {cleanLine(herb.effects)}
            </p>
          )}
          {showLegal && (
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
          {showCompounds && (
            <p className="small text-cyan-200">
              Active Compounds: {compounds.join(', ')}
            </p>
          )}
        </section>

        <footer className={`mt-auto flex items-center justify-between text-sm ${compact ? 'pt-1' : ''}`}>
          {showShowMore && (
            <button
              type="button"
              className="text-sub underline decoration-dotted underline-offset-4 transition hover:text-text"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
          <a
            href={detailHref}
            className="text-sub underline underline-offset-4 transition hover:text-text"
          >
            View details
          </a>
        </footer>
      </Card>
    </motion.div>
  );
}

export default memo(HerbCard);
