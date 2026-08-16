import type { LocalizedPageData, LocalizedUiCopy } from './localization'
import { buildLocalizedPageMetadata } from './localization'
import { DEFAULT_OG_LOCALE, GERMAN_OG_LOCALE } from './international-seo'

export const GERMAN_UI: LocalizedUiCopy = {
  translationNotice:
    'Dies ist eine redaktionell übersetzte deutsche Version. Wissenschaftliche Profile ohne vollständige deutsche Fassung werden klar als englischsprachige Inhalte gekennzeichnet.',
  nextStepLabel: 'Nächster Schritt',
  nextStepBody:
    'Vergleichen Sie nach demselben Prinzip weiter: Evidenz zuerst, Sicherheit sichtbar und Grenzen klar benannt.',
  educationDisclaimer:
    'Bildungsinhalt. Er ersetzt keine individuelle Beurteilung durch medizinisches Fachpersonal, insbesondere bei Medikamenteneinnahme, Schwangerschaft oder bestehenden Erkrankungen.',
}

export const GERMAN_PAGES = {
  home: {
    path: '/de/',
    eyebrow: 'The Hippie Scientist auf Deutsch',
    title: 'Nahrungsergänzungsmittel recherchieren, ohne zu raten',
    description:
      'Vergleichen Sie Kräuter und Supplemente nach Humanstudien, Mechanismen, Dosierungen, Sicherheit und Wechselwirkungen auf Deutsch.',
    intro:
      'Vergleichen Sie Kräuter und Supplemente anhand von Humanstudien, Mechanismen, Dosierungen und Sicherheit. Beginnen Sie mit Ihrem Ziel – nicht mit Marketingversprechen.',
    sections: [
      {
        title: 'Mit einem Ziel beginnen',
        body:
          'Jeder Pfad strukturiert die Entscheidung, bevor einzelne Wirkstoffe betrachtet werden. Wählen Sie das Ergebnis, das Sie untersuchen möchten, und vergleichen Sie Optionen mit demselben Bewertungsrahmen.',
        links: [
          { href: '/de/ziele/schlaf/', label: 'Schlaf', note: 'Einschlafen, Schlafqualität und Effekte am nächsten Tag' },
          { href: '/de/ziele/stress/', label: 'Stress', note: 'Stressmuster, Evidenz und Verträglichkeit' },
          { href: '/de/ziele/angst/', label: 'Angst', note: 'Evidenz, Sedierung, Sicherheit und Grenzen' },
          { href: '/de/ziele/fokus/', label: 'Fokus', note: 'Aufmerksamkeit, Stimulation, Schlaf und Abwägungen' },
        ],
      },
      {
        title: 'Bibliothek erkunden',
        body:
          'Wir trennen klinische Evidenz von Mechanismen und halten Sicherheitswarnungen sichtbar. Detaillierte wissenschaftliche Profile werden schrittweise übersetzt; englische Seiten bleiben klar gekennzeichnet.',
        links: [
          { href: '/de/kraeuter/', label: 'Kräuter', note: 'Evidenz, Mechanismen und Sicherheit' },
          { href: '/de/wirkstoffe/', label: 'Wirkstoffe und Supplemente', note: 'Evidenz, Dosierung und Wechselwirkungen' },
        ],
      },
      {
        title: 'Wissenschaftliche Bedeutung erhalten',
        body:
          'Eine Übersetzung muss Gewissheit, Einschränkungen, Wechselwirkungen und den Kontext der Originalevidenz erhalten. Ein vielversprechender Hinweis wird durch Übersetzung nicht zu einem bewiesenen Nutzen.',
        links: [
          { href: '/de/methodik/', label: 'Wie wir Evidenz bewerten' },
          { href: '/de/sicherheit/', label: 'Sicherheit und Wechselwirkungen' },
        ],
      },
    ],
    primaryCta: { href: '/de/ziele/', label: 'Ein Ziel auswählen' },
    secondaryCta: { href: '/', label: 'English version' },
  },
  herbs: {
    path: '/de/kraeuter/',
    eyebrow: 'Forschungsbibliothek',
    title: 'Kräuter: Evidenz, Mechanismen und Sicherheit',
    description:
      'Erkunden Sie Kräuter anhand von Humanstudien, Mechanismen, Dosierungen, Sicherheit und Wechselwirkungen auf Deutsch.',
    intro:
      'Beginnen Sie mit einem bekannten Kraut oder mit Ihrem Ziel. Humanstudien haben Vorrang, und Sicherheitsaspekte bleiben vor praktischen Schlussfolgerungen sichtbar.',
    sections: [
      {
        title: 'So lesen Sie die Bibliothek',
        body:
          'Ein Kraut wird nicht nach Popularität bewertet. Wir trennen Beobachtungen beim Menschen von plausiblen Hypothesen aus Mechanismen, Tradition oder präklinischer Forschung.',
        bullets: [
          'Achten Sie zuerst auf Qualität und Art der Humanstudien.',
          'Prüfen Sie Wechselwirkungen, Gegenanzeigen und Dosierungskontext.',
          'Behandeln Sie Mechanismen als biologischen Kontext, nicht als klinischen Beweis.',
          'Berücksichtigen Sie Unsicherheit bei kleinen, gemischten oder indirekten Studien.',
        ],
      },
      {
        title: 'Profile zum Weiterforschen',
        body: 'Die vollständigen wissenschaftlichen Profile öffnen sich während der Feld-für-Feld-Übersetzung noch auf Englisch.',
        links: [
          { href: '/herbs/ashwagandha/', label: 'Ashwagandha', note: 'Detailliertes Profil auf Englisch' },
          { href: '/herbs/rhodiola/', label: 'Rhodiola', note: 'Detailliertes Profil auf Englisch' },
          { href: '/herbs/valerian/', label: 'Baldrian', note: 'Detailliertes Profil auf Englisch' },
          { href: '/herbs/bacopa/', label: 'Bacopa', note: 'Detailliertes Profil auf Englisch' },
        ],
      },
    ],
    primaryCta: { href: '/de/ziele/', label: 'Nach Ziel suchen' },
    secondaryCta: { href: '/herbs/', label: 'Vollständige Bibliothek auf Englisch öffnen' },
  },
  compounds: {
    path: '/de/wirkstoffe/',
    eyebrow: 'Forschungsbibliothek',
    title: 'Wirkstoffe und Supplemente: Evidenz vergleichen',
    description:
      'Vergleichen Sie Wirkstoffe und Supplemente nach Evidenz, Mechanismen, Dosierungen, Sicherheit und Wechselwirkungen auf Deutsch.',
    intro:
      'Die Bibliothek ordnet, was wir wissen, was noch unklar ist und welche Risiken vor einem Vergleich berücksichtigt werden sollten.',
    sections: [
      {
        title: 'Was wir priorisieren',
        body:
          'Klinische Humanstudien wiegen stärker als isolierte Mechanismen oder Marketingbehauptungen. Ein vielversprechendes Signal wird nicht als bewiesener Nutzen dargestellt.',
        bullets: [
          'Art und Qualität der Humanstudien.',
          'Konsistenz zwischen Studien und Reviews.',
          'Untersuchte Dosierungen und Anwendungskontext.',
          'Relevante Wechselwirkungen, Gegenanzeigen und Nebenwirkungen.',
        ],
      },
      {
        title: 'Gute Ausgangspunkte',
        body: 'Die vollständigen Profile unten bleiben in dieser Übersetzungsphase auf Englisch.',
        links: [
          { href: '/compounds/magnesium/', label: 'Magnesium', note: 'Detailliertes Profil auf Englisch' },
          { href: '/compounds/l-theanine/', label: 'L-Theanin', note: 'Detailliertes Profil auf Englisch' },
          { href: '/compounds/melatonin/', label: 'Melatonin', note: 'Detailliertes Profil auf Englisch' },
          { href: '/compounds/omega-3/', label: 'Omega-3', note: 'Detailliertes Profil auf Englisch' },
        ],
      },
    ],
    primaryCta: { href: '/de/ziele/', label: 'Nach Ziel vergleichen' },
    secondaryCta: { href: '/compounds/', label: 'Vollständige Bibliothek auf Englisch öffnen' },
  },
  goals: {
    path: '/de/ziele/',
    eyebrow: 'Beginnen Sie mit dem, was Sie verbessern möchten',
    title: 'Supplemente nach Ziel erkunden',
    description:
      'Vergleichen Sie Optionen für Schlaf, Stress, Angst und Fokus anhand von Evidenz, Sicherheit, Dosierung und praktischem Kontext.',
    intro:
      'Beginnen Sie nicht mit einem Trendwirkstoff, sondern mit dem Ergebnis, das für Sie wichtig ist. Jeder Leitfaden hilft, Optionen einzugrenzen, bevor einzelne Profile geöffnet werden.',
    sections: [
      {
        title: 'Hauptziele',
        body: 'Wählen Sie einen Pfad, um die entscheidenden Fragen vor dem Supplementvergleich zu sehen.',
        links: [
          { href: '/de/ziele/schlaf/', label: 'Schlaf', note: 'Qualität, Timing und Effekte am nächsten Tag' },
          { href: '/de/ziele/stress/', label: 'Stress', note: 'Stressmuster, Anwendungsdauer und Verträglichkeit' },
          { href: '/de/ziele/angst/', label: 'Angst', note: 'Evidenz, Sedierung, Wechselwirkungen und Grenzen' },
          { href: '/de/ziele/fokus/', label: 'Fokus', note: 'Aufmerksamkeit, Stimulation, Schlaf und Abwägungen' },
        ],
      },
      {
        title: 'So vergleichen Sie',
        body:
          'Eine Option kann in einem Kontext sinnvoll und in einem anderen ungeeignet sein. Vergleichen Sie Evidenz, Wirkungseintritt, Dauer, Sicherheit, Medikamentenverträglichkeit und die Ähnlichkeit zwischen Forschung und Ihrer Situation.',
      },
    ],
    primaryCta: { href: '/de/sicherheit/', label: 'Zuerst Sicherheit prüfen' },
    secondaryCta: { href: '/goals/', label: 'Alle Ziele auf Englisch ansehen' },
  },
  sleep: {
    path: '/de/ziele/schlaf/',
    eyebrow: 'Ziel: Schlaf',
    title: 'Supplemente für Schlaf: Optionen sinnvoll vergleichen',
    description:
      'Vergleichen Sie Schlafsupplemente nach Humanstudien, Timing, Dauer, Effekten am Folgetag, Dosierung und Wechselwirkungen.',
    intro:
      '„Besser schlafen“ kann schnelleres Einschlafen, weniger Erwachen, bessere subjektive Schlafqualität oder weniger Müdigkeit am nächsten Tag bedeuten. Der Vergleich hängt vom tatsächlichen Problem ab.',
    sections: [
      {
        title: 'Fragen, die die Entscheidung verändern',
        body: 'Klären Sie vor der Wirkstoffwahl, welchen Teil des Schlafs Sie verbessern möchten.',
        bullets: [
          'Geht es hauptsächlich um Einschlafen oder Durchschlafen?',
          'Müssen Sedierung oder Trägheit am nächsten Tag vermieden werden?',
          'Nehmen Sie Medikamente oder andere sedierende Supplemente?',
          'Untersucht die Evidenz eine Situation, die Ihrer ähnlich ist?',
        ],
      },
      {
        title: 'Profile zum Weiterforschen',
        body: 'Die detaillierten wissenschaftlichen Profile sind in dieser Phase noch auf Englisch.',
        links: [
          { href: '/compounds/melatonin/', label: 'Melatonin', note: 'Detailliertes Profil auf Englisch' },
          { href: '/compounds/magnesium/', label: 'Magnesium', note: 'Detailliertes Profil auf Englisch' },
          { href: '/compounds/l-theanine/', label: 'L-Theanin', note: 'Detailliertes Profil auf Englisch' },
          { href: '/herbs/valerian/', label: 'Baldrian', note: 'Detailliertes Profil auf Englisch' },
        ],
      },
    ],
    primaryCta: { href: '/de/sicherheit/', label: 'Sicherheit prüfen' },
    secondaryCta: { href: '/goals/sleep/', label: 'Vollständigen Leitfaden auf Englisch öffnen' },
  },
  stress: {
    path: '/de/ziele/stress/',
    eyebrow: 'Ziel: Stress',
    title: 'Stress: Optionen vergleichen, ohne Mechanismus mit Evidenz zu verwechseln',
    description:
      'Vergleichen Sie Supplemente bei Stress nach Humanstudien, Symptommuster, Anwendungsdauer, Sicherheit, Dosierung und Wechselwirkungen.',
    intro:
      'Stress ist keine einheitliche Erfahrung. Der Nutzen einer Option hängt davon ab, ob kurzfristige Beruhigung, Unterstützung in einer belastenden Phase oder eine Strategie ohne Einbußen bei Energie und Fokus gesucht wird.',
    sections: [
      {
        title: 'Was getrennt betrachtet werden sollte',
        body:
          'Viele Produkte werben mit „Adaptogenen“ oder Cortisol. Solche Begriffe ersetzen keine klinischen Studien und beweisen nicht, dass eine Option für eine bestimmte Person geeignet ist.',
        bullets: [
          'Subjektive Effekte versus Biomarkerveränderungen.',
          'Akute Anwendung versus Anwendung über Wochen.',
          'Hilfreiche Beruhigung versus unerwünschte Sedierung.',
          'Möglicher Nutzen versus Wechselwirkungen und Gegenanzeigen.',
        ],
      },
      {
        title: 'Profile zum Weiterforschen',
        body: 'Die vollständigen Profile unten bleiben auf Englisch.',
        links: [
          { href: '/herbs/ashwagandha/', label: 'Ashwagandha', note: 'Detailliertes Profil auf Englisch' },
          { href: '/herbs/rhodiola/', label: 'Rhodiola', note: 'Detailliertes Profil auf Englisch' },
          { href: '/compounds/l-theanine/', label: 'L-Theanin', note: 'Detailliertes Profil auf Englisch' },
          { href: '/compounds/magnesium/', label: 'Magnesium', note: 'Detailliertes Profil auf Englisch' },
        ],
      },
    ],
    primaryCta: { href: '/de/sicherheit/', label: 'Sicherheit prüfen' },
    secondaryCta: { href: '/goals/stress/', label: 'Vollständigen Leitfaden auf Englisch öffnen' },
  },
  anxiety: {
    path: '/de/ziele/angst/',
    eyebrow: 'Ziel: Angst',
    title: 'Angst: Evidenz und Sicherheit vor schnellen Versprechen',
    description:
      'Vergleichen Sie bei Angst untersuchte Supplemente nach Evidenzqualität, Sedierung, Dosierung, Wechselwirkungen und Unsicherheit.',
    intro:
      'Bei Angst sollte ein kleines Signal nicht zu einem großen Versprechen werden. Entscheidend ist die Trennung klinischer Evidenz von theoretischen Mechanismen bei sichtbaren Vorsichtsmaßnahmen.',
    sections: [
      {
        title: 'Was zuerst wichtig ist',
        body: 'Studienqualität, untersuchte Population und Effektgröße sind ebenso wichtig wie der Name des Wirkstoffs.',
        bullets: [
          'Gibt es kontrollierte Humanstudien oder nur indirekte Evidenz?',
          'Sind die Ergebnisse zwischen Studien konsistent?',
          'Kann Sedierung auftreten oder sich mit anderen ZNS-dämpfenden Mitteln addieren?',
          'Gibt es relevante Wechselwirkungen mit Medikamenten?',
        ],
      },
      {
        title: 'Profile zum Weiterforschen',
        body: 'Die vollständigen Profile unten bleiben auf Englisch.',
        links: [
          { href: '/compounds/l-theanine/', label: 'L-Theanin', note: 'Detailliertes Profil auf Englisch' },
          { href: '/herbs/ashwagandha/', label: 'Ashwagandha', note: 'Detailliertes Profil auf Englisch' },
          { href: '/herbs/valerian/', label: 'Baldrian', note: 'Detailliertes Profil auf Englisch' },
          { href: '/compounds/magnesium/', label: 'Magnesium', note: 'Detailliertes Profil auf Englisch' },
        ],
      },
    ],
    primaryCta: { href: '/de/sicherheit/', label: 'Sicherheit prüfen' },
    secondaryCta: { href: '/goals/anxiety/', label: 'Vollständigen Leitfaden auf Englisch öffnen' },
  },
  focus: {
    path: '/de/ziele/fokus/',
    eyebrow: 'Ziel: Fokus',
    title: 'Fokus: Nutzen, Stimulation und Abwägungen vergleichen',
    description:
      'Vergleichen Sie Fokus-Supplemente nach Humanstudien, Stimulation, Dauer, Schlaf, Verträglichkeit, Dosierung und Wechselwirkungen.',
    intro:
      'Mehr Stimulation bedeutet nicht automatisch besseren Fokus. Ein sinnvoller Vergleich berücksichtigt Aufmerksamkeit, Müdigkeit, Schlaf, Verträglichkeit und die tatsächliche Evidenzqualität.',
    sections: [
      {
        title: 'Nützliche Fragen',
        body:
          'Klären Sie, ob es um Wachheit, mentale Ausdauer, weniger Ablenkung oder Unterstützung bei Müdigkeit geht. Das sind unterschiedliche Ziele, und Studien messen nicht immer dasselbe.',
        bullets: [
          'Misst die Evidenz objektive Aufmerksamkeit oder nur subjektives Empfinden?',
          'Ist der Wirkstoff stimulierend und kann er den Schlaf beeinträchtigen?',
          'Gibt es Toleranz, Rebound-Effekte oder relevante Wechselwirkungen?',
          'Entspricht die untersuchte Dosis der Produktform, die Sie vergleichen?',
        ],
      },
      {
        title: 'Profile zum Weiterforschen',
        body: 'Die vollständigen Profile unten bleiben auf Englisch.',
        links: [
          { href: '/compounds/caffeine/', label: 'Koffein', note: 'Detailliertes Profil auf Englisch' },
          { href: '/compounds/l-theanine/', label: 'L-Theanin', note: 'Detailliertes Profil auf Englisch' },
          { href: '/herbs/rhodiola/', label: 'Rhodiola', note: 'Detailliertes Profil auf Englisch' },
          { href: '/herbs/bacopa/', label: 'Bacopa', note: 'Detailliertes Profil auf Englisch' },
        ],
      },
    ],
    primaryCta: { href: '/de/sicherheit/', label: 'Sicherheit prüfen' },
    secondaryCta: { href: '/goals/focus/', label: 'Vollständigen Leitfaden auf Englisch öffnen' },
  },
  methodology: {
    path: '/de/methodik/',
    eyebrow: 'Unsere Arbeitsweise',
    title: 'Methodik: So bewerten wir Evidenz',
    description:
      'Erfahren Sie, wie The Hippie Scientist Humanstudien, Mechanismen, Sicherheit und Forschungsgrenzen bei Supplementen voneinander trennt.',
    intro:
      'Das Ziel ist nicht, für jeden Wirkstoff einen Empfehlungsgrund zu finden. Es geht darum, die Stärke der Evidenz, offene Fragen und relevante Risiken möglichst genau abzubilden.',
    sections: [
      { title: '1. Humanstudien zuerst', body: 'Studien an Menschen haben Vorrang bei der Beurteilung menschlicher Endpunkte. Zell- und Tierstudien helfen bei Hypothesen, werden aber nicht als bewiesene klinische Vorteile dargestellt.' },
      { title: '2. Mechanismus und Ergebnis trennen', body: 'Ein plausibler biologischer Signalweg kann erklären, warum etwas untersucht werden sollte. Er beweist für sich allein keine Wirksamkeit.' },
      { title: '3. Sicherheit vor dem Urteil', body: 'Wechselwirkungen, Gegenanzeigen, Nebenwirkungen und Dosierungskontext bleiben sichtbar, auch wenn Nutzenhinweise vielversprechend wirken.' },
      { title: '4. Unsicherheit klar benennen', body: 'Gemischte Ergebnisse, kleine Stichproben, übermäßige Abhängigkeit von einer Studie und indirekte Evidenz senken das Vertrauen. Diese Unsicherheit muss in der Sprache erhalten bleiben.' },
    ],
    primaryCta: { href: '/info/methodology/', label: 'Vollständige Methodik auf Englisch ansehen' },
    secondaryCta: { href: '/de/sicherheit/', label: 'Sicherheitsansatz ansehen' },
  },
  safety: {
    path: '/de/sicherheit/',
    eyebrow: 'Sicherheit zuerst',
    title: 'Supplement-Sicherheit und Wechselwirkungen',
    description:
      'Prüfen Sie Wechselwirkungen, Gegenanzeigen, Sedierung, additive Effekte und Dosierungskontext, bevor Kräuter oder Supplemente kombiniert werden.',
    intro:
      '„Natürlich“ bedeutet nicht neutral. Sicherheit hängt von Dosis, Medikamenten, Erkrankungen, Schwangerschaft, Kombinationen und weiteren individuellen Faktoren ab.',
    sections: [
      {
        title: 'Vor der Kombination mehrerer Produkte',
        body: 'Suchen Sie nach kumulativen Risiken, nicht nur nach isolierten Warnhinweisen einzelner Wirkstoffe.',
        bullets: [
          'Sedierende Wirkungen, die sich addieren können.',
          'Mögliche Veränderungen von Blutdruck, Blutzucker oder Gerinnung.',
          'Doppelte Wirkstoffe in mehreren Produkten.',
          'Wechselwirkungen mit Medikamenten und Erkrankungen.',
          'Dosierungen oder Wirkstoffformen, die von den untersuchten abweichen.',
        ],
      },
      {
        title: 'Aktuelle Werkzeuge',
        body: 'Die detaillierten interaktiven Werkzeuge bleiben derzeit auf Englisch, können aber helfen, Sicherheitsfragen zu identifizieren, die mit medizinischem Fachpersonal geklärt werden sollten.',
        links: [
          { href: '/safety-checker/', label: 'Wechselwirkungs-Checker', note: 'Werkzeug auf Englisch' },
          { href: '/info/supplement-safety-checklist/', label: 'Supplement-Sicherheitscheckliste', note: 'Leitfaden auf Englisch' },
        ],
      },
    ],
    primaryCta: { href: '/safety-checker/', label: 'Checker auf Englisch öffnen' },
    secondaryCta: { href: '/de/methodik/', label: 'Wie wir Evidenz bewerten' },
  },
} as const satisfies Record<string, LocalizedPageData>

export type GermanPageKey = keyof typeof GERMAN_PAGES

export const GERMAN_ROUTE_KEYS: Record<string, GermanPageKey> = {
  'kraeuter': 'herbs',
  'wirkstoffe': 'compounds',
  'ziele': 'goals',
  'ziele/schlaf': 'sleep',
  'ziele/stress': 'stress',
  'ziele/angst': 'anxiety',
  'ziele/fokus': 'focus',
  'methodik': 'methodology',
  'sicherheit': 'safety',
}

export function buildGermanPageMetadata(page: LocalizedPageData) {
  return buildLocalizedPageMetadata(page, {
    openGraphLocale: GERMAN_OG_LOCALE,
    alternateOpenGraphLocales: [DEFAULT_OG_LOCALE],
  })
}
