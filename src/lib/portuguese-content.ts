import type { LocalizedPageData, LocalizedUiCopy } from './localization'
import { buildLocalizedPageMetadata } from './localization'
import { DEFAULT_OG_LOCALE, PORTUGUESE_OG_LOCALE } from './international-seo'

export const PORTUGUESE_UI: LocalizedUiCopy = {
  translationNotice:
    'Esta é uma tradução editorial em português do Brasil. Perfis científicos que ainda não têm uma versão completa em português são identificados como conteúdo em inglês.',
  nextStepLabel: 'Próximo passo',
  nextStepBody:
    'Continue comparando com o mesmo critério: evidência primeiro, segurança visível e limites claros.',
  educationDisclaimer:
    'Conteúdo educacional. Não substitui avaliação individual de um profissional de saúde, especialmente se você usa medicamentos, está grávida ou tem alguma condição médica.',
}

export const PORTUGUESE_PAGES = {
  home: {
    path: '/pt/',
    eyebrow: 'The Hippie Scientist em português',
    title: 'Pesquise suplementos sem adivinhar',
    description:
      'Compare ervas e suplementos por evidência humana, mecanismos, doses, segurança e interações em português do Brasil.',
    intro:
      'Compare ervas e suplementos com base em evidência em humanos, mecanismos, doses e segurança. Comece pelo objetivo — não pelo marketing.',
    sections: [
      {
        title: 'Comece por um objetivo',
        body:
          'Cada rota organiza a decisão antes de entrar em ingredientes individuais. Escolha o resultado que você quer investigar e compare opções usando o mesmo padrão.',
        links: [
          { href: '/pt/objetivos/sono/', label: 'Sono', note: 'Início do sono, qualidade e efeitos no dia seguinte' },
          { href: '/pt/objetivos/estresse/', label: 'Estresse', note: 'Padrão de estresse, evidência e tolerabilidade' },
          { href: '/pt/objetivos/ansiedade/', label: 'Ansiedade', note: 'Evidência, sedação, segurança e limites' },
          { href: '/pt/objetivos/foco/', label: 'Foco', note: 'Atenção, estimulação, sono e compensações' },
        ],
      },
      {
        title: 'Explore a biblioteca',
        body:
          'Separamos evidência clínica de mecanismos e mantemos alertas de segurança visíveis. Os perfis científicos detalhados serão traduzidos progressivamente, sem esconder quando uma página ainda está em inglês.',
        links: [
          { href: '/pt/ervas/', label: 'Ervas', note: 'Evidência, mecanismos e segurança' },
          { href: '/pt/compostos/', label: 'Compostos e suplementos', note: 'Evidência, dose e interações' },
        ],
      },
      {
        title: 'Como preservamos o significado científico',
        body:
          'A tradução deve manter o grau de certeza, as limitações, as interações e o contexto da evidência do conteúdo original. Uma hipótese promissora não vira benefício comprovado só porque foi traduzida.',
        links: [
          { href: '/pt/metodologia/', label: 'Como avaliamos a evidência' },
          { href: '/pt/seguranca/', label: 'Segurança e interações' },
        ],
      },
    ],
    primaryCta: { href: '/pt/objetivos/', label: 'Escolher um objetivo' },
    secondaryCta: { href: '/', label: 'English version' },
  },
  herbs: {
    path: '/pt/ervas/',
    eyebrow: 'Biblioteca de pesquisa',
    title: 'Ervas: evidência, mecanismos e segurança',
    description:
      'Explore ervas com foco em evidência humana, mecanismos, doses, segurança e interações em português do Brasil.',
    intro:
      'Comece por uma erva conhecida ou pelo objetivo que interessa a você. Priorizamos evidência em humanos e mantemos segurança visível antes de qualquer conclusão prática.',
    sections: [
      {
        title: 'Como ler a biblioteca',
        body:
          'Uma erva não é avaliada pela popularidade. Separamos o que foi observado em pessoas do que é apenas plausível por mecanismo, tradição ou pesquisa pré-clínica.',
        bullets: [
          'Veja primeiro a qualidade e o tipo de evidência humana.',
          'Revise interações, contraindicações e contexto de dose.',
          'Trate mecanismos como contexto biológico, não como prova clínica.',
          'Considere a incerteza quando os estudos forem pequenos, mistos ou indiretos.',
        ],
      },
      {
        title: 'Perfis para investigar',
        body: 'Os perfis científicos completos ainda abrem em inglês enquanto a tradução campo a campo é concluída.',
        links: [
          { href: '/herbs/ashwagandha/', label: 'Ashwagandha', note: 'Perfil detalhado em inglês' },
          { href: '/herbs/rhodiola/', label: 'Rhodiola', note: 'Perfil detalhado em inglês' },
          { href: '/herbs/valerian/', label: 'Valeriana', note: 'Perfil detalhado em inglês' },
          { href: '/herbs/bacopa/', label: 'Bacopa', note: 'Perfil detalhado em inglês' },
        ],
      },
    ],
    primaryCta: { href: '/pt/objetivos/', label: 'Pesquisar por objetivo' },
    secondaryCta: { href: '/herbs/', label: 'Abrir biblioteca completa em inglês' },
  },
  compounds: {
    path: '/pt/compostos/',
    eyebrow: 'Biblioteca de pesquisa',
    title: 'Compostos e suplementos: compare a evidência',
    description:
      'Explore compostos e suplementos por evidência, mecanismos, doses, segurança e interações em português do Brasil.',
    intro:
      'A biblioteca organiza o que sabemos, o que ainda não sabemos e quais riscos merecem atenção antes de comparar opções.',
    sections: [
      {
        title: 'O que priorizamos',
        body:
          'Evidência clínica em pessoas pesa mais do que mecanismos isolados ou alegações de marketing. Um sinal promissor não é apresentado como benefício comprovado.',
        bullets: [
          'Tipo e qualidade dos estudos em humanos.',
          'Consistência entre estudos e revisões.',
          'Doses estudadas e contexto de uso.',
          'Interações, contraindicações e efeitos adversos relevantes.',
        ],
      },
      {
        title: 'Pontos de partida',
        body: 'Os perfis completos abaixo continuam em inglês durante esta fase de tradução.',
        links: [
          { href: '/compounds/magnesium/', label: 'Magnésio', note: 'Perfil detalhado em inglês' },
          { href: '/compounds/l-theanine/', label: 'L-teanina', note: 'Perfil detalhado em inglês' },
          { href: '/compounds/melatonin/', label: 'Melatonina', note: 'Perfil detalhado em inglês' },
          { href: '/compounds/omega-3/', label: 'Ômega-3', note: 'Perfil detalhado em inglês' },
        ],
      },
    ],
    primaryCta: { href: '/pt/objetivos/', label: 'Comparar por objetivo' },
    secondaryCta: { href: '/compounds/', label: 'Abrir biblioteca completa em inglês' },
  },
  goals: {
    path: '/pt/objetivos/',
    eyebrow: 'Comece pelo que você quer melhorar',
    title: 'Explore suplementos por objetivo',
    description:
      'Compare opções para sono, estresse, ansiedade e foco usando evidência, segurança, doses e contexto prático.',
    intro:
      'Em vez de começar por um ingrediente da moda, comece pelo resultado que importa. Cada guia ajuda a reduzir opções antes de entrar em perfis individuais.',
    sections: [
      {
        title: 'Objetivos principais',
        body: 'Escolha uma rota para entender quais perguntas importam antes de comparar suplementos.',
        links: [
          { href: '/pt/objetivos/sono/', label: 'Sono', note: 'Qualidade, horário e efeitos no dia seguinte' },
          { href: '/pt/objetivos/estresse/', label: 'Estresse', note: 'Padrão de estresse, duração de uso e tolerabilidade' },
          { href: '/pt/objetivos/ansiedade/', label: 'Ansiedade', note: 'Evidência, sedação, interações e limites' },
          { href: '/pt/objetivos/foco/', label: 'Foco', note: 'Atenção, estimulação, sono e compensações' },
        ],
      },
      {
        title: 'Como comparar',
        body:
          'Uma opção pode fazer sentido em um contexto e ser ruim em outro. Compare evidência, tempo de ação, duração, segurança, compatibilidade com medicamentos e o quanto a pesquisa se parece com sua situação.',
      },
    ],
    primaryCta: { href: '/pt/seguranca/', label: 'Revisar segurança primeiro' },
    secondaryCta: { href: '/goals/', label: 'Ver todos os objetivos em inglês' },
  },
  sleep: {
    path: '/pt/objetivos/sono/',
    eyebrow: 'Objetivo: sono',
    title: 'Suplementos para sono: como comparar opções',
    description:
      'Compare suplementos para sono considerando evidência humana, horário, duração, efeitos no dia seguinte, doses e interações.',
    intro:
      '“Dormir melhor” pode significar pegar no sono mais rápido, acordar menos, melhorar a qualidade percebida ou evitar sonolência no dia seguinte. A comparação muda conforme o problema real.',
    sections: [
      {
        title: 'Perguntas que mudam a decisão',
        body: 'Antes de escolher um ingrediente, defina qual parte do sono você está tentando melhorar.',
        bullets: [
          'O principal problema é iniciar o sono ou mantê-lo?',
          'Você precisa evitar sedação ou lentidão no dia seguinte?',
          'Usa medicamentos ou outros suplementos com efeitos sedativos?',
          'A evidência estudou uma situação parecida com a sua?',
        ],
      },
      {
        title: 'Perfis para investigar',
        body: 'Os perfis científicos detalhados ainda estão em inglês nesta fase.',
        links: [
          { href: '/compounds/melatonin/', label: 'Melatonina', note: 'Perfil detalhado em inglês' },
          { href: '/compounds/magnesium/', label: 'Magnésio', note: 'Perfil detalhado em inglês' },
          { href: '/compounds/l-theanine/', label: 'L-teanina', note: 'Perfil detalhado em inglês' },
          { href: '/herbs/valerian/', label: 'Valeriana', note: 'Perfil detalhado em inglês' },
        ],
      },
    ],
    primaryCta: { href: '/pt/seguranca/', label: 'Revisar segurança' },
    secondaryCta: { href: '/goals/sleep/', label: 'Abrir guia completo em inglês' },
  },
  stress: {
    path: '/pt/objetivos/estresse/',
    eyebrow: 'Objetivo: estresse',
    title: 'Estresse: compare opções sem confundir mecanismo com evidência',
    description:
      'Compare suplementos para estresse por evidência humana, padrão de sintomas, tempo de uso, segurança, doses e interações.',
    intro:
      'Estresse não é uma experiência única. A utilidade de uma opção depende de você buscar calma aguda, suporte durante uma fase exigente ou uma estratégia que não atrapalhe energia e foco.',
    sections: [
      {
        title: 'O que vale separar',
        body:
          'Muitos produtos usam linguagem sobre “adaptógenos” ou cortisol. Esses termos não substituem ensaios clínicos nem provam que uma opção seja adequada para uma pessoa específica.',
        bullets: [
          'Efeitos percebidos versus mudanças em biomarcadores.',
          'Uso agudo versus uso durante semanas.',
          'Calma útil versus sedação indesejada.',
          'Benefício potencial versus interações e contraindicações.',
        ],
      },
      {
        title: 'Perfis para investigar',
        body: 'Os perfis completos abaixo ainda estão em inglês.',
        links: [
          { href: '/herbs/ashwagandha/', label: 'Ashwagandha', note: 'Perfil detalhado em inglês' },
          { href: '/herbs/rhodiola/', label: 'Rhodiola', note: 'Perfil detalhado em inglês' },
          { href: '/compounds/l-theanine/', label: 'L-teanina', note: 'Perfil detalhado em inglês' },
          { href: '/compounds/magnesium/', label: 'Magnésio', note: 'Perfil detalhado em inglês' },
        ],
      },
    ],
    primaryCta: { href: '/pt/seguranca/', label: 'Revisar segurança' },
    secondaryCta: { href: '/goals/stress/', label: 'Abrir guia completo em inglês' },
  },
  anxiety: {
    path: '/pt/objetivos/ansiedade/',
    eyebrow: 'Objetivo: ansiedade',
    title: 'Ansiedade: evidência e segurança antes de promessas rápidas',
    description:
      'Compare suplementos estudados para ansiedade considerando qualidade da evidência, sedação, doses, interações e incerteza.',
    intro:
      'Em ansiedade, um sinal pequeno não deve virar uma promessa grande. A prioridade é separar evidência clínica de mecanismos teóricos e manter precauções visíveis.',
    sections: [
      {
        title: 'O que olhar primeiro',
        body: 'Qualidade do estudo, população estudada e tamanho do efeito importam tanto quanto o nome do ingrediente.',
        bullets: [
          'Há ensaios controlados em humanos ou apenas evidência indireta?',
          'Os resultados são consistentes entre estudos?',
          'Pode causar sedação ou somar efeito com outros depressores do sistema nervoso?',
          'Há interações relevantes com medicamentos?',
        ],
      },
      {
        title: 'Perfis para investigar',
        body: 'Os perfis completos abaixo ainda estão em inglês.',
        links: [
          { href: '/compounds/l-theanine/', label: 'L-teanina', note: 'Perfil detalhado em inglês' },
          { href: '/herbs/ashwagandha/', label: 'Ashwagandha', note: 'Perfil detalhado em inglês' },
          { href: '/herbs/valerian/', label: 'Valeriana', note: 'Perfil detalhado em inglês' },
          { href: '/compounds/magnesium/', label: 'Magnésio', note: 'Perfil detalhado em inglês' },
        ],
      },
    ],
    primaryCta: { href: '/pt/seguranca/', label: 'Revisar segurança' },
    secondaryCta: { href: '/goals/anxiety/', label: 'Abrir guia completo em inglês' },
  },
  focus: {
    path: '/pt/objetivos/foco/',
    eyebrow: 'Objetivo: foco',
    title: 'Foco: compare benefício, estimulação e compensações',
    description:
      'Compare suplementos para foco por evidência humana, estimulação, duração, sono, tolerabilidade, doses e interações.',
    intro:
      'Mais estimulação nem sempre significa melhor foco. Uma comparação útil considera atenção, fadiga, sono, tolerabilidade e a qualidade real da evidência.',
    sections: [
      {
        title: 'Perguntas úteis',
        body:
          'Defina se você busca alerta, resistência mental, menos distração ou suporte durante fadiga. São objetivos diferentes e os estudos nem sempre medem a mesma coisa.',
        bullets: [
          'A evidência mede atenção objetiva ou apenas sensação subjetiva?',
          'O ingrediente é estimulante e pode prejudicar o sono?',
          'Há tolerância, rebote ou interações relevantes?',
          'A dose estudada corresponde à forma do produto que você está comparando?',
        ],
      },
      {
        title: 'Perfis para investigar',
        body: 'Os perfis completos abaixo ainda estão em inglês.',
        links: [
          { href: '/compounds/caffeine/', label: 'Cafeína', note: 'Perfil detalhado em inglês' },
          { href: '/compounds/l-theanine/', label: 'L-teanina', note: 'Perfil detalhado em inglês' },
          { href: '/herbs/rhodiola/', label: 'Rhodiola', note: 'Perfil detalhado em inglês' },
          { href: '/herbs/bacopa/', label: 'Bacopa', note: 'Perfil detalhado em inglês' },
        ],
      },
    ],
    primaryCta: { href: '/pt/seguranca/', label: 'Revisar segurança' },
    secondaryCta: { href: '/goals/focus/', label: 'Abrir guia completo em inglês' },
  },
  methodology: {
    path: '/pt/metodologia/',
    eyebrow: 'Como trabalhamos',
    title: 'Metodologia: como avaliamos a evidência',
    description:
      'Entenda como The Hippie Scientist separa evidência humana, mecanismos, segurança e limites de pesquisa para avaliar suplementos.',
    intro:
      'O objetivo não é encontrar uma razão para recomendar cada ingrediente. É representar com fidelidade a força da evidência, as perguntas em aberto e os riscos relevantes.',
    sections: [
      { title: '1. Evidência humana primeiro', body: 'Ensaios e estudos em pessoas têm prioridade para avaliar resultados humanos. Estudos celulares e animais ajudam a explicar hipóteses, mas não são apresentados como benefícios clínicos comprovados.' },
      { title: '2. Mecanismo separado do desfecho', body: 'Uma via biológica plausível pode explicar por que algo merece estudo. Sozinha, ela não transforma uma intervenção em eficaz.' },
      { title: '3. Segurança antes do veredito', body: 'Interações, contraindicações, efeitos adversos e contexto de dose continuam visíveis mesmo quando a evidência de benefício parece promissora.' },
      { title: '4. Incerteza explícita', body: 'Resultados mistos, amostras pequenas, dependência excessiva de um único estudo e evidência indireta reduzem a confiança. Essa incerteza deve permanecer na linguagem editorial.' },
    ],
    primaryCta: { href: '/info/methodology/', label: 'Ver metodologia completa em inglês' },
    secondaryCta: { href: '/pt/seguranca/', label: 'Ver abordagem de segurança' },
  },
  safety: {
    path: '/pt/seguranca/',
    eyebrow: 'Segurança primeiro',
    title: 'Segurança de suplementos e interações',
    description:
      'Revise interações, contraindicações, sedação, duplicação de efeitos e contexto de dose antes de combinar ervas ou suplementos.',
    intro:
      'Um produto ser “natural” não significa ser neutro. A segurança depende de dose, medicamentos, condições médicas, gravidez, combinações e outros fatores pessoais.',
    sections: [
      {
        title: 'Antes de combinar produtos',
        body: 'Procure riscos acumulativos, não apenas alertas isolados de cada ingrediente.',
        bullets: [
          'Efeitos sedativos que podem se somar.',
          'Possíveis alterações em pressão arterial, glicose ou coagulação.',
          'Ingredientes repetidos em vários produtos.',
          'Interações com medicamentos e condições médicas.',
          'Doses ou formas do ingrediente diferentes das estudadas.',
        ],
      },
      {
        title: 'Ferramentas atuais',
        body: 'As ferramentas interativas detalhadas continuam em inglês nesta fase, mas podem ajudar a identificar perguntas de segurança para confirmar com um profissional de saúde.',
        links: [
          { href: '/safety-checker/', label: 'Verificador de interações', note: 'Ferramenta em inglês' },
          { href: '/info/supplement-safety-checklist/', label: 'Checklist de segurança de suplementos', note: 'Guia em inglês' },
        ],
      },
    ],
    primaryCta: { href: '/safety-checker/', label: 'Abrir verificador em inglês' },
    secondaryCta: { href: '/pt/metodologia/', label: 'Como avaliamos a evidência' },
  },
} as const satisfies Record<string, LocalizedPageData>

export type PortuguesePageKey = keyof typeof PORTUGUESE_PAGES

export const PORTUGUESE_ROUTE_KEYS: Record<string, PortuguesePageKey> = {
  'ervas': 'herbs',
  'compostos': 'compounds',
  'objetivos': 'goals',
  'objetivos/sono': 'sleep',
  'objetivos/estresse': 'stress',
  'objetivos/ansiedade': 'anxiety',
  'objetivos/foco': 'focus',
  'metodologia': 'methodology',
  'seguranca': 'safety',
}

export function buildPortuguesePageMetadata(page: LocalizedPageData) {
  return buildLocalizedPageMetadata(page, {
    openGraphLocale: PORTUGUESE_OG_LOCALE,
    alternateOpenGraphLocales: [DEFAULT_OG_LOCALE],
  })
}
