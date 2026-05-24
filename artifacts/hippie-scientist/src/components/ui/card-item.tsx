import { Link } from "wouter";
import { BadgeTier } from "./badge-tier";
import { Badge } from "./badge";
import { motion } from "framer-motion";
import { IndexItem } from "@/lib/types";

export function CardItem({ item, type, index = 0 }: { item: IndexItem; type: "herbs" | "compounds"; index?: number }) {
  const cleanName = item.name.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
      className="h-full"
    >
      <Link href={`/${type}/${item.slug}`} className="flex flex-col h-full border border-white/5 bg-black/40 backdrop-blur-md rounded-xl p-5 hover:bg-white/[0.03] hover:border-white/10 transition-colors group">
        <div className="flex justify-between items-start mb-3 gap-4">
          <h3 className="font-outfit font-semibold text-lg text-white group-hover:text-primary transition-colors">{cleanName}</h3>
          <BadgeTier tier={item.evidence_tier || item.evidence_grade} />
        </div>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.summary}</p>
        <div className="flex flex-wrap gap-2 mt-auto pt-2">
          {item.primary_effects?.slice(0, 3).map((effect, i) => (
            <Badge key={i} variant="secondary" className="bg-white/5 text-gray-300 hover:bg-white/10 border-none font-mono text-[10px] uppercase tracking-wider">
              {effect.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim()}
            </Badge>
          ))}
        </div>
      </Link>
    </motion.div>
  );
}
