export const PROFILE_TRANSLATION_REVISIONS: Readonly<Record<string, string>> = {
  '/es/hierbas/ashwagandha/': 'a3684892368b11cfc8d9200bf7689d775d1942b0d9896b6c5d765a3a9a1ad49d',
  '/pt/ervas/ashwagandha/': 'a3684892368b11cfc8d9200bf7689d775d1942b0d9896b6c5d765a3a9a1ad49d',
  '/fr/plantes/ashwagandha/': 'a3684892368b11cfc8d9200bf7689d775d1942b0d9896b6c5d765a3a9a1ad49d',
  '/de/kraeuter/ashwagandha/': 'a3684892368b11cfc8d9200bf7689d775d1942b0d9896b6c5d765a3a9a1ad49d',
  '/es/compuestos/l-theanine/': 'd427a2ff74262a5f735d4670705513af90371f684d838fb8d067cefe336c341e',
  '/pt/compostos/l-theanine/': 'd427a2ff74262a5f735d4670705513af90371f684d838fb8d067cefe336c341e',
  '/fr/composes/l-theanine/': 'd427a2ff74262a5f735d4670705513af90371f684d838fb8d067cefe336c341e',
  '/de/wirkstoffe/l-theanine/': 'd427a2ff74262a5f735d4670705513af90371f684d838fb8d067cefe336c341e',
}

export function getProfileTranslationRevision(path: string): string | null {
  return PROFILE_TRANSLATION_REVISIONS[path] ?? null
}
