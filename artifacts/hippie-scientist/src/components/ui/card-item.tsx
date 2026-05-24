import { Link } from "wouter";
import { BadgeTier } from "./badge-tier";
import { Badge } from "./badge";
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
      <Link href={`/${type}/${item.slug}`} className="flex flex-col h-full border border-border bg-card rounded-xl p-5 hover:bg-muted/50 hover:border-primary/30 transition-colors group">
        <div className="flex justify-between items-start mb-3 gap-4">
          <h3 className="font-outfit font-semibold text-lg text-foreground group-hover:text-primary transition-colors">{cleanName}</h3>
          <BadgeTier tier={item.evidence_tier || item.evidence_grade} />
        </div>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.summary}</p>
        <div className="flex flex-wrap gap-2 mt-auto pt-2">
          {item.primary_effects?.slice(0, 3).map((effect, i) => (
            <Badge key={i} variant="secondary" className="font-mono text-[10px] uppercase tracking-wider">
              {stripEmoji(effect)}
            </Badge>
          ))}
        </div>
      </Link>
    </motion.div>
  );
}
