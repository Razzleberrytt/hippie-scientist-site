import { PageLayout } from "@/components/layout/PageLayout";
import { useCompound } from "@/hooks/use-data";
import { useParams } from "wouter";
import { BadgeTier } from "@/components/ui/badge-tier";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Activity, GitBranch, FlaskConical, AlertTriangle, Pill } from "lucide-react";

// Same layout as HerbDetail for now
export default function CompoundDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: compound, isLoading, error } = useCompound(slug || "");

  if (isLoading) return <PageLayout><div className="animate-pulse h-96 bg-white/5 rounded-2xl" /></PageLayout>;
  if (error || !compound) return <PageLayout><div className="text-center py-24 text-destructive">Failed to load monograph.</div></PageLayout>;

  const cleanName = compound.name.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="space-y-6">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-4xl md:text-5xl font-outfit font-bold tracking-tight text-white">{cleanName}</h1>
            <BadgeTier tier={compound.evidence_tier || compound.evidence_grade} />
          </div>
          <p className="text-xl text-muted-foreground leading-relaxed">{compound.summary || compound.description}</p>
          
          {compound.primary_effects && compound.primary_effects.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {compound.primary_effects.map((effect, i) => (
                <Badge key={i} variant="secondary" className="bg-white/10 font-mono text-xs hover:bg-white/20">
                  {effect.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim()}
                </Badge>
              ))}
            </div>
          )}
        </header>

        {/* Safety Block */}
        {(compound.contraindications?.length || compound.interactions?.length) ? (
          <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="w-6 h-6" />
              <h2 className="text-xl font-bold">Safety Context & Contraindications</h2>
            </div>
            
            {compound.contraindications && compound.contraindications.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-white/90">Contraindications</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-destructive/90">
                  {compound.contraindications.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}
            
            {compound.interactions && compound.interactions.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-white/90">Known Interactions</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-destructive/90">
                  {compound.interactions.map((interaction, i) => <li key={i}>{interaction}</li>)}
                </ul>
              </div>
            )}
          </div>
        ) : null}

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-8">
            {compound.mechanisms && compound.mechanisms.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <GitBranch className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-outfit font-semibold text-white">Mechanisms of Action</h2>
                </div>
                <ul className="space-y-3">
                  {compound.mechanisms.map((mech, i) => (
                    <li key={i} className="text-sm text-muted-foreground leading-relaxed pl-4 border-l-2 border-white/5">{mech}</li>
                  ))}
                </ul>
              </section>
            )}

            {compound.effects && compound.effects.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  <h2 className="text-xl font-outfit font-semibold text-white">Observed Effects</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {compound.effects.map((effect, i) => (
                    <Badge key={i} variant="outline" className="text-xs border-white/10 text-gray-300">
                      {effect.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim()}
                    </Badge>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-8">
            {(compound.dosage || compound.typical_dosage) && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <Pill className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-xl font-outfit font-semibold text-white">Dosage Guidelines</h2>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-gray-300 font-mono">{compound.typical_dosage || compound.dosage}</p>
                </div>
              </section>
            )}

            {compound.forms && compound.forms.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <FlaskConical className="w-5 h-5 text-purple-400" />
                  <h2 className="text-xl font-outfit font-semibold text-white">Common Forms</h2>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {compound.forms.map((form, i) => <li key={i}>{form}</li>)}
                </ul>
              </section>
            )}

            {compound.side_effects && compound.side_effects.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <h2 className="text-xl font-outfit font-semibold text-white">Side Effects</h2>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {compound.side_effects.map((se, i) => <li key={i}>{se}</li>)}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
