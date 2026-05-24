import { PageLayout } from "@/components/layout/PageLayout";
import { useHerb } from "@/hooks/use-data";
import { useParams } from "wouter";
import { BadgeTier } from "@/components/ui/badge-tier";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Activity, GitBranch, FlaskConical, AlertTriangle, Pill } from "lucide-react";

export default function HerbDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: herb, isLoading, error } = useHerb(slug || "");

  if (isLoading) return <PageLayout><div className="animate-pulse h-96 bg-muted rounded-2xl" /></PageLayout>;
  if (error || !herb) return <PageLayout><div className="text-center py-24 text-destructive">Failed to load monograph.</div></PageLayout>;

  const cleanName = herb.name.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="space-y-6">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-4xl md:text-5xl font-outfit font-bold tracking-tight text-foreground">{cleanName}</h1>
            <BadgeTier tier={herb.evidence_tier || herb.evidence_grade} />
          </div>
          <p className="text-xl text-muted-foreground leading-relaxed">{herb.summary || herb.description}</p>

          {herb.primary_effects && herb.primary_effects.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {herb.primary_effects.map((effect, i) => (
                <Badge key={i} variant="secondary" className="font-mono text-xs">
                  {effect.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim()}
                </Badge>
              ))}
            </div>
          )}
        </header>

        {(herb.contraindications?.length || herb.interactions?.length) ? (
          <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="w-6 h-6" />
              <h2 className="text-xl font-bold">Safety Context & Contraindications</h2>
            </div>

            {herb.contraindications && herb.contraindications.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Contraindications</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-destructive/90">
                  {herb.contraindications.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}

            {herb.interactions && herb.interactions.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Known Interactions</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-destructive/90">
                  {herb.interactions.map((interaction, i) => <li key={i}>{interaction}</li>)}
                </ul>
              </div>
            )}
          </div>
        ) : null}

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-8">
            {herb.mechanisms && herb.mechanisms.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <GitBranch className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-outfit font-semibold text-foreground">Mechanisms of Action</h2>
                </div>
                <ul className="space-y-3">
                  {herb.mechanisms.map((mech, i) => (
                    <li key={i} className="text-sm text-muted-foreground leading-relaxed pl-4 border-l-2 border-border">{mech}</li>
                  ))}
                </ul>
              </section>
            )}

            {herb.effects && herb.effects.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-outfit font-semibold text-foreground">Observed Effects</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {herb.effects.map((effect, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {effect.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim()}
                    </Badge>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-8">
            {(herb.dosage || herb.typical_dosage) && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <Pill className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-xl font-outfit font-semibold text-foreground">Dosage Guidelines</h2>
                </div>
                <div className="bg-muted rounded-xl p-4 border border-border">
                  <p className="text-sm text-foreground font-mono">{herb.typical_dosage || herb.dosage}</p>
                </div>
              </section>
            )}

            {herb.forms && herb.forms.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <FlaskConical className="w-5 h-5 text-purple-600" />
                  <h2 className="text-xl font-outfit font-semibold text-foreground">Common Forms</h2>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {herb.forms.map((form, i) => <li key={i}>{form}</li>)}
                </ul>
              </section>
            )}

            {herb.side_effects && herb.side_effects.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <h2 className="text-xl font-outfit font-semibold text-foreground">Side Effects</h2>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {herb.side_effects.map((se, i) => <li key={i}>{se}</li>)}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
