import { PageLayout } from "@/components/layout/PageLayout";
import { BadgeTier } from "@/components/ui/badge-tier";

export default function Learn() {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto space-y-12">
        <header>
          <h1 className="text-4xl font-outfit font-bold tracking-tight text-foreground mb-4">How to Read the Evidence</h1>
          <p className="text-muted-foreground text-lg">
            This reference uses a strict hierarchy to evaluate claims. A mechanism existing in a petri dish does not mean it works in a human body.
          </p>
        </header>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-outfit text-foreground border-b border-border pb-2">Evidence Tiers</h2>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-4 mb-3">
                <BadgeTier tier="A" />
                <h3 className="text-lg font-semibold text-foreground">Robust Human Clinical Data</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Multiple randomized, double-blind, placebo-controlled human trials demonstrating consistent effects. Meta-analyses exist confirming the mechanism and outcome in human populations.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-4 mb-3">
                <BadgeTier tier="B" />
                <h3 className="text-lg font-semibold text-foreground">Moderate or Emerging Evidence</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Some human trials exist, but may be small, have methodological flaws, or show conflicting results. Strong animal data combined with extensive historical human use may also fall here.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-4 mb-3">
                <BadgeTier tier="C" />
                <h3 className="text-lg font-semibold text-foreground">Limited or Mechanistic Evidence Only</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Evidence is primarily in-vitro (petri dish) or in-vivo animal models (mice/rats). No high-quality human trials confirm the effect. Treat claims with extreme skepticism until human trials are conducted.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-outfit text-foreground border-b border-border pb-2">Harm Reduction Basics</h2>
          <div className="prose prose-p:text-muted-foreground prose-li:text-muted-foreground max-w-none text-foreground">
            <p className="text-muted-foreground leading-relaxed mb-4">
              "Natural" does not mean safe. Many of the most potent toxins and pharmaceuticals are derived from plants. When using this reference:
            </p>
            <ul className="list-disc pl-5 space-y-3 text-muted-foreground">
              <li><strong className="text-foreground">Always check interactions:</strong> If you are taking prescription medication, especially SSRIs, MAOIs, blood thinners, or metabolic inhibitors (CYP450 pathway), assume there is an interaction until proven otherwise.</li>
              <li><strong className="text-foreground">Start low:</strong> Recommended dosages are averages. Individual neurochemistry and metabolism vary wildly.</li>
              <li><strong className="text-foreground">Cycle off:</strong> Very few compounds are meant to be taken daily indefinitely. Receptor downregulation and tolerance are real physiological responses.</li>
            </ul>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
