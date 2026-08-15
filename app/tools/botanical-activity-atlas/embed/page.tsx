import type { Metadata } from 'next'
import BotanicalAtlasEmbed from '@/components/atlas/BotanicalAtlasEmbed'
import { getBotanicalAtlasRecords } from '@/lib/botanical-atlas-data'

export const metadata: Metadata = {
  title: 'Botanical Activity Atlas Embed | The Hippie Scientist',
  robots: { index: false, follow: true },
}

export default async function BotanicalAtlasEmbedPage() {
  const records = await getBotanicalAtlasRecords()
  return <BotanicalAtlasEmbed records={records} />
}
