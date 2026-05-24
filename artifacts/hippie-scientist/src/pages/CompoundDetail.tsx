import { PageLayout } from "@/components/layout/PageLayout";
import { useCompound } from "@/hooks/use-data";
import { useParams, Link } from "wouter";
import { BadgeTier } from "@/components/ui/badge-tier";
import { ShieldAlert, Activity, GitBranch, FlaskConical, AlertTriangle, Pill, ArrowLeft } from "lucide-react";

export default function CompoundDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: compound, isLoading, error } = useCompound(slug || "");

  if (isLoading) return <PageLayout><div className="animate-pulse h-96 bg-muted rounded-xl border border-border max-w-5xl mx-auto mt-8" /></PageLayout>;
  if (error || !compound) return <PageLayout><div className="text-center py-24 text-destructive border border-border border-dashed rounded-xl bg-card max-w-5xl mx-auto mt-8">Failed to load monograph.</div></PageLayout>;

  const cleanName = compound.name.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto space-y-12 py-8">
        <Link href="/compounds" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Compounds
        </Link>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <header className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="text-4xl md:text-5xl font-outfit font-bold tracking-tight text-foreground">{cleanName}</h1>
              <BadgeTier tier={compound.evidence_tier || compound.evidence_grade} />
            </div>
            <p className="text-xl text-muted-foreground leading-relaxed">{compound.summary || compound.description}</p>

            {compound.primary_effects && compound.primary_effects.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {compound.primary_effects.map((effect, i) => (
                  <span key={i} className="inline-flex items-center px-3 py-1 rounded bg-muted text-muted-foreground font-mono text-xs uppercase tracking-wider">
                    {effect.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim()}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="lg:col-span-1 bg-card border border-border shadow-sm rounded-xl p-6 space-y-6">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest font-mono border-b border-border pb-3">Quick Facts</h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Evidence Level</span>
                <div className="flex items-center gap-2">
                  <BadgeTier tier={compound.evidence_tier || compound.evidence_grade} />
                  <span className="text-sm font-medium text-foreground">
                    {compound.evidence_tier === 'A' || compound.evidence_grade === 'A' ? 'Robust Data' :
                     compound.evidence_tier === 'B' || compound.evidence_grade === 'B' ? 'Moderate Data' : 'Limited Data'}
                  </span>
                </div>
              </div>
              {(compound.dosage || compound.typical_dosage) && (
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Typical Dosage</span>
                  <p className="text-sm text-foreground font-mono font-medium">{compound.typical_dosage || compound.dosage}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {(compound.contraindications?.length || compound.interactions?.length) ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 text-amber-800">
              <ShieldAlert className="w-6 h-6" />
              <h2 className="text-xl font-bold font-outfit">Safety Context & Contraindications</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {compound.contraindications && compound.contraindications.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wider font-mono">Contraindications</h3>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-amber-900/80 leading-relaxed">
                    {compound.contraindications.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              )}

              {compound.interactions && compound.interactions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wider font-mono">Known Interactions</h3>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-amber-900/80 leading-relaxed">
                    {compound.interactions.map((interaction, i) => <li key={i}>{interaction}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : null}

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-10">
            {compound.mechanisms && compound.mechanisms.length > 0 && (
              <section className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  <h2 className="text-sm font-bold font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <GitBranch className="w-4 h-4" /> Mechanisms of Action
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {compound.mechanisms.map((mech, i) => (
                    <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm font-medium border border-slate-200">
                      {mech}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {compound.effects && compound.effects.length > 0 && (
              <section className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  <h2 className="text-sm font-bold font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Observed Effects
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {compound.effects.map((effect, i) => (
                    <span key={i} className="inline-flex items-center px-3 py-1 rounded bg-card border border-border text-sm text-foreground">
                      {effect.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim()}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-10">
            {compound.forms && compound.forms.length > 0 && (
              <section className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  <h2 className="text-sm font-bold font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <FlaskConical className="w-4 h-4" /> Common Forms
                  </h2>
                </div>
                <ul className="list-disc pl-5 space-y-2 text-sm text-foreground leading-relaxed">
                  {compound.forms.map((form, i) => <li key={i}>{form}</li>)}
                </ul>
              </section>
            )}

            {compound.side_effects && compound.side_effects.length > 0 && (
              <section className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  <h2 className="text-sm font-bold font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Side Effects
                  </h2>
                </div>
                <ul className="list-disc pl-5 space-y-2 text-sm text-foreground leading-relaxed">
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
