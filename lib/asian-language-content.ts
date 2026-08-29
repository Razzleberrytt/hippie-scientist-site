import type { LocalizedPageData, LocalizedUiCopy } from './localization'
import { buildLocalizedPageMetadata } from './localization'
import {
  DEFAULT_OG_LOCALE,
  JAPANESE_OG_LOCALE,
  KOREAN_OG_LOCALE,
} from './international-seo'

export const JAPANESE_UI: LocalizedUiCopy = {
  translationNotice: 'これは日本語の編集翻訳です。完全な日本語版がまだない詳細な科学プロフィールは、英語コンテンツであることを明確に表示します。',
  nextStepLabel: '次のステップ',
  nextStepBody: '同じ基準で比較を続けてください。エビデンスを先に確認し、安全性を見える形で示し、限界を明確にします。',
  educationDisclaimer: '教育目的の情報です。薬を使用している場合、妊娠中の場合、または持病がある場合を含め、個別の医療評価や専門家の助言に代わるものではありません。',
}

export const JAPANESE_PAGES = {
  home: {
    path: '/ja/',
    eyebrow: 'The Hippie Scientist 日本語版',
    title: '推測ではなくエビデンスからサプリメントを調べる',
    description: 'ハーブやサプリメントを、ヒトでの研究、作用機序、研究された用量、安全性、相互作用という同じ基準で日本語で比較します。',
    intro: '流行や宣伝文句ではなく、確認できるヒトでのエビデンスから始めます。作用機序と臨床結果を分け、研究された用量、安全性、相互作用、不確実性を同時に確認できるようにします。',
    sections: [
      {
        title: '目的から始める',
        body: '成分名を先に選ぶのではなく、まず何を改善したいのかを決め、その目的に対して同じ評価基準で候補を比較します。',
        links: [
          { href: '/ja/goals/sleep/', label: '睡眠' },
          { href: '/ja/goals/stress/', label: 'ストレス' },
          { href: '/ja/goals/anxiety/', label: '不安' },
          { href: '/ja/goals/focus/', label: '集中' },
        ],
      },
      {
        title: '研究ライブラリを使う',
        body: '主要な案内ページは日本語化しています。詳細な科学プロフィールは、主張ごとの翻訳と安全性レビューが完了するまで英語版を明確に案内します。',
        links: [
          { href: '/ja/herbs/', label: 'ハーブ' },
          { href: '/ja/compounds/', label: '成分・サプリメント' },
          { href: '/ja/methodology/', label: '評価方法' },
          { href: '/ja/safety/', label: '安全性' },
        ],
      },
    ],
    primaryCta: { href: '/ja/goals/', label: '目的を選ぶ' },
    secondaryCta: { href: '/', label: '英語版を見る' },
  },
  herbs: {
    path: '/ja/herbs/',
    eyebrow: '研究ライブラリ',
    title: 'ハーブ：エビデンス、作用機序、安全性',
    description: 'ハーブを日本語で調べ、ヒトでの研究の質、研究された用量、安全性、相互作用、研究の限界を優先して確認します。',
    intro: '人気や伝統的な使用だけでは有効性の証明にはなりません。ヒトで観察された結果と、作用機序・伝統・前臨床研究から得られる仮説を明確に分けます。',
    sections: [
      { title: 'ライブラリの読み方', body: 'まずヒト研究の種類と質を確認し、その後に用量、相互作用、禁忌、不確実性を確認します。', bullets: ['ヒトでの結果を作用機序だけの説明より重視します。', '研究された用量は個人への推奨量と同じではありません。', '小規模または一貫しない結果には慎重な表現が必要です。'] },
      { title: '詳しく調べる候補', body: '詳細プロフィールは完全な日本語レビューが終わるまで英語版を案内します。', links: [{ href: '/herbs/ashwagandha/', label: 'アシュワガンダ' }, { href: '/herbs/rhodiola/', label: 'ロディオラ' }, { href: '/herbs/valerian/', label: 'バレリアン' }] },
    ],
    primaryCta: { href: '/ja/goals/', label: '目的から探す' },
    secondaryCta: { href: '/herbs/', label: '英語の全ハーブライブラリ' },
  },
  compounds: {
    path: '/ja/compounds/',
    eyebrow: '研究ライブラリ',
    title: '成分・サプリメント：エビデンスを比較する',
    description: '成分やサプリメントを、ヒト研究、研究された用量、安全性、相互作用、エビデンスの質という基準で日本語で比較します。',
    intro: '良い比較では、臨床的に観察された結果と理論上もっともらしい作用機序を区別します。期待できる可能性だけでなく、限界と重要な安全性情報も同じ画面で確認します。',
    sections: [
      { title: '優先する情報', body: '臨床研究、研究間の一貫性、実際に研究された用量、安全性シグナルを優先します。', bullets: ['研究デザインと質', '結果の一貫性', '相互作用と禁忌', '製剤や用量の違い'] },
      { title: '調査の出発点', body: '詳細プロフィールは現在英語版です。', links: [{ href: '/compounds/magnesium/', label: 'マグネシウム' }, { href: '/compounds/l-theanine/', label: 'L-テアニン' }, { href: '/compounds/melatonin/', label: 'メラトニン' }] },
    ],
    primaryCta: { href: '/ja/goals/', label: '目的別に比較する' },
    secondaryCta: { href: '/compounds/', label: '英語の全成分ライブラリ' },
  },
  goals: {
    path: '/ja/goals/',
    eyebrow: '結果から考える',
    title: '目的別にサプリメントを調べる',
    description: '睡眠、ストレス、不安、集中について、エビデンス、安全性、研究された用量、実用上の条件を同じ基準で比較します。',
    intro: '話題の成分から始める代わりに、まず知りたい結果を定義します。各ガイドでは、個別成分を見る前に、重要な比較項目と安全性の確認点を整理します。',
    sections: [{ title: '主な目的', body: '目的を選び、エビデンスの質、安全性、自分の問いとの一致度を同じ質問で確認します。', links: [{ href: '/ja/goals/sleep/', label: '睡眠' }, { href: '/ja/goals/stress/', label: 'ストレス' }, { href: '/ja/goals/anxiety/', label: '不安' }, { href: '/ja/goals/focus/', label: '集中' }] }],
    primaryCta: { href: '/ja/safety/', label: 'まず安全性を確認する' },
    secondaryCta: { href: '/goals/', label: '英語の全目的ガイド' },
  },
  sleep: {
    path: '/ja/goals/sleep/',
    eyebrow: '目的：睡眠',
    title: '睡眠サプリメント：選択肢を比較する方法',
    description: '睡眠に関するサプリメントを、ヒト研究、使用タイミング、翌日の影響、研究された用量、相互作用から比較します。',
    intro: '「よく眠る」は、寝つきを早める、夜間覚醒を減らす、主観的な睡眠の質を上げる、翌日の眠気を避けるなど複数の意味があります。実際の問題によって比較すべき指標は変わります。',
    sections: [{ title: '判断を変える質問', body: '主な問題が入眠、睡眠維持、翌日の機能のどれなのかを明確にします。', bullets: ['研究対象は自分の問いに近いですか。', '鎮静や重要な相互作用はありますか。', '製品の形態と用量は研究条件に近いですか。'], links: [{ href: '/compounds/melatonin/', label: 'メラトニン' }, { href: '/compounds/magnesium/', label: 'マグネシウム' }, { href: '/herbs/valerian/', label: 'バレリアン' }] }],
    primaryCta: { href: '/ja/safety/', label: '安全性を確認する' },
    secondaryCta: { href: '/goals/sleep/', label: '英語の詳細ガイド' },
  },
  stress: {
    path: '/ja/goals/stress/',
    eyebrow: '目的：ストレス',
    title: 'ストレス：作用機序と臨床エビデンスを混同せず比較する',
    description: 'ストレス関連サプリメントを、ヒト研究、使用期間、忍容性、研究された用量、安全性、相互作用から比較します。',
    intro: '「アダプトゲン」やコルチゾールに関する説明は、それだけでは臨床効果を証明しません。人で何が測定され、結果がどの程度一貫しているかを優先します。',
    sections: [{ title: '分けて考える項目', body: '主観的な変化とバイオマーカー、短期使用と長期使用、有用な落ち着きと望ましくない鎮静を分けて考えます。', links: [{ href: '/herbs/ashwagandha/', label: 'アシュワガンダ' }, { href: '/herbs/rhodiola/', label: 'ロディオラ' }, { href: '/compounds/l-theanine/', label: 'L-テアニン' }] }],
    primaryCta: { href: '/ja/safety/', label: '安全性を確認する' },
    secondaryCta: { href: '/goals/stress/', label: '英語の詳細ガイド' },
  },
  anxiety: {
    path: '/ja/goals/anxiety/',
    eyebrow: '目的：不安',
    title: '不安：速い約束よりエビデンスと安全性を優先する',
    description: '不安について研究されたサプリメントを、エビデンスの質、鎮静、研究された用量、相互作用、不確実性から比較します。',
    intro: '不安に関する小さな研究シグナルを大きな約束に変えるべきではありません。臨床エビデンスと理論的な作用機序を分け、安全性上の注意を常に見える形にします。',
    sections: [{ title: '最初に確認すること', body: '研究の質、対象集団、効果の大きさ、鎮静、薬や他の中枢神経抑制作用を持つものとの相互作用を確認します。', links: [{ href: '/compounds/l-theanine/', label: 'L-テアニン' }, { href: '/herbs/ashwagandha/', label: 'アシュワガンダ' }, { href: '/herbs/valerian/', label: 'バレリアン' }] }],
    primaryCta: { href: '/ja/safety/', label: '安全性を確認する' },
    secondaryCta: { href: '/goals/anxiety/', label: '英語の詳細ガイド' },
  },
  focus: {
    path: '/ja/goals/focus/',
    eyebrow: '目的：集中',
    title: '集中：効果、刺激性、トレードオフを比較する',
    description: '集中や注意に関するサプリメントを、ヒト研究、刺激性、睡眠への影響、研究された用量、相互作用から比較します。',
    intro: '刺激が強いほど集中力が高まるとは限りません。注意、疲労、睡眠、忍容性、実際のエビデンスの質を一緒に評価する必要があります。',
    sections: [{ title: '役立つ質問', body: '研究が客観的な注意課題を測っているのか、主観的な感覚だけなのかを確認し、潜在的な利益が睡眠や忍容性の低下と引き換えになっていないかを見ます。', links: [{ href: '/compounds/caffeine/', label: 'カフェイン' }, { href: '/compounds/l-theanine/', label: 'L-テアニン' }, { href: '/herbs/bacopa/', label: 'バコパ' }] }],
    primaryCta: { href: '/ja/safety/', label: '安全性を確認する' },
    secondaryCta: { href: '/goals/focus/', label: '英語の詳細ガイド' },
  },
  methodology: {
    path: '/ja/methodology/',
    eyebrow: '評価方法',
    title: '方法論：エビデンスをどう評価するか',
    description: 'The Hippie Scientist が、ヒト研究、作用機序、安全性、研究の限界をどのように分けて評価するかを日本語で説明します。',
    intro: '目的は、すべての成分を勧める理由を探すことではありません。エビデンスの強さ、未解決の問い、重要なリスクをできるだけ正確に表現することです。',
    sections: [{ title: '評価の基本', body: 'ヒトの結果にはヒト研究を優先し、作用機序を臨床証拠として扱わず、安全性を結論より前に確認し、データが小規模・混在・間接的な場合は確信度を下げます。', bullets: ['作用機序だけよりヒト研究を優先します。', '実用的な結論の前に安全性と相互作用を確認します。', '偽の精密さではなく不確実性を明示します。'] }],
    primaryCta: { href: '/info/methodology/', label: '英語の完全な方法論' },
    secondaryCta: { href: '/ja/safety/', label: '安全性の考え方' },
  },
  safety: {
    path: '/ja/safety/',
    eyebrow: '安全性を最優先',
    title: 'サプリメントの安全性と相互作用',
    description: 'ハーブやサプリメントを組み合わせる前に、相互作用、禁忌、鎮静、加算効果、研究された用量の文脈を確認します。',
    intro: '「天然」は「影響がない」という意味ではありません。安全性は用量、薬、持病、妊娠、複数製品の組み合わせなど個別の条件によって変わります。',
    sections: [{ title: '複数製品を組み合わせる前に', body: '個別成分の警告だけでなく、鎮静、血圧、血糖、凝固、重複成分、薬との相互作用など累積するリスクを確認します。', links: [{ href: '/safety-checker/', label: '英語の相互作用チェッカー' }, { href: '/info/supplement-safety-checklist/', label: '英語の安全性チェックリスト' }] }],
    primaryCta: { href: '/safety-checker/', label: '英語のチェッカーを開く' },
    secondaryCta: { href: '/ja/methodology/', label: '評価方法を見る' },
  },
} as const satisfies Record<string, LocalizedPageData>

export type JapanesePageKey = keyof typeof JAPANESE_PAGES
export const JAPANESE_ROUTE_KEYS: Record<string, JapanesePageKey> = {
  herbs: 'herbs', compounds: 'compounds', goals: 'goals', 'goals/sleep': 'sleep', 'goals/stress': 'stress', 'goals/anxiety': 'anxiety', 'goals/focus': 'focus', methodology: 'methodology', safety: 'safety',
}
export function buildJapanesePageMetadata(page: LocalizedPageData) {
  return buildLocalizedPageMetadata(page, { openGraphLocale: JAPANESE_OG_LOCALE, alternateOpenGraphLocales: [DEFAULT_OG_LOCALE] })
}

export const KOREAN_UI: LocalizedUiCopy = {
  translationNotice: '이 페이지는 한국어 편집 번역본입니다. 완전한 한국어 번역과 검토가 아직 끝나지 않은 상세 과학 프로필은 영어 콘텐츠임을 명확히 표시합니다.',
  nextStepLabel: '다음 단계',
  nextStepBody: '같은 기준으로 비교를 이어가세요. 근거를 먼저 보고, 안전성을 눈에 띄게 유지하며, 한계를 분명히 표시합니다.',
  educationDisclaimer: '교육 목적의 정보입니다. 약물을 복용 중이거나 임신 중이거나 기존 질환이 있는 경우를 포함해 개인별 의료 평가나 전문적인 의학 조언을 대신하지 않습니다.',
}

export const KOREAN_PAGES = {
  home: {
    path: '/ko/', eyebrow: 'The Hippie Scientist 한국어', title: '추측이 아니라 근거로 보충제를 조사하세요',
    description: '허브와 보충제를 사람 대상 연구, 기전, 연구된 용량, 안전성, 상호작용이라는 동일한 기준으로 한국어에서 비교합니다.',
    intro: '유행이나 마케팅 문구보다 사람에게서 확인된 근거부터 봅니다. 생물학적 기전과 임상 결과를 구분하고, 연구된 용량, 안전성, 상호작용, 불확실성을 함께 확인할 수 있게 구성합니다.',
    sections: [
      { title: '목표에서 시작하기', body: '성분 이름부터 고르기보다 먼저 무엇을 개선하거나 이해하려는지 정한 뒤 동일한 근거와 안전성 기준으로 선택지를 비교합니다.', links: [{ href: '/ko/goals/sleep/', label: '수면' }, { href: '/ko/goals/stress/', label: '스트레스' }, { href: '/ko/goals/anxiety/', label: '불안' }, { href: '/ko/goals/focus/', label: '집중' }] },
      { title: '연구 라이브러리 탐색', body: '핵심 안내 페이지는 한국어로 제공합니다. 상세 과학 프로필은 주장별 번역과 안전성 검토가 완료될 때까지 영어 페이지로 명확히 연결합니다.', links: [{ href: '/ko/herbs/', label: '허브' }, { href: '/ko/compounds/', label: '성분과 보충제' }, { href: '/ko/methodology/', label: '평가 방법' }, { href: '/ko/safety/', label: '안전성' }] },
    ],
    primaryCta: { href: '/ko/goals/', label: '목표 선택하기' }, secondaryCta: { href: '/', label: '영어 버전 보기' },
  },
  herbs: {
    path: '/ko/herbs/', eyebrow: '연구 라이브러리', title: '허브: 근거, 기전, 안전성',
    description: '허브를 한국어로 살펴보며 사람 대상 연구의 질, 연구된 용량, 안전성, 상호작용, 연구의 한계를 우선적으로 확인합니다.',
    intro: '인기나 전통적 사용만으로 효과가 입증되지는 않습니다. 사람에게서 관찰된 결과와 기전, 전통, 전임상 연구에서 나온 가설을 분리해서 설명합니다.',
    sections: [{ title: '라이브러리 읽는 법', body: '먼저 사람 대상 연구의 유형과 질을 확인한 뒤 용량, 상호작용, 금기, 불확실성을 살펴봅니다.', bullets: ['기전만 있는 설명보다 사람 대상 결과를 더 중요하게 봅니다.', '연구된 용량이 개인에게 권장되는 용량을 뜻하지는 않습니다.', '작거나 일관되지 않은 결과는 신중한 표현이 필요합니다.'] }, { title: '더 살펴볼 프로필', body: '상세 프로필은 완전한 한국어 검토가 끝날 때까지 영어로 제공됩니다.', links: [{ href: '/herbs/ashwagandha/', label: '아슈와간다' }, { href: '/herbs/rhodiola/', label: '로디올라' }, { href: '/herbs/valerian/', label: '발레리안' }] }],
    primaryCta: { href: '/ko/goals/', label: '목표별로 찾기' }, secondaryCta: { href: '/herbs/', label: '영어 전체 허브 라이브러리' },
  },
  compounds: {
    path: '/ko/compounds/', eyebrow: '연구 라이브러리', title: '성분과 보충제: 근거 비교하기',
    description: '성분과 보충제를 사람 대상 연구, 연구된 용량, 안전성, 상호작용, 근거의 질에 따라 한국어로 비교합니다.',
    intro: '좋은 비교는 임상적으로 관찰된 결과와 이론적으로 그럴듯한 기전을 구분합니다. 잠재적 이점만이 아니라 한계와 중요한 안전성 정보도 함께 보여줍니다.',
    sections: [{ title: '우선 확인하는 정보', body: '임상 연구, 결과의 일관성, 실제 연구된 용량, 안전성 신호를 우선합니다.', bullets: ['연구 설계와 질', '연구 간 결과의 일관성', '상호작용과 금기', '제형과 용량 차이'] }, { title: '조사의 출발점', body: '상세 프로필은 현재 영어로 제공됩니다.', links: [{ href: '/compounds/magnesium/', label: '마그네슘' }, { href: '/compounds/l-theanine/', label: 'L-테아닌' }, { href: '/compounds/melatonin/', label: '멜라토닌' }] }],
    primaryCta: { href: '/ko/goals/', label: '목표별로 비교하기' }, secondaryCta: { href: '/compounds/', label: '영어 전체 성분 라이브러리' },
  },
  goals: {
    path: '/ko/goals/', eyebrow: '결과에서 시작하기', title: '목표별로 보충제 살펴보기',
    description: '수면, 스트레스, 불안, 집중을 위해 가능한 선택지를 근거, 안전성, 연구된 용량, 실제 사용 맥락으로 비교합니다.',
    intro: '유행하는 성분에서 시작하기보다 정말 알고 싶은 결과를 먼저 정의합니다. 각 가이드는 개별 성분 프로필로 들어가기 전에 비교 기준과 안전성 질문을 정리합니다.',
    sections: [{ title: '주요 목표', body: '목표를 선택하고 근거의 질, 안전성, 질문과의 관련성을 같은 기준으로 확인합니다.', links: [{ href: '/ko/goals/sleep/', label: '수면' }, { href: '/ko/goals/stress/', label: '스트레스' }, { href: '/ko/goals/anxiety/', label: '불안' }, { href: '/ko/goals/focus/', label: '집중' }] }],
    primaryCta: { href: '/ko/safety/', label: '먼저 안전성 확인하기' }, secondaryCta: { href: '/goals/', label: '영어 전체 목표 가이드' },
  },
  sleep: {
    path: '/ko/goals/sleep/', eyebrow: '목표: 수면', title: '수면 보충제: 선택지를 비교하는 방법',
    description: '수면 보충제를 사람 대상 연구, 복용 시점, 다음 날 영향, 연구된 용량, 상호작용을 기준으로 비교합니다.',
    intro: '“더 잘 잔다”는 말은 더 빨리 잠들기, 밤중 각성 줄이기, 주관적 수면의 질 개선, 다음 날 졸림 줄이기처럼 서로 다른 의미를 가질 수 있습니다. 실제 문제에 따라 비교 기준도 달라집니다.',
    sections: [{ title: '결정을 바꾸는 질문', body: '주된 문제가 잠들기, 수면 유지, 다음 날 기능 중 무엇인지 먼저 구분합니다.', bullets: ['연구 대상이 내가 묻는 문제와 비슷한가요?', '진정 작용이나 중요한 상호작용이 있나요?', '제품의 제형과 용량이 연구 조건과 비슷한가요?'], links: [{ href: '/compounds/melatonin/', label: '멜라토닌' }, { href: '/compounds/magnesium/', label: '마그네슘' }, { href: '/herbs/valerian/', label: '발레리안' }] }],
    primaryCta: { href: '/ko/safety/', label: '안전성 확인하기' }, secondaryCta: { href: '/goals/sleep/', label: '영어 상세 가이드' },
  },
  stress: {
    path: '/ko/goals/stress/', eyebrow: '목표: 스트레스', title: '스트레스: 기전과 임상 근거를 구분해 비교하기',
    description: '스트레스 관련 보충제를 사람 대상 연구, 사용 기간, 내약성, 연구된 용량, 안전성, 상호작용으로 비교합니다.',
    intro: '“아답토젠” 같은 표현이나 코르티솔에 대한 설명만으로 임상 효과가 입증되지는 않습니다. 사람에게서 무엇을 측정했고 결과가 얼마나 일관적인지를 우선합니다.',
    sections: [{ title: '구분해서 볼 것', body: '주관적 효과와 바이오마커, 단기 사용과 장기 사용, 도움이 되는 진정과 원치 않는 졸림을 분리해 봅니다.', links: [{ href: '/herbs/ashwagandha/', label: '아슈와간다' }, { href: '/herbs/rhodiola/', label: '로디올라' }, { href: '/compounds/l-theanine/', label: 'L-테아닌' }] }],
    primaryCta: { href: '/ko/safety/', label: '안전성 확인하기' }, secondaryCta: { href: '/goals/stress/', label: '영어 상세 가이드' },
  },
  anxiety: {
    path: '/ko/goals/anxiety/', eyebrow: '목표: 불안', title: '불안: 빠른 약속보다 근거와 안전성을 먼저 보기',
    description: '불안에 대해 연구된 보충제를 근거의 질, 진정 작용, 연구된 용량, 상호작용, 불확실성을 기준으로 비교합니다.',
    intro: '불안 연구에서 작은 신호를 큰 약속으로 바꾸면 안 됩니다. 임상 근거와 이론적 기전을 구분하고, 주의사항과 상호작용을 항상 눈에 띄게 유지합니다.',
    sections: [{ title: '먼저 확인할 것', body: '연구의 질, 대상 집단, 효과 크기, 진정 작용, 약물이나 다른 중추신경 억제 물질과의 잠재적 상호작용을 확인합니다.', links: [{ href: '/compounds/l-theanine/', label: 'L-테아닌' }, { href: '/herbs/ashwagandha/', label: '아슈와간다' }, { href: '/herbs/valerian/', label: '발레리안' }] }],
    primaryCta: { href: '/ko/safety/', label: '안전성 확인하기' }, secondaryCta: { href: '/goals/anxiety/', label: '영어 상세 가이드' },
  },
  focus: {
    path: '/ko/goals/focus/', eyebrow: '목표: 집중', title: '집중: 효과, 자극성, 트레이드오프 비교하기',
    description: '집중과 주의 관련 보충제를 사람 대상 연구, 자극성, 수면 영향, 연구된 용량, 상호작용을 기준으로 비교합니다.',
    intro: '자극이 강하다고 집중력이 자동으로 좋아지는 것은 아닙니다. 주의력, 피로, 수면, 내약성, 실제 근거의 질을 함께 평가해야 합니다.',
    sections: [{ title: '유용한 질문', body: '연구가 객관적인 주의 과제를 측정했는지 주관적 느낌만 측정했는지 확인하고, 잠재적 이점이 수면이나 내약성 저하와 맞바뀌는지도 봅니다.', links: [{ href: '/compounds/caffeine/', label: '카페인' }, { href: '/compounds/l-theanine/', label: 'L-테아닌' }, { href: '/herbs/bacopa/', label: '바코파' }] }],
    primaryCta: { href: '/ko/safety/', label: '안전성 확인하기' }, secondaryCta: { href: '/goals/focus/', label: '영어 상세 가이드' },
  },
  methodology: {
    path: '/ko/methodology/', eyebrow: '평가 방법', title: '방법론: 근거를 어떻게 평가하는가',
    description: 'The Hippie Scientist가 사람 대상 연구, 기전, 안전성, 연구 한계를 어떻게 구분하고 평가하는지 한국어로 설명합니다.',
    intro: '목표는 모든 성분을 추천할 이유를 찾는 것이 아닙니다. 근거의 강도, 아직 풀리지 않은 질문, 중요한 위험을 가능한 한 정확하게 표현하는 것입니다.',
    sections: [{ title: '평가 기준', body: '사람의 결과에는 사람 대상 연구를 우선하고, 기전을 임상 증거처럼 취급하지 않으며, 결론보다 안전성을 먼저 확인하고, 데이터가 작거나 혼재되거나 간접적이면 확신도를 낮춥니다.', bullets: ['기전만 있는 설명보다 사람 대상 연구를 우선합니다.', '실용적 결론보다 안전성과 상호작용을 먼저 확인합니다.', '가짜 정밀함 대신 불확실성을 명시합니다.'] }],
    primaryCta: { href: '/info/methodology/', label: '영어 전체 방법론' }, secondaryCta: { href: '/ko/safety/', label: '안전성 접근법' },
  },
  safety: {
    path: '/ko/safety/', eyebrow: '안전성 우선', title: '보충제 안전성과 상호작용',
    description: '허브나 보충제를 함께 사용하기 전에 상호작용, 금기, 진정, 누적 효과, 연구된 용량의 맥락을 확인합니다.',
    intro: '“천연”이라는 말이 “영향이 없다”는 뜻은 아닙니다. 안전성은 용량, 약물, 기존 질환, 임신, 여러 제품의 조합 등 개인별 조건에 따라 달라집니다.',
    sections: [{ title: '여러 제품을 함께 쓰기 전에', body: '각 성분의 개별 경고뿐 아니라 진정, 혈압, 혈당, 응고, 중복 성분, 약물 상호작용처럼 누적될 수 있는 위험을 확인합니다.', links: [{ href: '/safety-checker/', label: '영어 상호작용 검사기' }, { href: '/info/supplement-safety-checklist/', label: '영어 안전성 체크리스트' }] }],
    primaryCta: { href: '/safety-checker/', label: '영어 검사기 열기' }, secondaryCta: { href: '/ko/methodology/', label: '평가 방법 보기' },
  },
} as const satisfies Record<string, LocalizedPageData>

export type KoreanPageKey = keyof typeof KOREAN_PAGES
export const KOREAN_ROUTE_KEYS: Record<string, KoreanPageKey> = {
  herbs: 'herbs', compounds: 'compounds', goals: 'goals', 'goals/sleep': 'sleep', 'goals/stress': 'stress', 'goals/anxiety': 'anxiety', 'goals/focus': 'focus', methodology: 'methodology', safety: 'safety',
}
export function buildKoreanPageMetadata(page: LocalizedPageData) {
  return buildLocalizedPageMetadata(page, { openGraphLocale: KOREAN_OG_LOCALE, alternateOpenGraphLocales: [DEFAULT_OG_LOCALE] })
}
