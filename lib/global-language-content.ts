import type { LocalizedPageData, LocalizedUiCopy } from './localization'
import { buildLocalizedPageMetadata } from './localization'
import { ARABIC_OG_LOCALE, RUSSIAN_OG_LOCALE, VIETNAMESE_OG_LOCALE, THAI_OG_LOCALE, SWEDISH_OG_LOCALE } from './international-seo'

type LocaleKey = 'ar' | 'ru' | 'vi' | 'th' | 'sv'
type LocalePack = { prefix: string; language: string; og: string; name: string; english: string; ui: LocalizedUiCopy }

type Copy = Record<'home' | 'herbs' | 'compounds' | 'goals' | 'sleep' | 'stress' | 'anxiety' | 'focus' | 'methodology' | 'safety', readonly [string, string]>

const packs: Record<LocaleKey, LocalePack> = {
  ar: { prefix: '/ar', language: 'ar', og: ARABIC_OG_LOCALE, name: 'العربية', english: 'English', ui: { translationNotice: 'هذه ترجمة تحريرية للمحتوى. قد تُعرض الملفات العلمية التفصيلية التي لم تُراجع بالكامل بالعربية على أنها محتوى باللغة الإنجليزية.', nextStepLabel: 'الخطوة التالية', nextStepBody: 'قارن باستخدام المعيار نفسه: ابدأ بالأدلة، اعرض السلامة بوضوح، ولا تُخفِ عدم اليقين.', educationDisclaimer: 'هذه المعلومات لأغراض تعليمية فقط ولا تحل محل التقييم الطبي الشخصي أو المشورة المهنية.' } },
  ru: { prefix: '/ru', language: 'ru', og: RUSSIAN_OG_LOCALE, name: 'Русский', english: 'English', ui: { translationNotice: 'Это редакционный перевод материала. Подробные научные профили, которые ещё не прошли полную проверку на русском языке, явно помечаются как англоязычный контент.', nextStepLabel: 'Следующий шаг', nextStepBody: 'Сравнивайте по одному стандарту: сначала смотрите на доказательства, ясно показывайте безопасность и не скрывайте неопределённость.', educationDisclaimer: 'Эта информация предназначена только для обучения и не заменяет индивидуальную медицинскую оценку или профессиональную консультацию.' } },
  vi: { prefix: '/vi', language: 'vi', og: VIETNAMESE_OG_LOCALE, name: 'Tiếng Việt', english: 'English', ui: { translationNotice: 'Đây là bản dịch biên tập của nội dung. Các hồ sơ khoa học chi tiết chưa được rà soát đầy đủ bằng tiếng Việt sẽ được ghi rõ là nội dung tiếng Anh.', nextStepLabel: 'Bước tiếp theo', nextStepBody: 'Tiếp tục so sánh theo cùng tiêu chuẩn: xem bằng chứng trước, thể hiện an toàn rõ ràng và không che giấu sự không chắc chắn.', educationDisclaimer: 'Thông tin này chỉ nhằm mục đích giáo dục và không thay thế đánh giá y tế cá nhân hoặc lời khuyên chuyên môn.' } },
  th: { prefix: '/th', language: 'th', og: THAI_OG_LOCALE, name: 'ไทย', english: 'English', ui: { translationNotice: 'นี่คือคำแปลเชิงบรรณาธิการของเนื้อหา โปรไฟล์ทางวิทยาศาสตร์โดยละเอียดที่ยังไม่ได้ตรวจสอบภาษาไทยอย่างครบถ้วนจะระบุอย่างชัดเจนว่าเป็นเนื้อหาภาษาอังกฤษ', nextStepLabel: 'ขั้นตอนถัดไป', nextStepBody: 'เปรียบเทียบโดยใช้มาตรฐานเดียวกัน: ดูหลักฐานก่อน แสดงข้อมูลด้านความปลอดภัยอย่างชัดเจน และอย่าซ่อนความไม่แน่นอน', educationDisclaimer: 'ข้อมูลนี้มีไว้เพื่อการศึกษาเท่านั้น และไม่แทนที่การประเมินทางการแพทย์ส่วนบุคคลหรือคำแนะนำจากผู้เชี่ยวชาญ' } },
  sv: { prefix: '/sv', language: 'sv', og: SWEDISH_OG_LOCALE, name: 'Svenska', english: 'English', ui: { translationNotice: 'Detta är en redaktionell översättning av innehållet. Detaljerade vetenskapliga profiler som ännu inte har granskats helt på svenska markeras tydligt som engelskt innehåll.', nextStepLabel: 'Nästa steg', nextStepBody: 'Fortsätt jämföra enligt samma standard: börja med evidensen, visa säkerheten tydligt och dölj inte osäkerheten.', educationDisclaimer: 'Den här informationen är endast avsedd för utbildning och ersätter inte en individuell medicinsk bedömning eller professionell rådgivning.' } },
}

const copy: Record<LocaleKey, Copy> = {
  ar: {
    home: ['افهم المكملات بالأدلة لا بالتخمين', 'قارن الأعشاب والمكملات وفق الدراسات البشرية والآليات والجرعات المدروسة والسلامة والتداخلات.'],
    herbs: ['الأعشاب: الأدلة والآليات والسلامة', 'ابدأ بجودة الدراسات البشرية والجرعات المدروسة والسلامة والتداخلات عند تقييم الأعشاب.'],
    compounds: ['المركبات والمكملات: قارن الأدلة', 'قارن وفق الدراسات البشرية والجرعات المدروسة والسلامة والتداخلات وجودة الأدلة.'],
    goals: ['ابدأ من هدفك', 'استخدم معايير متسقة للأدلة والسلامة عند استكشاف النوم والتوتر والقلق والتركيز.'],
    sleep: ['استكشف الأدلة المتعلقة بالنوم', 'عند مقارنة خيارات النوم، انظر إلى النتائج البشرية والجرعة والسلامة وعدم اليقين.'],
    stress: ['استكشف الأدلة المتعلقة بالتوتر', 'قيّم خيارات التوتر وفق الدراسات البشرية وإشارات السلامة.'],
    anxiety: ['استكشف الأدلة المتعلقة بالقلق', 'انظر إلى جودة الأدلة والسلامة وحدود الدراسات عند تقييم خيارات القلق.'],
    focus: ['استكشف الأدلة المتعلقة بالتركيز', 'قارن خيارات التركيز وفق النتائج البشرية وظروف الدراسة الفعلية.'],
    methodology: ['كيف نقيم الأدلة', 'نوازن بين الدراسات البشرية واتساق النتائج والجرعات المدروسة والسلامة وحدود البحث.'],
    safety: ['السلامة أولاً', 'تعامل مع التداخلات وموانع الاستخدام وعدم اليقين بجدية تساوي الفوائد المحتملة.'],
  },
  ru: {
    home: ['Изучайте добавки по доказательствам, а не по догадкам', 'Сравнивайте травы и добавки по исследованиям на людях, механизмам, изученным дозам, безопасности и взаимодействиям.'],
    herbs: ['Травы: доказательства, механизмы и безопасность', 'При оценке трав учитывайте качество исследований на людях, изученные дозы, безопасность и взаимодействия.'],
    compounds: ['Соединения и добавки: сравнивайте доказательства', 'Сравнивайте их по исследованиям на людях, изученным дозам, безопасности, взаимодействиям и качеству доказательств.'],
    goals: ['Начните с вашей цели', 'Используйте единые стандарты доказательности и безопасности для сна, стресса, тревоги и концентрации.'],
    sleep: ['Изучайте данные о сне', 'При сравнении вариантов для сна учитывайте результаты на людях, дозу, безопасность и неопределённость.'],
    stress: ['Изучайте данные о стрессе', 'Оценивайте варианты для стресса по исследованиям на людях и сигналам безопасности.'],
    anxiety: ['Изучайте данные о тревоге', 'Оценивайте варианты с учётом качества доказательств, безопасности и ограничений исследований.'],
    focus: ['Изучайте данные о концентрации', 'Сравнивайте варианты для концентрации по результатам на людях и реальным условиям исследований.'],
    methodology: ['Как мы оцениваем доказательства', 'Учитываем исследования на людях, согласованность результатов, изученные дозы, безопасность и ограничения.'],
    safety: ['Безопасность прежде всего', 'Учитывайте взаимодействия, противопоказания и неопределённость так же серьёзно, как потенциальную пользу.'],
  },
  vi: {
    home: ['Tìm hiểu về thực phẩm bổ sung bằng bằng chứng', 'So sánh thảo dược và thực phẩm bổ sung dựa trên nghiên cứu ở người, cơ chế, liều đã được nghiên cứu, độ an toàn và tương tác.'],
    herbs: ['Thảo dược: bằng chứng, cơ chế và an toàn', 'Ưu tiên chất lượng nghiên cứu ở người, liều đã nghiên cứu, an toàn và tương tác khi đánh giá thảo dược.'],
    compounds: ['Hợp chất và thực phẩm bổ sung: so sánh bằng chứng', 'So sánh dựa trên nghiên cứu ở người, liều đã nghiên cứu, an toàn, tương tác và chất lượng bằng chứng.'],
    goals: ['Bắt đầu từ mục tiêu của bạn', 'Dùng cùng tiêu chuẩn về bằng chứng và an toàn khi tìm hiểu giấc ngủ, căng thẳng, lo âu và tập trung.'],
    sleep: ['Xem bằng chứng về giấc ngủ', 'Khi so sánh các lựa chọn cho giấc ngủ, hãy xem kết quả ở người, liều dùng, an toàn và mức độ không chắc chắn.'],
    stress: ['Xem bằng chứng về căng thẳng', 'Đánh giá các lựa chọn theo nghiên cứu ở người và tín hiệu an toàn.'],
    anxiety: ['Xem bằng chứng về lo âu', 'Đánh giá lựa chọn dựa trên chất lượng bằng chứng, an toàn và giới hạn của nghiên cứu.'],
    focus: ['Xem bằng chứng về tập trung', 'So sánh các lựa chọn dựa trên kết quả ở người và điều kiện nghiên cứu thực tế.'],
    methodology: ['Cách chúng tôi đánh giá bằng chứng', 'Xem xét nghiên cứu ở người, tính nhất quán của kết quả, liều đã nghiên cứu, an toàn và giới hạn nghiên cứu.'],
    safety: ['An toàn là ưu tiên', 'Coi trọng tương tác, chống chỉ định và sự không chắc chắn ngang với lợi ích tiềm năng.'],
  },
  th: {
    home: ['ทำความเข้าใจอาหารเสริมด้วยหลักฐาน ไม่ใช่การคาดเดา', 'เปรียบเทียบสมุนไพรและอาหารเสริมจากงานวิจัยในมนุษย์ กลไก ขนาดที่มีการศึกษา ความปลอดภัย และปฏิกิริยาระหว่างกัน'],
    herbs: ['สมุนไพร: หลักฐาน กลไก และความปลอดภัย', 'ให้ความสำคัญกับคุณภาพงานวิจัยในมนุษย์ ขนาดที่ศึกษา ความปลอดภัย และปฏิกิริยาระหว่างยาเมื่อประเมินสมุนไพร'],
    compounds: ['สารประกอบและอาหารเสริม: เปรียบเทียบหลักฐาน', 'เปรียบเทียบจากงานวิจัยในมนุษย์ ขนาดที่ศึกษา ความปลอดภัย ปฏิกิริยาระหว่างกัน และคุณภาพของหลักฐาน'],
    goals: ['เริ่มจากเป้าหมายของคุณ', 'ใช้มาตรฐานด้านหลักฐานและความปลอดภัยเดียวกันสำหรับการนอนหลับ ความเครียด ความกังวล และสมาธิ'],
    sleep: ['ดูหลักฐานเกี่ยวกับการนอนหลับ', 'เมื่อเปรียบเทียบตัวเลือกด้านการนอน ให้ดูผลลัพธ์ในมนุษย์ ขนาด ความปลอดภัย และความไม่แน่นอน'],
    stress: ['ดูหลักฐานเกี่ยวกับความเครียด', 'ประเมินตัวเลือกด้านความเครียดจากงานวิจัยในมนุษย์และสัญญาณด้านความปลอดภัย'],
    anxiety: ['ดูหลักฐานเกี่ยวกับความกังวล', 'พิจารณาคุณภาพหลักฐาน ความปลอดภัย และข้อจำกัดของงานวิจัยร่วมกัน'],
    focus: ['ดูหลักฐานเกี่ยวกับสมาธิ', 'เปรียบเทียบตัวเลือกด้านสมาธิจากผลลัพธ์ในมนุษย์และเงื่อนไขที่มีการศึกษา'],
    methodology: ['เราประเมินหลักฐานอย่างไร', 'พิจารณางานวิจัยในมนุษย์ ความสอดคล้องของผลลัพธ์ ขนาดที่ศึกษา ความปลอดภัย และข้อจำกัดของงานวิจัยร่วมกัน'],
    safety: ['ความปลอดภัยต้องมาก่อน', 'ให้ความสำคัญกับปฏิกิริยาระหว่างกัน ข้อห้ามใช้ และความไม่แน่นอนไม่ต่างจากประโยชน์ที่อาจเกิดขึ้น'],
  },
  sv: {
    home: ['Förstå kosttillskott genom evidens, inte gissningar', 'Jämför örter och kosttillskott utifrån humanstudier, mekanismer, studerade doser, säkerhet och interaktioner.'],
    herbs: ['Örter: evidens, mekanismer och säkerhet', 'Prioritera kvaliteten på humanstudier, studerade doser, säkerhet och interaktioner när du bedömer örter.'],
    compounds: ['Ämnen och kosttillskott: jämför evidensen', 'Jämför utifrån humanstudier, studerade doser, säkerhet, interaktioner och evidensens kvalitet.'],
    goals: ['Börja med ditt mål', 'Använd samma evidens- och säkerhetsstandarder när du undersöker sömn, stress, oro och fokus.'],
    sleep: ['Utforska evidens om sömn', 'När du jämför sömnalternativ, titta på resultat hos människor, dos, säkerhet och osäkerhet.'],
    stress: ['Utforska evidens om stress', 'Bedöm stressrelaterade alternativ utifrån humanstudier och säkerhetssignaler.'],
    anxiety: ['Utforska evidens om oro', 'Bedöm alternativ utifrån evidenskvalitet, säkerhet och forskningens begränsningar.'],
    focus: ['Utforska evidens om fokus', 'Jämför fokusrelaterade alternativ utifrån resultat hos människor och de faktiska studieförhållandena.'],
    methodology: ['Så bedömer vi evidens', 'Vi väger samman humanstudier, resultatens samstämmighet, studerade doser, säkerhet och forskningsbegränsningar.'],
    safety: ['Säkerheten först', 'Ta interaktioner, kontraindikationer och osäkerhet på lika stort allvar som möjliga fördelar.'],
  },
}

const routeParts: Record<LocaleKey, Record<string, string>> = {
  ar: { herbs: 'herbs', compounds: 'compounds', goals: 'ahdaf', sleep: 'ahdaf/nom', stress: 'ahdaf/daght', anxiety: 'ahdaf/qalaq', focus: 'ahdaf/tarkiz', methodology: 'manhaj', safety: 'salama' },
  ru: { herbs: 'travy', compounds: 'veshchestva', goals: 'celi', sleep: 'celi/son', stress: 'celi/stress', anxiety: 'celi/trevoga', focus: 'celi/fokus', methodology: 'metodologiya', safety: 'bezopasnost' },
  vi: { herbs: 'thao-duoc', compounds: 'hop-chat', goals: 'muc-tieu', sleep: 'muc-tieu/ngu', stress: 'muc-tieu/cang-thang', anxiety: 'muc-tieu/lo-au', focus: 'muc-tieu/tap-trung', methodology: 'phuong-phap', safety: 'an-toan' },
  th: { herbs: 'herbs', compounds: 'compounds', goals: 'goals', sleep: 'goals/sleep', stress: 'goals/stress', anxiety: 'goals/anxiety', focus: 'goals/focus', methodology: 'methodology', safety: 'safety' },
  sv: { herbs: 'orter', compounds: 'amnen', goals: 'mal', sleep: 'mal/somn', stress: 'mal/stress', anxiety: 'mal/oro', focus: 'mal/fokus', methodology: 'metodik', safety: 'sakerhet' },
}

function routeFor(locale: LocaleKey, key: string) { return `${packs[locale].prefix}/${routeParts[locale][key]}/` }

function buildPages(locale: LocaleKey) {
  const pack = packs[locale]
  const localeCopy = copy[locale]
  const make = (key: keyof Copy, path: string): LocalizedPageData => {
    const [title, description] = localeCopy[key]
    const links = key === 'goals' ? ['sleep', 'stress', 'anxiety', 'focus'].map((k) => ({ href: routeFor(locale, k), label: localeCopy[k as keyof Copy][0] })) : []
    return {
      path, eyebrow: `The Hippie Scientist ${pack.name}`, title, description, intro: description,
      sections: [{ title: locale === 'ar' ? 'كيفية قراءة هذه المعلومات' : locale === 'ru' ? 'Как читать эту информацию' : locale === 'vi' ? 'Cách đọc thông tin này' : locale === 'th' ? 'วิธีอ่านข้อมูลนี้' : 'Så läser du informationen', body: localeCopy.methodology[1], links }],
      primaryCta: { href: routeFor(locale, 'goals'), label: locale === 'ar' ? 'اختر هدفًا' : locale === 'ru' ? 'Выберите цель' : locale === 'vi' ? 'Chọn mục tiêu' : locale === 'th' ? 'เลือกเป้าหมาย' : 'Välj mål' },
      secondaryCta: { href: '/', label: pack.english },
    }
  }
  return { home: make('home', `${pack.prefix}/`), herbs: make('herbs', routeFor(locale, 'herbs')), compounds: make('compounds', routeFor(locale, 'compounds')), goals: make('goals', routeFor(locale, 'goals')), sleep: make('sleep', routeFor(locale, 'sleep')), stress: make('stress', routeFor(locale, 'stress')), anxiety: make('anxiety', routeFor(locale, 'anxiety')), focus: make('focus', routeFor(locale, 'focus')), methodology: make('methodology', routeFor(locale, 'methodology')), safety: make('safety', routeFor(locale, 'safety')) } satisfies Record<string, LocalizedPageData>
}

export const ARABIC_UI = packs.ar.ui
export const RUSSIAN_UI = packs.ru.ui
export const VIETNAMESE_UI = packs.vi.ui
export const THAI_UI = packs.th.ui
export const SWEDISH_UI = packs.sv.ui
export const ARABIC_PAGES = buildPages('ar')
export const RUSSIAN_PAGES = buildPages('ru')
export const VIETNAMESE_PAGES = buildPages('vi')
export const THAI_PAGES = buildPages('th')
export const SWEDISH_PAGES = buildPages('sv')

export const ARABIC_ROUTE_KEYS = { herbs: 'herbs', compounds: 'compounds', ahdaf: 'goals', 'ahdaf/nom': 'sleep', 'ahdaf/daght': 'stress', 'ahdaf/qalaq': 'anxiety', 'ahdaf/tarkiz': 'focus', manhaj: 'methodology', salama: 'safety' } as const
export const RUSSIAN_ROUTE_KEYS = { travy: 'herbs', veshchestva: 'compounds', celi: 'goals', 'celi/son': 'sleep', 'celi/stress': 'stress', 'celi/trevoga': 'anxiety', 'celi/fokus': 'focus', metodologiya: 'methodology', bezopasnost: 'safety' } as const
export const VIETNAMESE_ROUTE_KEYS = { 'thao-duoc': 'herbs', 'hop-chat': 'compounds', 'muc-tieu': 'goals', 'muc-tieu/ngu': 'sleep', 'muc-tieu/cang-thang': 'stress', 'muc-tieu/lo-au': 'anxiety', 'muc-tieu/tap-trung': 'focus', 'phuong-phap': 'methodology', 'an-toan': 'safety' } as const
export const THAI_ROUTE_KEYS = { herbs: 'herbs', compounds: 'compounds', goals: 'goals', 'goals/sleep': 'sleep', 'goals/stress': 'stress', 'goals/anxiety': 'anxiety', 'goals/focus': 'focus', methodology: 'methodology', safety: 'safety' } as const
export const SWEDISH_ROUTE_KEYS = { orter: 'herbs', amnen: 'compounds', mal: 'goals', 'mal/somn': 'sleep', 'mal/stress': 'stress', 'mal/oro': 'anxiety', 'mal/fokus': 'focus', metodik: 'methodology', sakerhet: 'safety' } as const

export function buildArabicPageMetadata(page: LocalizedPageData) { return buildLocalizedPageMetadata(page, { openGraphLocale: ARABIC_OG_LOCALE }) }
export function buildRussianPageMetadata(page: LocalizedPageData) { return buildLocalizedPageMetadata(page, { openGraphLocale: RUSSIAN_OG_LOCALE }) }
export function buildVietnamesePageMetadata(page: LocalizedPageData) { return buildLocalizedPageMetadata(page, { openGraphLocale: VIETNAMESE_OG_LOCALE }) }
export function buildThaiPageMetadata(page: LocalizedPageData) { return buildLocalizedPageMetadata(page, { openGraphLocale: THAI_OG_LOCALE }) }
export function buildSwedishPageMetadata(page: LocalizedPageData) { return buildLocalizedPageMetadata(page, { openGraphLocale: SWEDISH_OG_LOCALE }) }
