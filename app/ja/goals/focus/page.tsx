import type { Metadata } from 'next'
import JapanesePageShell from '../../_components/JapanesePageShell'
import { SITE_URL } from '@/src/lib/seo'

export const metadata: Metadata = {
  title: '集中とサプリメント | The Hippie Scientist 日本語版',
  description:
    '集中、メンタルエネルギー、注意、安全性を証拠に基づいた言葉で整理する日本語の入口ページです。',
  alternates: { canonical: `${SITE_URL}/ja/goals/focus/` },
  robots: { index: true, follow: true },
  openGraph: {
    title: '集中とサプリメント | The Hippie Scientist 日本語版',
    description: '集中、メンタルエネルギー、証拠の限界を慎重に整理する日本語ページです。',
    url: `${SITE_URL}/ja/goals/focus/`,
    siteName: 'The Hippie Scientist',
    locale: 'ja_JP',
    type: 'article',
  },
}

export default function JapaneseFocusPage() {
  return (
    <JapanesePageShell
      eyebrow='目標：集中'
      title='集中：エネルギー、明晰さ、刺激を分けて考える。'
      description='集中力を高めることは、必ずしも強いものを使うことではありません。睡眠、カフェイン、ストレス、習慣、安全性、証拠の質を整理してから比較します。'
      primaryHref='/goals/focus/'
      primaryLabel='英語の完全ガイドを見る'
      secondaryHref='/ja/'
      secondaryLabel='日本語ホームに戻る'
      cards={[
        {
          title: 'エネルギーは集中そのものではない',
          body: 'ある製品で目が覚めたように感じても、整理力、記憶、深い作業が改善するとは限りません。目的を分けて考えます。',
        },
        {
          title: '刺激物には注意する',
          body: 'カフェイン、刺激物、薬、その他の製品は重なることがあります。安全性は個人の文脈によって変わります。',
        },
        {
          title: '証拠で比較する',
          body: '良いページは、何が、誰に、どのくらいの期間研究され、どの程度の効果が見られたかを説明します。',
        },
      ]}
      note='英語の完全ページにはより多くの内部リンクがあります。日本語ライブラリは段階的に準備します。'
    />
  )
}
