import { PageLayout } from "@/components/layout/PageLayout";
import { BadgeTier } from "@/components/ui/badge-tier";

export default function Learn() {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto space-y-16 py-8">
        <header className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-outfit font-bold tracking-tight text-foreground leading-[1.1]">How to Read the Evidence</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            This reference uses a strict hierarchy to evaluate claims. A mechanism existing in a petri dish does not mean it works in a human body.
          </p>
        </header>

        <section className="space-y-8">
          <h2 className="text-sm font-bold font-mono text-muted-foreground uppercase tracking-widest border-b border-border pb-3">Evidence Tiers</h2>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-8 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500" />
              <div className="flex items-center gap-4 mb-4">
                <BadgeTier tier="A" />
                <h3 className="text-xl font-bold text-foreground font-outfit">Robust Human Clinical Data</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Multiple randomized, double-blind, placebo-controlled human trials demonstrating consistent effects. Meta-analyses exist confirming the mechanism and outcome in human populations.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500" />
              <div className="flex items-center gap-4 mb-4">
                <BadgeTier tier="B" />
                <h3 className="text-xl font-bold text-foreground font-outfit">Moderate or Emerging Evidence</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Some human trials exist, but may be small, have methodological flaws, or show conflicting results. Strong animal data combined with extensive historical human use may also fall here.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-500" />
              <div className="flex items-center gap-4 mb-4">
                <BadgeTier tier="C" />
                <h3 className="text-xl font-bold text-foreground font-outfit">Limited or Mechanistic Evidence Only</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Evidence is primarily in-vitro (petri dish) or in-vivo animal models (mice/rats). No high-quality human trials confirm the effect. Treat claims with extreme skepticism until human trials are conducted.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <h2 className="text-sm font-bold font-mono text-muted-foreground uppercase tracking-widest border-b border-border pb-3">Harm Reduction Basics</h2>
          <div className="prose prose-p:text-foreground prose-li:text-foreground max-w-none">
            <p className="text-lg leading-relaxed mb-6">
              "Natural" does not mean safe. Many of the most potent toxins and pharmaceuticals are derived from plants. When using this reference:
            </p>
            <ul className="list-disc pl-5 space-y-4">
              <li className="leading-relaxed"><strong className="font-semibold">Always check interactions:</strong> If you are taking prescription medication, especially SSRIs, MAOIs, blood thinners, or metabolic inhibitors (CYP450 pathway), assume there is an interaction until proven otherwise.</li>
              <li className="leading-relaxed"><strong className="font-semibold">Start low:</strong> Recommended dosages are averages. Individual neurochemistry and metabolism vary wildly.</li>
              <li className="leading-relaxed"><strong className="font-semibold">Cycle off:</strong> Very few compounds are meant to be taken daily indefinitely. Receptor downregulation and tolerance are real physiological responses.</li>
            </ul>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
