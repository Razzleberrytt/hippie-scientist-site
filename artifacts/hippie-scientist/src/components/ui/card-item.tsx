import { Link } from "wouter";
import { BadgeTier } from "./badge-tier";
import { motion } from "framer-motion";
import { IndexItem } from "@/lib/types";

function stripEmoji(str: string): string {
  return str.replace(/\p{Emoji}/gu, '').trim();
}

export function CardItem({ item, type, index = 0 }: { item: IndexItem; type: "herbs" | "compounds"; index?: number }) {
  const cleanName = stripEmoji(item.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
      className="h-full"
    >
      <Link href={`/${type}/${item.slug}`} className="flex flex-col h-full bg-card border border-border shadow-[0_1px_3px_rgba(0,0,0,0.06)] rounded-xl p-5 hover:-translate-y-1 hover:shadow-md hover:border-primary/40 transition-all duration-200 group">
        <div className="flex justify-between items-start mb-3 gap-4">
          <h3 className="font-outfit font-semibold text-[16px] text-foreground group-hover:text-primary transition-colors leading-tight">{cleanName}</h3>
          <BadgeTier tier={item.evidence_tier || item.evidence_grade} />
        </div>
        <p className="text-[13px] text-muted-foreground mb-5 line-clamp-2 leading-relaxed">{item.summary}</p>
        <div className="flex flex-wrap gap-1.5 mt-auto pt-2 border-t border-border/50">
          {item.primary_effects?.slice(0, 3).map((effect, i) => (
            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono text-[10px] uppercase tracking-wider whitespace-nowrap">
              {stripEmoji(effect)}
            </span>
          ))}
        </div>
      </Link>
    </motion.div>
  );
}
