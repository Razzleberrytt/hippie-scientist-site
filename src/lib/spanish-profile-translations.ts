import type { Metadata } from 'next'

import { buildPageMetadata } from './seo'
import { DEFAULT_OG_LOCALE, SPANISH_OG_LOCALE } from './international-seo'
import type { LocalizedProfileTranslation, LocalizedProfileUiCopy } from './localized-profile'

export const SPANISH_PROFILE_UI: LocalizedProfileUiCopy = {
  evidenceEyebrow: 'Perfil de evidencia traducido',
  evidenceHeading: 'Qué dice la evidencia',
  evidenceIntro: 'Cada afirmación de esta página corresponde a una afirmación aprobada del perfil científico canónico. Las referencias se mantienen unidas a las mismas fuentes originales.',
  safetyHeading: 'Seguridad y precauciones',
  dosageHeading: 'Dosis y contexto de uso',
  sourcesHeading: 'Fuentes de investigación',
  sourcesIntro: 'Los títulos bibliográficos se conservan en su idioma original para mantener la referencia científica exacta.',
  evidenceLevelLabel: 'Nivel de evidencia',
  confidenceLabel: 'Confianza editorial',
  sourceLabel: 'Fuente',
  originalLabel: 'Ver perfil original en inglés',
  backToLibraryLabel: 'Volver a la biblioteca',
  educationalDisclaimer: 'Contenido educativo basado en la evidencia enlazada. No sustituye una evaluación médica individual ni una recomendación personalizada.',
}

export const SPANISH_PROFILE_TRANSLATIONS = {
  herbs: {
    ashwagandha: {
      kind: 'herb',
      slug: 'ashwagandha',
      path: '/es/hierbas/ashwagandha/',
      title: 'Ashwagandha (Withania somnifera): evidencia, dosis y seguridad',
      summary: 'La ashwagandha (Withania somnifera) es un extracto de raíz estudiado principalmente para estrés persistente, ansiedad relacionada con el estrés y sueño, no para alivio inmediato. Los metaanálisis sugieren un posible beneficio, pero los ensayos usan extractos y dosis distintos y la certeza es limitada; importan la estandarización del producto y las precauciones tiroideas, hepáticas, durante el embarazo y con sedantes.',
      dosage: 'Los estudios suelen utilizar aproximadamente 300–600 mg al día de extractos estandarizados, pero los resultados de una preparación concreta no deben generalizarse automáticamente a todos los productos de ashwagandha.',
      safetyNotes: 'Puede causar molestias gastrointestinales y somnolencia. Se han descrito señales raras de estimulación tiroidea y lesión hepática clínicamente relevante; durante el embarazo debe evitarse salvo indicación específica de un profesional cualificado.',
      contraindications: [
        'Embarazo salvo indicación clínica específica.',
        'Enfermedad tiroidea o uso de medicación tiroidea: requiere precaución adicional.',
        'Precaución al combinar con sedantes, antihipertensivos, antidiabéticos o inmunosupresores.',
      ],
      claims: {
        clm_554b74f570d4: 'La base de evidencia clínica sigue limitada por ensayos pequeños, extractos y pautas de dosis heterogéneos, medidas de resultado variables y preocupaciones por riesgo de sesgo; por ello, los resultados de una preparación no deben generalizarse a todos los productos de ashwagandha.',
        clm_62d80de74d95: 'Los ensayos aleatorizados a corto plazo suelen describir buena tolerabilidad, aunque pueden aparecer síntomas gastrointestinales leves y somnolencia. La evidencia disponible no establece la seguridad a largo plazo entre distintos productos o poblaciones.',
        clm_78af0b376bf1: 'Las revisiones sistemáticas de ensayos aleatorizados sugieren que algunos extractos de ashwagandha pueden reducir el estrés percibido y los síntomas de ansiedad en adultos, pero la evidencia debe interpretarse con cautela porque las formulaciones, dosis, poblaciones y medidas de resultado varían entre estudios.',
        clm_9318758bf577: 'Evita la ashwagandha durante el embarazo salvo indicación específica de un profesional cualificado y extrema la precaución si existe enfermedad tiroidea o tratamiento tiroideo, o si se usan sedantes, antihipertensivos, antidiabéticos o inmunosupresores. Los datos humanos sobre seguridad e interacciones son limitados y son plausibles la estimulación tiroidea o los efectos aditivos.',
        clm_d6711d6cd0c9: 'Casos aislados y series de casos han asociado productos de ashwagandha con lesión hepática clínicamente importante, a menudo con patrones colestásicos o mixtos. Suspende el uso y busca evaluación médica si aparecen ictericia, orina oscura, picor intenso o síntomas persistentes en la parte superior del abdomen.',
        clm_ead0ae0bd2e4: 'Una revisión sistemática y metaanálisis encontró una mejoría global modesta en resultados de sueño con extracto de ashwagandha, con una señal más marcada en adultos con insomnio. Sin embargo, el número de ensayos fue limitado y el sesgo de publicación no pudo evaluarse de forma fiable.',
      },
      originalPath: '/herbs/ashwagandha/',
    },
  },
  compounds: {
    'l-theanine': {
      kind: 'compound',
      slug: 'l-theanine',
      path: '/es/compuestos/l-theanine/',
      title: 'L-teanina: evidencia para estrés, sueño, concentración y seguridad',
      summary: 'La L-teanina se estudia sobre todo por sus posibles efectos sobre relajación, respuesta al estrés, sueño y atención, pero los ensayos humanos son pequeños y los resultados no justifican presentarla como un ansiolítico, somnífero o potenciador cognitivo fiable por sí sola.',
      dosage: 'Varios de los ensayos humanos citados en este perfil evaluaron dosis de 200 mg, ya fuera de forma aguda o diaria durante unas semanas. Esa cifra describe dosis estudiadas, no una recomendación universal ni una garantía de eficacia.',
      safetyNotes: 'Los ensayos pequeños a corto plazo no han mostrado señales importantes de daño, pero faltan datos sólidos sobre uso prolongado, embarazo, lactancia e interacciones. Puede requerir precaución en personas con presión arterial baja o al combinarse con sustancias sedantes.',
      contraindications: [
        'Precaución con hipotensión o medicamentos antihipertensivos.',
        'Precaución al combinar con benzodiacepinas, alcohol u otros depresores del sistema nervioso central.',
        'Los datos de seguridad durante embarazo y lactancia son insuficientes.',
      ],
      claims: {
        clm_1c6f8ef18694: 'En un pequeño ensayo aleatorizado, doble ciego y cruzado en adultos sanos, 200 mg al día de L-teanina durante cuatro semanas mejoraron más que placebo algunas subescalas de calidad del sueño, incluida la latencia y la alteración del sueño. La puntuación total de calidad del sueño no mejoró significativamente frente a placebo, por lo que la evidencia sigue siendo preliminar.',
        clm_536416fd7202: 'En un pequeño estudio controlado con placebo de 16 voluntarios sanos, una dosis única de 200 mg de L-teanina mejoró modestamente una subescala de ansiedad en reposo, pero no redujo la ansiedad durante una situación experimental de ansiedad anticipatoria intensa. Esto no demuestra un efecto ansiolítico agudo fiable bajo estrés intenso.',
        clm_57db73f124e1: 'En un ensayo cruzado, aleatorizado y doble ciego con 30 adultos sanos, 200 mg al día de L-teanina durante cuatro semanas no produjeron eventos adversos aparentes ni abandonos. El tamaño pequeño y la corta duración no permiten establecer la seguridad a largo plazo ni excluir efectos raros o interacciones.',
        clm_e2f7a00c9a21: 'En un pequeño estudio cruzado, 200 mg de L-teanina atenuaron el aumento de la presión arterial durante estrés psicológico solo entre participantes que mostraban una gran respuesta de presión arterial con placebo. Este hallazgo de subgrupo no establece un efecto antihipertensivo general.',
        clm_ea53ecebd001: 'La evidencia de ensayos aleatorizados no establece que la L-teanina por sí sola sea un potenciador cognitivo fiable. La combinación de L-teanina con cafeína puede mejorar algunos resultados en tareas de atención, aunque la base de evidencia presenta preocupaciones importantes por riesgo de sesgo.',
        clm_f6cf48fbab00: 'En un pequeño estudio controlado con placebo, una dosis única de 200 mg de L-teanina redujo el estrés subjetivo, la respuesta de frecuencia cardiaca y la respuesta de inmunoglobulina A salival durante una tarea de aritmética mental. Las revisiones sistemáticas sugieren posibles efectos antiestrés, pero la literatura sigue siendo limitada y presenta preocupaciones por riesgo de sesgo.',
      },
      originalPath: '/compounds/l-theanine/',
    },
  },
} as const satisfies {
  herbs: Record<string, LocalizedProfileTranslation>
  compounds: Record<string, LocalizedProfileTranslation>
}

export function buildSpanishProfileMetadata(profile: LocalizedProfileTranslation): Metadata {
  const metadata = buildPageMetadata({
    title: profile.title,
    description: profile.summary,
    path: profile.path,
    openGraphType: 'article',
  })
  return {
    ...metadata,
    openGraph: metadata.openGraph ? {
      ...metadata.openGraph,
      locale: SPANISH_OG_LOCALE,
      alternateLocale: [DEFAULT_OG_LOCALE],
    } : metadata.openGraph,
  }
}
