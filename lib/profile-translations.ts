import type { LocalizedProfileTranslation, LocalizedProfileUiCopy } from './localized-profile'

export type ProfileTranslationLocale = 'es' | 'pt-BR' | 'fr' | 'de'

export const LOCALIZED_PROFILE_UI: Record<ProfileTranslationLocale, LocalizedProfileUiCopy> = {
  es: {
    evidenceEyebrow: 'Perfil de investigación traducido', evidenceHeading: 'Qué muestra la evidencia', evidenceIntro: 'Las afirmaciones siguientes corresponden una por una con afirmaciones aprobadas del perfil científico original. Las referencias se conservan sin traducir.', safetyHeading: 'Seguridad y precauciones', dosageHeading: 'Dosis estudiada y contexto', sourcesHeading: 'Fuentes', sourcesIntro: 'Se muestran las fuentes vinculadas a las afirmaciones aprobadas de este perfil.', evidenceLevelLabel: 'Nivel de evidencia', confidenceLabel: 'Confianza editorial', sourceLabel: 'Fuente', originalLabel: 'Perfil original en inglés', backToLibraryLabel: 'Volver a hierbas', educationalDisclaimer: 'Contenido educativo. No sustituye una evaluación médica individual ni instrucciones profesionales sobre medicamentos, embarazo, enfermedades o tratamiento.',
  },
  'pt-BR': {
    evidenceEyebrow: 'Perfil de pesquisa traduzido', evidenceHeading: 'O que as evidências mostram', evidenceIntro: 'As afirmações abaixo correspondem, uma a uma, às afirmações aprovadas do perfil científico original. As referências permanecem no idioma original.', safetyHeading: 'Segurança e precauções', dosageHeading: 'Dose estudada e contexto', sourcesHeading: 'Fontes', sourcesIntro: 'São mostradas as fontes ligadas às afirmações aprovadas deste perfil.', evidenceLevelLabel: 'Nível de evidência', confidenceLabel: 'Confiança editorial', sourceLabel: 'Fonte', originalLabel: 'Perfil original em inglês', backToLibraryLabel: 'Voltar para ervas', educationalDisclaimer: 'Conteúdo educacional. Não substitui avaliação médica individual nem orientação profissional sobre medicamentos, gravidez, doenças ou tratamento.',
  },
  fr: {
    evidenceEyebrow: 'Profil de recherche traduit', evidenceHeading: 'Ce que montrent les données', evidenceIntro: 'Les affirmations ci-dessous correspondent une à une aux affirmations approuvées du profil scientifique original. Les références sont conservées dans leur langue d’origine.', safetyHeading: 'Sécurité et précautions', dosageHeading: 'Dose étudiée et contexte', sourcesHeading: 'Sources', sourcesIntro: 'Les sources liées aux affirmations approuvées de ce profil sont conservées ici.', evidenceLevelLabel: 'Niveau de preuve', confidenceLabel: 'Confiance éditoriale', sourceLabel: 'Source', originalLabel: 'Profil original en anglais', backToLibraryLabel: 'Retour aux plantes', educationalDisclaimer: 'Contenu éducatif. Ne remplace pas une évaluation médicale individuelle ni un avis professionnel concernant les médicaments, la grossesse, les maladies ou les traitements.',
  },
  de: {
    evidenceEyebrow: 'Übersetztes Forschungsprofil',
    evidenceHeading: 'Was die Evidenz zeigt',
    evidenceIntro: 'Die folgenden Aussagen entsprechen jeweils einer freigegebenen Aussage des wissenschaftlichen Originalprofils. Die Quellenangaben bleiben im Original erhalten.',
    safetyHeading: 'Sicherheit und Vorsichtsmaßnahmen',
    dosageHeading: 'Untersuchte Dosierung und Kontext',
    sourcesHeading: 'Quellen',
    sourcesIntro: 'Hier werden die Quellen angezeigt, die mit den freigegebenen Aussagen dieses Profils verknüpft sind.',
    evidenceLevelLabel: 'Evidenzniveau',
    confidenceLabel: 'Redaktionelle Sicherheit',
    sourceLabel: 'Quelle',
    originalLabel: 'Englisches Originalprofil',
    backToLibraryLabel: 'Zurück zu den Kräutern',
    educationalDisclaimer: 'Bildungsinhalt. Er ersetzt keine individuelle medizinische Beurteilung oder professionelle Beratung zu Medikamenten, Schwangerschaft, Erkrankungen oder Behandlungen.',
  },
}

const SPANISH_HERBS: readonly LocalizedProfileTranslation[] = [{
  kind: 'herb', slug: 'ashwagandha', path: '/es/hierbas/ashwagandha/', title: 'Ashwagandha (Withania somnifera): evidencia y seguridad',
  summary: 'La ashwagandha es un extracto de raíz estudiado sobre todo para estrés persistente, síntomas de ansiedad relacionados con el estrés y sueño, no para alivio inmediato. Los metaanálisis sugieren posibles beneficios, pero los ensayos usan extractos y dosis diferentes y la certeza sigue siendo limitada; importan la estandarización del producto y las precauciones tiroideas, hepáticas, durante el embarazo y con sedantes.',
  dosage: 'Los ensayos no justifican una dosis universal para todos los productos. Las formulaciones y concentraciones varían; la dosis debe interpretarse según el extracto concreto estudiado y el contexto de seguridad.',
  safetyNotes: 'Los ensayos de corta duración suelen informar buena tolerabilidad, pero pueden aparecer molestias gastrointestinales o somnolencia. Existen además señales poco frecuentes de alteración tiroidea y lesión hepática, por lo que el contexto individual importa.',
  contraindications: ['Evitar durante el embarazo salvo indicación clínica específica.', 'Precaución adicional con enfermedad o medicación tiroidea, sedantes, antihipertensivos, antidiabéticos e inmunosupresores.', 'Suspender y buscar evaluación médica si aparecen ictericia, orina oscura, picor intenso o síntomas abdominales persistentes.'],
  claims: {
    clm_554b74f570d4: 'La base de evidencia clínica sigue limitada por ensayos pequeños, extractos y pautas de dosificación heterogéneos, medidas de resultado variables y preocupaciones por riesgo de sesgo; por ello, los resultados de una preparación no deben generalizarse a todos los productos de ashwagandha.',
    clm_62d80de74d95: 'Los ensayos aleatorizados de corta duración suelen mostrar buena tolerabilidad, pero pueden producirse síntomas gastrointestinales leves y somnolencia, y la evidencia disponible no establece la seguridad a largo plazo entre distintos productos o poblaciones.',
    clm_78af0b376bf1: 'Las revisiones sistemáticas de ensayos aleatorizados sugieren que algunos extractos de ashwagandha pueden reducir el estrés percibido y los síntomas de ansiedad en adultos, pero la evidencia debe interpretarse con cautela porque las formulaciones, dosis, poblaciones y medidas de resultado varían entre estudios.',
    clm_9318758bf577: 'Evita la ashwagandha durante el embarazo salvo indicación específica de un profesional cualificado, y extrema la precaución con enfermedad o medicación tiroidea, sedantes, antihipertensivos, antidiabéticos e inmunosupresores, porque los datos humanos de seguridad e interacciones son limitados y son plausibles la estimulación tiroidea o los efectos aditivos.',
    clm_d6711d6cd0c9: 'Se han asociado casos poco frecuentes y series de casos de lesión hepática clínicamente significativa con productos de ashwagandha, a menudo con patrones colestásicos o mixtos; suspende el uso y busca evaluación médica si aparecen ictericia, orina oscura, picor intenso o síntomas persistentes en la parte superior del abdomen.',
    clm_ead0ae0bd2e4: 'Una revisión sistemática y metaanálisis encontró una mejoría global modesta de los resultados del sueño con extracto de ashwagandha, con una señal más fuerte en adultos con insomnio, aunque el número de ensayos fue limitado y el sesgo de publicación no pudo evaluarse de forma fiable.',
  }, originalPath: '/herbs/ashwagandha/',
}]

const PORTUGUESE_HERBS: readonly LocalizedProfileTranslation[] = [{
  kind: 'herb', slug: 'ashwagandha', path: '/pt/ervas/ashwagandha/', title: 'Ashwagandha (Withania somnifera): evidências e segurança',
  summary: 'A ashwagandha é um extrato de raiz estudado principalmente para estresse persistente, sintomas de ansiedade relacionados ao estresse e sono, e não para alívio imediato. Meta-análises sugerem possível benefício, mas os ensaios usam extratos e doses diferentes e a certeza continua limitada; padronização do produto e cuidados com tireoide, fígado, gravidez e sedativos são importantes.',
  dosage: 'Os ensaios não sustentam uma dose universal para todos os produtos. Formulações e concentrações variam; a dose deve ser interpretada de acordo com o extrato específico estudado e o contexto de segurança.',
  safetyNotes: 'Ensaios de curto prazo geralmente relatam boa tolerabilidade, mas podem ocorrer sintomas gastrointestinais leves e sonolência. Há também sinais raros de estimulação da tireoide e lesão hepática, portanto o contexto individual é importante.',
  contraindications: ['Evitar durante a gravidez, salvo orientação clínica específica.', 'Ter cautela adicional com doença ou medicamentos da tireoide, sedativos, anti-hipertensivos, antidiabéticos e imunossupressores.', 'Interromper o uso e buscar avaliação médica se surgirem icterícia, urina escura, coceira intensa ou sintomas persistentes na parte superior do abdome.'],
  claims: {
    clm_554b74f570d4: 'A base de evidências clínicas ainda é limitada por ensaios pequenos, extratos e esquemas de dose heterogêneos, medidas de desfecho variáveis e preocupações com risco de viés; por isso, os resultados de uma preparação não devem ser generalizados para todos os produtos de ashwagandha.',
    clm_62d80de74d95: 'Ensaios randomizados de curto prazo geralmente relatam boa tolerabilidade, mas podem ocorrer sintomas gastrointestinais leves e sonolência, e as evidências disponíveis não estabelecem a segurança de longo prazo entre diferentes produtos ou populações.',
    clm_78af0b376bf1: 'Revisões sistemáticas de ensaios randomizados sugerem que alguns extratos de ashwagandha podem reduzir o estresse percebido e sintomas de ansiedade em adultos, mas as evidências devem ser interpretadas com cautela porque formulações, doses, populações estudadas e medidas de desfecho variam entre os ensaios.',
    clm_9318758bf577: 'Evite ashwagandha durante a gravidez, salvo orientação específica de um profissional qualificado, e tenha cautela extra com doença ou medicamentos da tireoide, sedativos, anti-hipertensivos, antidiabéticos e imunossupressores, pois os dados humanos de segurança e interação são limitados e estimulação tireoidiana ou efeitos aditivos são plausíveis.',
    clm_d6711d6cd0c9: 'Casos raros e séries de casos de lesão hepática clinicamente significativa foram associados a produtos de ashwagandha, muitas vezes com padrão colestático ou misto; interrompa o uso e procure avaliação médica se ocorrerem icterícia, urina escura, coceira intensa ou sintomas persistentes na parte superior do abdome.',
    clm_ead0ae0bd2e4: 'Uma revisão sistemática e meta-análise encontrou melhora global modesta nos desfechos de sono com extrato de ashwagandha, com sinal mais forte em adultos com insônia, embora o número de ensaios tenha sido limitado e o viés de publicação não pudesse ser avaliado com confiabilidade.',
  }, originalPath: '/herbs/ashwagandha/',
}]

const FRENCH_HERBS: readonly LocalizedProfileTranslation[] = [{
  kind: 'herb', slug: 'ashwagandha', path: '/fr/plantes/ashwagandha/', title: 'Ashwagandha (Withania somnifera) : données et sécurité',
  summary: 'L’ashwagandha est un extrait de racine étudié surtout pour le stress persistant, les symptômes anxieux liés au stress et le sommeil, plutôt que pour un soulagement immédiat. Les méta-analyses suggèrent un bénéfice possible, mais les essais utilisent des extraits et des doses différents et le niveau de certitude reste limité ; la standardisation du produit et les précautions concernant la thyroïde, le foie, la grossesse et les sédatifs sont importantes.',
  dosage: 'Les essais ne justifient pas une dose universelle pour tous les produits. Les formulations et concentrations varient ; la dose doit être interprétée selon l’extrait précis étudié et son contexte de sécurité.',
  safetyNotes: 'Les essais à court terme rapportent généralement une bonne tolérance, mais des symptômes gastro-intestinaux légers et une somnolence peuvent survenir. De rares signaux de stimulation thyroïdienne et d’atteinte hépatique existent également.',
  contraindications: ['Éviter pendant la grossesse sauf indication clinique spécifique.', 'Prudence accrue en cas de maladie ou traitement thyroïdien, avec les sédatifs, antihypertenseurs, antidiabétiques et immunosuppresseurs.', 'Arrêter et demander une évaluation médicale en cas d’ictère, d’urines foncées, de démangeaisons importantes ou de symptômes persistants dans la partie supérieure de l’abdomen.'],
  claims: {
    clm_554b74f570d4: 'La base de données cliniques reste limitée par de petits essais, des extraits et schémas posologiques hétérogènes, des mesures de résultats variables et des préoccupations liées au risque de biais ; les résultats obtenus avec une préparation ne doivent donc pas être généralisés à tous les produits à base d’ashwagandha.',
    clm_62d80de74d95: 'Les essais randomisés à court terme rapportent généralement une bonne tolérance, mais des symptômes gastro-intestinaux légers et une somnolence peuvent survenir, et les données disponibles n’établissent pas la sécurité à long terme pour l’ensemble des produits ou des populations.',
    clm_78af0b376bf1: 'Les revues systématiques d’essais randomisés suggèrent que certains extraits d’ashwagandha peuvent réduire le stress perçu et les symptômes d’anxiété chez l’adulte, mais ces données doivent être interprétées avec prudence car les formulations, doses, populations étudiées et mesures de résultats varient entre les essais.',
    clm_9318758bf577: 'Évitez l’ashwagandha pendant la grossesse sauf indication spécifique d’un professionnel qualifié, et soyez particulièrement prudent en cas de maladie ou traitement thyroïdien, avec les sédatifs, antihypertenseurs, antidiabétiques et immunosuppresseurs, car les données humaines sur la sécurité et les interactions sont limitées et une stimulation thyroïdienne ou des effets additifs sont plausibles.',
    clm_d6711d6cd0c9: 'De rares cas et séries de cas d’atteinte hépatique cliniquement significative ont été associés à des produits à base d’ashwagandha, souvent avec des profils cholestatiques ou mixtes ; arrêtez l’utilisation et demandez une évaluation médicale en cas d’ictère, d’urines foncées, de démangeaisons importantes ou de symptômes persistants dans la partie supérieure de l’abdomen.',
    clm_ead0ae0bd2e4: 'Une revue systématique et méta-analyse a observé une amélioration globale modeste des résultats liés au sommeil avec un extrait d’ashwagandha, avec un signal plus marqué chez les adultes souffrant d’insomnie, bien que le nombre d’essais soit limité et que le biais de publication n’ait pas pu être évalué de manière fiable.',
  }, originalPath: '/herbs/ashwagandha/',
}]

const GERMAN_HERBS: readonly LocalizedProfileTranslation[] = [{
  kind: 'herb', slug: 'ashwagandha', path: '/de/kraeuter/ashwagandha/', title: 'Ashwagandha (Withania somnifera): Evidenz und Sicherheit',
  summary: 'Ashwagandha ist ein Wurzelextrakt, der vor allem bei anhaltendem Stress, stressbezogenen Angstsymptomen und Schlaf untersucht wurde, nicht als sofortige Linderung. Metaanalysen deuten auf einen möglichen Nutzen hin, doch die Studien verwenden unterschiedliche Extrakte und Dosierungen und die Sicherheit der Schlussfolgerungen ist begrenzt; Produktstandardisierung sowie Vorsicht bei Schilddrüse, Leber, Schwangerschaft und sedierenden Mitteln sind wichtig.',
  dosage: 'Die Studien rechtfertigen keine universelle Dosierung für alle Produkte. Formulierungen und Konzentrationen unterscheiden sich; Dosierungen sollten im Zusammenhang mit dem konkret untersuchten Extrakt und dessen Sicherheitskontext interpretiert werden.',
  safetyNotes: 'Kurzzeitstudien berichten meist über eine gute Verträglichkeit, leichte Magen-Darm-Beschwerden und Schläfrigkeit können jedoch auftreten. Zusätzlich gibt es seltene Signale für Schilddrüsenstimulation und Leberschädigung.',
  contraindications: ['Während der Schwangerschaft vermeiden, sofern nicht ausdrücklich medizinisch empfohlen.', 'Zusätzliche Vorsicht bei Schilddrüsenerkrankungen oder -medikamenten sowie mit Sedativa, Blutdrucksenkern, Antidiabetika und Immunsuppressiva.', 'Bei Gelbsucht, dunklem Urin, starkem Juckreiz oder anhaltenden Oberbauchbeschwerden absetzen und medizinisch abklären lassen.'],
  claims: {
    clm_554b74f570d4: 'Die klinische Evidenzbasis bleibt durch kleine Studien, heterogene Extrakte und Dosierungsschemata, unterschiedliche Endpunktmessungen und Bedenken hinsichtlich des Verzerrungsrisikos begrenzt; Ergebnisse einer bestimmten Zubereitung sollten daher nicht auf alle Ashwagandha-Produkte übertragen werden.',
    clm_62d80de74d95: 'Kurzzeitige randomisierte Studien berichten im Allgemeinen über eine gute Verträglichkeit, leichte Magen-Darm-Symptome und Schläfrigkeit können jedoch auftreten, und die vorhandene Evidenz belegt keine Langzeitsicherheit über verschiedene Produkte oder Populationen hinweg.',
    clm_78af0b376bf1: 'Systematische Übersichten randomisierter Studien deuten darauf hin, dass einige Ashwagandha-Extrakte wahrgenommenen Stress und Angstsymptome bei Erwachsenen verringern können; die Evidenz sollte jedoch vorsichtig interpretiert werden, da sich Formulierungen, Dosierungen, Studienpopulationen und Endpunkte zwischen den Studien unterscheiden.',
    clm_9318758bf577: 'Ashwagandha sollte während der Schwangerschaft vermieden werden, sofern es nicht ausdrücklich von einer qualifizierten Fachperson empfohlen wird. Besondere Vorsicht ist bei Schilddrüsenerkrankungen oder Schilddrüsenmedikamenten sowie bei Sedativa, Blutdrucksenkern, Antidiabetika und Immunsuppressiva geboten, da humane Sicherheits- und Interaktionsdaten begrenzt sind und Schilddrüsenstimulation oder additive Wirkungen plausibel sind.',
    clm_d6711d6cd0c9: 'Seltene Fälle und Fallserien klinisch relevanter Leberschädigungen wurden mit Ashwagandha-Produkten in Verbindung gebracht, häufig mit cholestatischen oder gemischten Mustern; bei Gelbsucht, dunklem Urin, starkem Juckreiz oder anhaltenden Oberbauchbeschwerden sollte die Einnahme beendet und medizinische Hilfe gesucht werden.',
    clm_ead0ae0bd2e4: 'Eine systematische Übersichtsarbeit und Metaanalyse fand eine insgesamt moderate Verbesserung von Schlafendpunkten durch Ashwagandha-Extrakt, mit einem stärkeren Signal bei Erwachsenen mit Insomnie; die Zahl der Studien war jedoch begrenzt und ein Publikationsbias konnte nicht zuverlässig beurteilt werden.',
  }, originalPath: '/herbs/ashwagandha/',
}]

export const PROFILE_TRANSLATIONS: Readonly<Record<ProfileTranslationLocale, readonly LocalizedProfileTranslation[]>> = {
  es: SPANISH_HERBS, 'pt-BR': PORTUGUESE_HERBS, fr: FRENCH_HERBS, de: GERMAN_HERBS,
}

export function getProfileTranslation(locale: ProfileTranslationLocale, kind: 'herb' | 'compound', slug: string) {
  return PROFILE_TRANSLATIONS[locale].find((item) => item.kind === kind && item.slug === slug) ?? null
}

export function getProfileTranslationSlugs(locale: ProfileTranslationLocale, kind: 'herb' | 'compound') {
  return PROFILE_TRANSLATIONS[locale].filter((item) => item.kind === kind).map((item) => item.slug)
}
