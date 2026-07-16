import type { Metadata } from 'next'
import JapanesePageShell from './_components/JapanesePageShell'
import { SITE_URL } from '@/src/lib/seo'

export const metadata: Metadata = {
  title: 'The Hippie Scientist 日本語版 | サプリメント研究',
  description:
    'The Hippie Scientist の日本語ホーム：睡眠、ストレス、不安、集中に関わるサプリメント、ハーブ、化合物の研究をわかりやすく整理します。',
  alternates: { canonical: `${SITE_URL}/ja/` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'The Hippie Scientist 日本語版',
    description: 'サプリメント、ハーブ、化合物の研究を整理する日本語の主要ページです。',
    url: `${SITE_URL}/ja/`,
    siteName: 'The Hippie Scientist',
    locale: 'ja_JP',
    type: 'website',
  },
}

export default function JapaneseHomePage() {
  return (
    <JapanesePageShell
      eyebrow='The Hippie Scientist 日本語版'
      title='サプリメント研究を、証拠と慎重さで読み解く。'
      description='まずは目的から始めましょう。睡眠、ストレス、不安、集中の入口ページを日本語で整理し、詳しい英語ライブラリへつなげます。'
      primaryHref='/ja/goals/sleep/'
      primaryLabel='睡眠から始める'
      secondaryHref='/goals/'
      secondaryLabel='英語の目標ページを見る'
      cards={[
        {
          title: '睡眠',
          body: '休息、生活リズム、安全性、証拠の質を整理するための入口です。',
          href: '/ja/goals/sleep/',
          label: '日本語の睡眠ページを見る',
        },
        {
          title: 'ストレスと不安',
          body: '落ち着き、緊張、心配、安全性を分けて考えるための入門ページです。',
          href: '/ja/goals/stress/',
          label: '日本語のストレスページを見る',
        },
        {
          title: '集中',
          body: 'メンタルエネルギー、注意、習慣、証拠の限界を整理します。',
          href: '/ja/goals/focus/',
          label: '日本語の集中ページを見る',
        },
      ]}
      note='ハーブと化合物の完全なライブラリは、翻訳体制を整えながら段階的に日本語化していきます。'
    />
  )
}
