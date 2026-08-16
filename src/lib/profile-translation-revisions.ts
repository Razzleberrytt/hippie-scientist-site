export const PROFILE_TRANSLATION_REVISIONS: Readonly<Record<string, string>> = {
  '/es/hierbas/ashwagandha/': 'a3684892368b11cfc8d9200bf7689d775d1942b0d9896b6c5d765a3a9a1ad49d',
  '/pt/ervas/ashwagandha/': 'a3684892368b11cfc8d9200bf7689d775d1942b0d9896b6c5d765a3a9a1ad49d',
  '/fr/plantes/ashwagandha/': 'a3684892368b11cfc8d9200bf7689d775d1942b0d9896b6c5d765a3a9a1ad49d',
  '/de/kraeuter/ashwagandha/': 'a3684892368b11cfc8d9200bf7689d775d1942b0d9896b6c5d765a3a9a1ad49d',
}

export function getProfileTranslationRevision(path: string): string | null {
  return PROFILE_TRANSLATION_REVISIONS[path] ?? null
}
