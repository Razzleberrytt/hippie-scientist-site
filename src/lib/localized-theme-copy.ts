import type { SupportedLocale } from './international-seo'

export type DarkModeCopy = {
  toLight: string
  toDark: string
  systemSuffix: string
  light: string
  dark: string
}

export const DARK_MODE_COPY: Record<SupportedLocale, DarkModeCopy> = {
  'en-US': { toLight: 'Switch to light mode', toDark: 'Switch to dark mode', systemSuffix: ' (currently following system)', light: 'Light', dark: 'Dark' },
  es: { toLight: 'Cambiar al modo claro', toDark: 'Cambiar al modo oscuro', systemSuffix: ' (siguiendo el sistema)', light: 'Claro', dark: 'Oscuro' },
  'pt-BR': { toLight: 'Mudar para o modo claro', toDark: 'Mudar para o modo escuro', systemSuffix: ' (seguindo o sistema)', light: 'Claro', dark: 'Escuro' },
  fr: { toLight: 'Passer au mode clair', toDark: 'Passer au mode sombre', systemSuffix: ' (selon le système)', light: 'Clair', dark: 'Sombre' },
  de: { toLight: 'Zum hellen Modus wechseln', toDark: 'Zum dunklen Modus wechseln', systemSuffix: ' (folgt derzeit dem System)', light: 'Hell', dark: 'Dunkel' },
  it: { toLight: 'Passa alla modalità chiara', toDark: 'Passa alla modalità scura', systemSuffix: ' (segue il sistema)', light: 'Chiaro', dark: 'Scuro' },
  nl: { toLight: 'Schakel naar lichte modus', toDark: 'Schakel naar donkere modus', systemSuffix: ' (volgt het systeem)', light: 'Licht', dark: 'Donker' },
  pl: { toLight: 'Przełącz na tryb jasny', toDark: 'Przełącz na tryb ciemny', systemSuffix: ' (zgodnie z ustawieniem systemu)', light: 'Jasny', dark: 'Ciemny' },
  ja: { toLight: 'ライトモードに切り替える', toDark: 'ダークモードに切り替える', systemSuffix: '（システム設定に従っています）', light: 'ライト', dark: 'ダーク' },
  ko: { toLight: '라이트 모드로 전환', toDark: '다크 모드로 전환', systemSuffix: ' (시스템 설정을 따르는 중)', light: '라이트', dark: '다크' },
}
