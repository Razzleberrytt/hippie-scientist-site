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
  hi: { toLight: 'लाइट मोड पर जाएँ', toDark: 'डार्क मोड पर जाएँ', systemSuffix: ' (सिस्टम सेटिंग का अनुसरण)', light: 'लाइट', dark: 'डार्क' },
  id: { toLight: 'Beralih ke mode terang', toDark: 'Beralih ke mode gelap', systemSuffix: ' (mengikuti sistem)', light: 'Terang', dark: 'Gelap' },
  'zh-CN': { toLight: '切换到浅色模式', toDark: '切换到深色模式', systemSuffix: '（跟随系统设置）', light: '浅色', dark: '深色' },
  tr: { toLight: 'Açık moda geç', toDark: 'Koyu moda geç', systemSuffix: ' (sistem ayarını izliyor)', light: 'Açık', dark: 'Koyu' },
  ar: { toLight: 'التبديل إلى الوضع الفاتح', toDark: 'التبديل إلى الوضع الداكن', systemSuffix: ' (يتبع إعدادات النظام حاليًا)', light: 'فاتح', dark: 'داكن' },
  ru: { toLight: 'Переключить на светлую тему', toDark: 'Переключить на тёмную тему', systemSuffix: ' (сейчас используется настройка системы)', light: 'Светлая', dark: 'Тёмная' },
  vi: { toLight: 'Chuyển sang chế độ sáng', toDark: 'Chuyển sang chế độ tối', systemSuffix: ' (hiện đang theo cài đặt hệ thống)', light: 'Sáng', dark: 'Tối' },
  th: { toLight: 'เปลี่ยนเป็นโหมดสว่าง', toDark: 'เปลี่ยนเป็นโหมดมืด', systemSuffix: ' (กำลังใช้การตั้งค่าระบบ)', light: 'สว่าง', dark: 'มืด' },
  sv: { toLight: 'Byt till ljust läge', toDark: 'Byt till mörkt läge', systemSuffix: ' (följer systemets inställning)', light: 'Ljust', dark: 'Mörkt' },
}
