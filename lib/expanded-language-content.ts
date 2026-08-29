import type { LocalizedPageData, LocalizedUiCopy } from './localization'
import { buildLocalizedPageMetadata } from './localization'
import {
  DEFAULT_OG_LOCALE,
  DUTCH_OG_LOCALE,
  ITALIAN_OG_LOCALE,
  POLISH_OG_LOCALE,
} from './international-seo'

export const ITALIAN_UI: LocalizedUiCopy = {
  translationNotice:
    'Questa è una traduzione editoriale in italiano. I profili scientifici che non dispongono ancora di una traduzione completa restano chiaramente indicati come contenuti in inglese.',
  nextStepLabel: 'Passo successivo',
  nextStepBody:
    'Continua a confrontare con lo stesso criterio: prima le prove, sicurezza visibile e limiti dichiarati con chiarezza.',
  educationDisclaimer:
    'Contenuto educativo. Non sostituisce una valutazione individuale di un professionista sanitario, soprattutto in caso di farmaci, gravidanza o condizioni mediche.',
}

export const ITALIAN_PAGES = {
  home: {
    path: '/it/', eyebrow: 'The Hippie Scientist in italiano',
    title: 'Ricerca gli integratori senza affidarti alle supposizioni',
    description: 'Confronta erbe e integratori in italiano usando prove sull’uomo, meccanismi, dosi, sicurezza e interazioni.',
    intro: 'Confronta erbe e integratori partendo dalle prove sull’uomo, mantenendo distinti meccanismi, dosi studiate, sicurezza e limiti della ricerca. Inizia dall’obiettivo, non dal marketing.',
    sections: [
      { title: 'Inizia da un obiettivo', body: 'Definisci prima il risultato che vuoi capire, poi confronta le opzioni con lo stesso standard di evidenza e sicurezza.', links: [
        { href: '/it/obiettivi/sonno/', label: 'Sonno' }, { href: '/it/obiettivi/stress/', label: 'Stress' }, { href: '/it/obiettivi/ansia/', label: 'Ansia' }, { href: '/it/obiettivi/concentrazione/', label: 'Concentrazione' },
      ] },
      { title: 'Esplora la biblioteca', body: 'Le pagine introduttive sono tradotte; i profili scientifici dettagliati restano in inglese finché una traduzione completa non supera la revisione editoriale.', links: [
        { href: '/it/erbe/', label: 'Erbe' }, { href: '/it/composti/', label: 'Composti e integratori' }, { href: '/it/metodologia/', label: 'Metodologia' }, { href: '/it/sicurezza/', label: 'Sicurezza' },
      ] },
    ],
    primaryCta: { href: '/it/obiettivi/', label: 'Scegli un obiettivo' }, secondaryCta: { href: '/', label: 'English version' },
  },
  herbs: {
    path: '/it/erbe/', eyebrow: 'Biblioteca di ricerca', title: 'Erbe: prove, meccanismi e sicurezza',
    description: 'Esplora le erbe in italiano dando priorità agli studi sull’uomo, alla sicurezza, alle interazioni e al contesto della dose.',
    intro: 'La popolarità di un’erba non è una prova di efficacia. Separiamo i risultati osservati nelle persone dalle ipotesi basate su meccanismi, tradizione o ricerca preclinica.',
    sections: [
      { title: 'Come leggere la biblioteca', body: 'Valuta prima il tipo e la qualità degli studi sull’uomo, poi controlla dose, interazioni, controindicazioni e incertezza.', bullets: ['Gli studi sull’uomo pesano più dei soli meccanismi.', 'Una dose studiata non è automaticamente una raccomandazione personale.', 'Risultati piccoli o incoerenti richiedono un linguaggio prudente.'] },
      { title: 'Profili da approfondire', body: 'I profili completi restano in inglese durante questa fase di localizzazione.', links: [{ href: '/herbs/ashwagandha/', label: 'Ashwagandha' }, { href: '/herbs/rhodiola/', label: 'Rhodiola' }, { href: '/herbs/valerian/', label: 'Valeriana' }] },
    ], primaryCta: { href: '/it/obiettivi/', label: 'Cerca per obiettivo' }, secondaryCta: { href: '/herbs/', label: 'Biblioteca completa in inglese' },
  },
  compounds: {
    path: '/it/composti/', eyebrow: 'Biblioteca di ricerca', title: 'Composti e integratori: confronta le prove',
    description: 'Esplora composti e integratori in italiano considerando studi sull’uomo, dosi, sicurezza, interazioni e qualità delle prove.',
    intro: 'Una buona comparazione distingue ciò che è stato osservato clinicamente da ciò che è soltanto plausibile in teoria. Manteniamo visibili sia i possibili benefici sia i rischi.',
    sections: [
      { title: 'Cosa conta di più', body: 'Diamo priorità a studi clinici, coerenza dei risultati, dosi realmente studiate e segnali di sicurezza.', bullets: ['Tipo e qualità degli studi.', 'Coerenza tra studi e revisioni.', 'Interazioni e controindicazioni.', 'Differenze tra formulazioni e dosi.'] },
      { title: 'Punti di partenza', body: 'I profili dettagliati sono ancora in inglese.', links: [{ href: '/compounds/magnesium/', label: 'Magnesio' }, { href: '/compounds/l-theanine/', label: 'L-teanina' }, { href: '/compounds/melatonin/', label: 'Melatonina' }] },
    ], primaryCta: { href: '/it/obiettivi/', label: 'Confronta per obiettivo' }, secondaryCta: { href: '/compounds/', label: 'Biblioteca completa in inglese' },
  },
  goals: {
    path: '/it/obiettivi/', eyebrow: 'Parti dal risultato', title: 'Esplora gli integratori per obiettivo',
    description: 'Confronta opzioni per sonno, stress, ansia e concentrazione usando prove, sicurezza, dosi e contesto pratico.',
    intro: 'Invece di iniziare dall’ingrediente di moda, definisci il risultato che ti interessa. Ogni guida restringe le opzioni prima di passare ai singoli profili.',
    sections: [{ title: 'Obiettivi principali', body: 'Scegli un percorso e usa le stesse domande di qualità, sicurezza e pertinenza.', links: [{ href: '/it/obiettivi/sonno/', label: 'Sonno' }, { href: '/it/obiettivi/stress/', label: 'Stress' }, { href: '/it/obiettivi/ansia/', label: 'Ansia' }, { href: '/it/obiettivi/concentrazione/', label: 'Concentrazione' }] }],
    primaryCta: { href: '/it/sicurezza/', label: 'Controlla prima la sicurezza' }, secondaryCta: { href: '/goals/', label: 'Tutti gli obiettivi in inglese' },
  },
  sleep: {
    path: '/it/obiettivi/sonno/', eyebrow: 'Obiettivo: sonno', title: 'Integratori per il sonno: come confrontare le opzioni',
    description: 'Confronta integratori per il sonno considerando prove sull’uomo, tempistica, effetti del giorno dopo, dosi e interazioni.',
    intro: '“Dormire meglio” può significare addormentarsi prima, svegliarsi meno, migliorare la qualità percepita o evitare sonnolenza il giorno dopo. La scelta cambia in base al problema reale.',
    sections: [{ title: 'Domande che cambiano la decisione', body: 'Chiarisci se il problema principale è l’addormentamento, il mantenimento del sonno o gli effetti del giorno successivo.', bullets: ['L’evidenza riguarda un problema simile al tuo?', 'Ci sono effetti sedativi o interazioni?', 'La dose e la formulazione coincidono con quelle studiate?'], links: [{ href: '/compounds/melatonin/', label: 'Melatonina' }, { href: '/compounds/magnesium/', label: 'Magnesio' }, { href: '/herbs/valerian/', label: 'Valeriana' }] }],
    primaryCta: { href: '/it/sicurezza/', label: 'Rivedi la sicurezza' }, secondaryCta: { href: '/goals/sleep/', label: 'Guida completa in inglese' },
  },
  stress: {
    path: '/it/obiettivi/stress/', eyebrow: 'Obiettivo: stress', title: 'Stress: confronta le opzioni senza confondere meccanismo e prova',
    description: 'Confronta integratori per lo stress in base a studi sull’uomo, durata d’uso, tollerabilità, dosi e interazioni.',
    intro: 'Parole come “adattogeno” o riferimenti al cortisolo non sostituiscono gli studi clinici. Conta il risultato misurato nelle persone e quanto quel risultato sia affidabile.',
    sections: [{ title: 'Cosa separare', body: 'Distingui gli effetti percepiti dai biomarcatori, l’uso acuto da quello prolungato e la calma utile dalla sedazione indesiderata.', links: [{ href: '/herbs/ashwagandha/', label: 'Ashwagandha' }, { href: '/herbs/rhodiola/', label: 'Rhodiola' }, { href: '/compounds/l-theanine/', label: 'L-teanina' }] }],
    primaryCta: { href: '/it/sicurezza/', label: 'Rivedi la sicurezza' }, secondaryCta: { href: '/goals/stress/', label: 'Guida completa in inglese' },
  },
  anxiety: {
    path: '/it/obiettivi/ansia/', eyebrow: 'Obiettivo: ansia', title: 'Ansia: prove e sicurezza prima delle promesse rapide',
    description: 'Confronta integratori studiati per l’ansia considerando qualità delle prove, sedazione, dosi, interazioni e incertezza.',
    intro: 'Nell’ansia, un piccolo segnale non dovrebbe diventare una grande promessa. La priorità è distinguere le prove cliniche dai meccanismi teorici e mantenere visibili le precauzioni.',
    sections: [{ title: 'Cosa controllare prima', body: 'Guarda qualità dello studio, popolazione, dimensione dell’effetto, sedazione e possibili interazioni con farmaci o altri depressori del sistema nervoso centrale.', links: [{ href: '/compounds/l-theanine/', label: 'L-teanina' }, { href: '/herbs/ashwagandha/', label: 'Ashwagandha' }, { href: '/herbs/valerian/', label: 'Valeriana' }] }],
    primaryCta: { href: '/it/sicurezza/', label: 'Rivedi la sicurezza' }, secondaryCta: { href: '/goals/anxiety/', label: 'Guida completa in inglese' },
  },
  focus: {
    path: '/it/obiettivi/concentrazione/', eyebrow: 'Obiettivo: concentrazione', title: 'Concentrazione: benefici, stimolazione e compromessi',
    description: 'Confronta integratori per concentrazione e attenzione considerando prove sull’uomo, stimolazione, sonno, dosi e interazioni.',
    intro: 'Più stimolazione non significa automaticamente più concentrazione. Una buona comparazione considera attenzione, stanchezza, sonno, tollerabilità e qualità reale delle prove.',
    sections: [{ title: 'Domande utili', body: 'Chiediti se lo studio misura attenzione oggettiva o soltanto sensazioni soggettive, e se un possibile beneficio comporta costi per sonno o tollerabilità.', links: [{ href: '/compounds/caffeine/', label: 'Caffeina' }, { href: '/compounds/l-theanine/', label: 'L-teanina' }, { href: '/herbs/bacopa/', label: 'Bacopa' }] }],
    primaryCta: { href: '/it/sicurezza/', label: 'Rivedi la sicurezza' }, secondaryCta: { href: '/goals/focus/', label: 'Guida completa in inglese' },
  },
  methodology: {
    path: '/it/metodologia/', eyebrow: 'Come lavoriamo', title: 'Metodologia: come valutiamo le prove',
    description: 'Scopri come The Hippie Scientist distingue studi sull’uomo, meccanismi, sicurezza e limiti della ricerca sugli integratori.',
    intro: 'Lo scopo non è trovare un motivo per raccomandare ogni ingrediente, ma rappresentare nel modo più accurato possibile la forza delle prove, le domande aperte e i rischi rilevanti.',
    sections: [{ title: 'Il nostro standard', body: 'Diamo priorità agli studi sull’uomo per gli esiti umani, separiamo meccanismo e risultato clinico, manteniamo la sicurezza visibile e riduciamo la fiducia quando i dati sono piccoli, misti o indiretti.', bullets: ['Prove sull’uomo prima dei soli meccanismi.', 'Sicurezza e interazioni prima delle conclusioni pratiche.', 'Incertezza dichiarata invece di precisione falsa.'] }],
    primaryCta: { href: '/info/methodology/', label: 'Metodologia completa in inglese' }, secondaryCta: { href: '/it/sicurezza/', label: 'Approccio alla sicurezza' },
  },
  safety: {
    path: '/it/sicurezza/', eyebrow: 'Sicurezza prima di tutto', title: 'Sicurezza degli integratori e interazioni',
    description: 'Controlla interazioni, controindicazioni, sedazione, effetti additivi e contesto della dose prima di combinare erbe o integratori.',
    intro: '“Naturale” non significa neutro. La sicurezza dipende da dose, farmaci, condizioni mediche, gravidanza, combinazioni e altri fattori individuali.',
    sections: [{ title: 'Prima di combinare più prodotti', body: 'Cerca rischi cumulativi, non soltanto avvertenze isolate: sedazione, pressione, glicemia, coagulazione, ingredienti duplicati e interazioni con farmaci.', links: [{ href: '/safety-checker/', label: 'Controllo interazioni in inglese' }, { href: '/info/supplement-safety-checklist/', label: 'Checklist di sicurezza in inglese' }] }],
    primaryCta: { href: '/safety-checker/', label: 'Apri il controllo in inglese' }, secondaryCta: { href: '/it/metodologia/', label: 'Come valutiamo le prove' },
  },
} as const satisfies Record<string, LocalizedPageData>

export type ItalianPageKey = keyof typeof ITALIAN_PAGES
export const ITALIAN_ROUTE_KEYS: Record<string, ItalianPageKey> = {
  erbe: 'herbs', composti: 'compounds', obiettivi: 'goals', 'obiettivi/sonno': 'sleep', 'obiettivi/stress': 'stress', 'obiettivi/ansia': 'anxiety', 'obiettivi/concentrazione': 'focus', metodologia: 'methodology', sicurezza: 'safety',
}
export function buildItalianPageMetadata(page: LocalizedPageData) {
  return buildLocalizedPageMetadata(page, { openGraphLocale: ITALIAN_OG_LOCALE, alternateOpenGraphLocales: [DEFAULT_OG_LOCALE] })
}

export const DUTCH_UI: LocalizedUiCopy = {
  translationNotice: 'Dit is een redactionele Nederlandse vertaling. Wetenschappelijke profielen zonder volledige Nederlandse versie blijven duidelijk gemarkeerd als Engelstalige inhoud.',
  nextStepLabel: 'Volgende stap',
  nextStepBody: 'Blijf vergelijken volgens hetzelfde principe: bewijs eerst, veiligheid zichtbaar en beperkingen duidelijk benoemd.',
  educationDisclaimer: 'Educatieve inhoud. Dit vervangt geen individuele beoordeling door een zorgprofessional, vooral niet bij medicijngebruik, zwangerschap of medische aandoeningen.',
}

export const DUTCH_PAGES = {
  home: {
    path: '/nl/', eyebrow: 'The Hippie Scientist in het Nederlands', title: 'Onderzoek supplementen zonder te gokken',
    description: 'Vergelijk kruiden en supplementen in het Nederlands op menselijk bewijs, mechanismen, doseringen, veiligheid en interacties.',
    intro: 'Vergelijk kruiden en supplementen op basis van onderzoek bij mensen, met mechanismen, bestudeerde doseringen, veiligheid en onzekerheid duidelijk van elkaar gescheiden. Begin bij je doel, niet bij marketing.',
    sections: [
      { title: 'Begin bij een doel', body: 'Bepaal eerst welk resultaat je wilt begrijpen en vergelijk daarna opties met dezelfde maatstaf voor bewijs en veiligheid.', links: [{ href: '/nl/doelen/slaap/', label: 'Slaap' }, { href: '/nl/doelen/stress/', label: 'Stress' }, { href: '/nl/doelen/angst/', label: 'Angst' }, { href: '/nl/doelen/focus/', label: 'Focus' }] },
      { title: 'Verken de bibliotheek', body: 'De kernpagina’s zijn vertaald. Gedetailleerde wetenschappelijke profielen blijven Engels totdat een volledige vertaling inhoudelijk is beoordeeld.', links: [{ href: '/nl/kruiden/', label: 'Kruiden' }, { href: '/nl/stoffen/', label: 'Stoffen en supplementen' }, { href: '/nl/methodologie/', label: 'Methodologie' }, { href: '/nl/veiligheid/', label: 'Veiligheid' }] },
    ], primaryCta: { href: '/nl/doelen/', label: 'Kies een doel' }, secondaryCta: { href: '/', label: 'English version' },
  },
  herbs: {
    path: '/nl/kruiden/', eyebrow: 'Onderzoeksbibliotheek', title: 'Kruiden: bewijs, mechanismen en veiligheid',
    description: 'Verken kruiden in het Nederlands met prioriteit voor onderzoek bij mensen, veiligheid, interacties en doseringscontext.',
    intro: 'Populariteit is geen bewijs. We scheiden bevindingen bij mensen van hypothesen uit mechanismen, traditioneel gebruik of preklinisch onderzoek.',
    sections: [{ title: 'Zo lees je de bibliotheek', body: 'Kijk eerst naar type en kwaliteit van menselijk onderzoek en controleer daarna dosering, interacties, contra-indicaties en onzekerheid.', bullets: ['Menselijk bewijs weegt zwaarder dan een mechanisme alleen.', 'Een onderzochte dosis is niet automatisch persoonlijk advies.', 'Kleine of gemengde resultaten vragen om voorzichtige taal.'] }, { title: 'Profielen om verder te onderzoeken', body: 'Volledige profielen blijven in deze fase Engelstalig.', links: [{ href: '/herbs/ashwagandha/', label: 'Ashwagandha' }, { href: '/herbs/rhodiola/', label: 'Rhodiola' }, { href: '/herbs/valerian/', label: 'Valeriaan' }] }],
    primaryCta: { href: '/nl/doelen/', label: 'Zoek op doel' }, secondaryCta: { href: '/herbs/', label: 'Volledige bibliotheek in het Engels' },
  },
  compounds: {
    path: '/nl/stoffen/', eyebrow: 'Onderzoeksbibliotheek', title: 'Stoffen en supplementen: vergelijk het bewijs',
    description: 'Verken stoffen en supplementen in het Nederlands op menselijk bewijs, dosering, veiligheid, interacties en bewijskwaliteit.',
    intro: 'Een goede vergelijking maakt onderscheid tussen klinisch waargenomen effecten en theoretische plausibiliteit. Mogelijke voordelen en relevante risico’s blijven beide zichtbaar.',
    sections: [{ title: 'Wat we prioriteren', body: 'Klinische onderzoeken, consistentie, werkelijk bestudeerde doseringen en veiligheidssignalen wegen zwaarder dan marketingclaims.', bullets: ['Type en kwaliteit van studies.', 'Consistentie tussen onderzoeken en reviews.', 'Interacties en contra-indicaties.', 'Verschillen tussen formuleringen en doseringen.'] }, { title: 'Startpunten', body: 'De gedetailleerde profielen zijn nog Engelstalig.', links: [{ href: '/compounds/magnesium/', label: 'Magnesium' }, { href: '/compounds/l-theanine/', label: 'L-theanine' }, { href: '/compounds/melatonin/', label: 'Melatonine' }] }],
    primaryCta: { href: '/nl/doelen/', label: 'Vergelijk per doel' }, secondaryCta: { href: '/compounds/', label: 'Volledige bibliotheek in het Engels' },
  },
  goals: {
    path: '/nl/doelen/', eyebrow: 'Begin bij het resultaat', title: 'Verken supplementen per doel',
    description: 'Vergelijk opties voor slaap, stress, angst en focus met bewijs, veiligheid, doseringen en praktische context.',
    intro: 'Begin niet bij het ingrediënt dat op dit moment populair is, maar bij het resultaat dat voor jou relevant is. Elke gids helpt opties te verkleinen voordat je individuele profielen opent.',
    sections: [{ title: 'Belangrijkste doelen', body: 'Kies een route en gebruik dezelfde vragen over bewijskwaliteit, veiligheid en relevantie.', links: [{ href: '/nl/doelen/slaap/', label: 'Slaap' }, { href: '/nl/doelen/stress/', label: 'Stress' }, { href: '/nl/doelen/angst/', label: 'Angst' }, { href: '/nl/doelen/focus/', label: 'Focus' }] }],
    primaryCta: { href: '/nl/veiligheid/', label: 'Controleer eerst veiligheid' }, secondaryCta: { href: '/goals/', label: 'Alle doelen in het Engels' },
  },
  sleep: {
    path: '/nl/doelen/slaap/', eyebrow: 'Doel: slaap', title: 'Slaapsupplementen: hoe je opties vergelijkt',
    description: 'Vergelijk slaapsupplementen op menselijk bewijs, timing, effecten de volgende dag, doseringen en interacties.',
    intro: '“Beter slapen” kan sneller inslapen, minder wakker worden, betere ervaren slaapkwaliteit of minder sufheid de volgende dag betekenen. De vergelijking verandert met het echte probleem.',
    sections: [{ title: 'Vragen die de keuze veranderen', body: 'Bepaal of inslapen, doorslapen of functioneren de volgende dag het belangrijkste probleem is.', bullets: ['Past de onderzochte populatie bij jouw vraag?', 'Zijn er sederende effecten of interacties?', 'Komt de productvorm overeen met wat onderzocht is?'], links: [{ href: '/compounds/melatonin/', label: 'Melatonine' }, { href: '/compounds/magnesium/', label: 'Magnesium' }, { href: '/herbs/valerian/', label: 'Valeriaan' }] }],
    primaryCta: { href: '/nl/veiligheid/', label: 'Bekijk veiligheid' }, secondaryCta: { href: '/goals/sleep/', label: 'Volledige gids in het Engels' },
  },
  stress: {
    path: '/nl/doelen/stress/', eyebrow: 'Doel: stress', title: 'Stress: vergelijk opties zonder mechanisme met bewijs te verwarren',
    description: 'Vergelijk stresssupplementen op menselijk bewijs, gebruiksduur, verdraagbaarheid, doseringen en interacties.',
    intro: 'Woorden als “adaptogeen” of verwijzingen naar cortisol vervangen geen klinisch onderzoek. Het gaat om wat bij mensen is gemeten en hoe betrouwbaar dat resultaat is.',
    sections: [{ title: 'Wat je uit elkaar moet houden', body: 'Scheid ervaren effecten van biomarkers, acuut gebruik van langdurig gebruik en nuttige kalmte van ongewenste sedatie.', links: [{ href: '/herbs/ashwagandha/', label: 'Ashwagandha' }, { href: '/herbs/rhodiola/', label: 'Rhodiola' }, { href: '/compounds/l-theanine/', label: 'L-theanine' }] }],
    primaryCta: { href: '/nl/veiligheid/', label: 'Bekijk veiligheid' }, secondaryCta: { href: '/goals/stress/', label: 'Volledige gids in het Engels' },
  },
  anxiety: {
    path: '/nl/doelen/angst/', eyebrow: 'Doel: angst', title: 'Angst: bewijs en veiligheid vóór snelle beloften',
    description: 'Vergelijk supplementen die voor angst zijn onderzocht op bewijskwaliteit, sedatie, dosering, interacties en onzekerheid.',
    intro: 'Bij angst hoort een klein signaal geen grote belofte te worden. We scheiden klinisch bewijs van theoretische mechanismen en houden voorzorgsmaatregelen zichtbaar.',
    sections: [{ title: 'Wat eerst controleren', body: 'Kijk naar studiekwaliteit, onderzochte populatie, effectgrootte, sedatie en mogelijke interacties met medicijnen of andere centraal dempende middelen.', links: [{ href: '/compounds/l-theanine/', label: 'L-theanine' }, { href: '/herbs/ashwagandha/', label: 'Ashwagandha' }, { href: '/herbs/valerian/', label: 'Valeriaan' }] }],
    primaryCta: { href: '/nl/veiligheid/', label: 'Bekijk veiligheid' }, secondaryCta: { href: '/goals/anxiety/', label: 'Volledige gids in het Engels' },
  },
  focus: {
    path: '/nl/doelen/focus/', eyebrow: 'Doel: focus', title: 'Focus: voordelen, stimulatie en afwegingen vergelijken',
    description: 'Vergelijk supplementen voor focus en aandacht op menselijk bewijs, stimulatie, slaap, dosering en interacties.',
    intro: 'Meer stimulatie betekent niet automatisch betere focus. Een zinvolle vergelijking kijkt naar aandacht, vermoeidheid, slaap, verdraagbaarheid en de werkelijke kwaliteit van het bewijs.',
    sections: [{ title: 'Nuttige vragen', body: 'Controleer of onderzoek objectieve aandacht meet of alleen subjectieve gevoelens, en of een mogelijk voordeel ten koste gaat van slaap of verdraagbaarheid.', links: [{ href: '/compounds/caffeine/', label: 'Cafeïne' }, { href: '/compounds/l-theanine/', label: 'L-theanine' }, { href: '/herbs/bacopa/', label: 'Bacopa' }] }],
    primaryCta: { href: '/nl/veiligheid/', label: 'Bekijk veiligheid' }, secondaryCta: { href: '/goals/focus/', label: 'Volledige gids in het Engels' },
  },
  methodology: {
    path: '/nl/methodologie/', eyebrow: 'Onze werkwijze', title: 'Methodologie: hoe we bewijs beoordelen',
    description: 'Lees hoe The Hippie Scientist menselijk onderzoek, mechanismen, veiligheid en onderzoeksbeperkingen bij supplementen van elkaar scheidt.',
    intro: 'Het doel is niet om voor elk ingrediënt een reden tot aanbevelen te vinden, maar om de sterkte van het bewijs, open vragen en relevante risico’s zo nauwkeurig mogelijk weer te geven.',
    sections: [{ title: 'Onze standaard', body: 'Menselijk onderzoek krijgt voorrang voor menselijke uitkomsten, mechanismen worden niet als klinisch bewijs behandeld, veiligheid blijft zichtbaar en onzekerheid verlaagt het vertrouwen.', bullets: ['Menselijk bewijs vóór mechanisme alleen.', 'Veiligheid en interacties vóór praktische conclusies.', 'Onzekerheid benoemen in plaats van schijnprecisie.'] }],
    primaryCta: { href: '/info/methodology/', label: 'Volledige methodologie in het Engels' }, secondaryCta: { href: '/nl/veiligheid/', label: 'Bekijk onze veiligheidsaanpak' },
  },
  safety: {
    path: '/nl/veiligheid/', eyebrow: 'Veiligheid eerst', title: 'Veiligheid van supplementen en interacties',
    description: 'Controleer interacties, contra-indicaties, sedatie, additieve effecten en doseringscontext voordat je kruiden of supplementen combineert.',
    intro: '“Natuurlijk” betekent niet neutraal. Veiligheid hangt af van dosering, medicijnen, aandoeningen, zwangerschap, combinaties en andere individuele factoren.',
    sections: [{ title: 'Voordat je meerdere producten combineert', body: 'Zoek naar cumulatieve risico’s, niet alleen naar losse waarschuwingen: sedatie, bloeddruk, bloedsuiker, stolling, dubbele ingrediënten en geneesmiddelinteracties.', links: [{ href: '/safety-checker/', label: 'Interacties controleren in het Engels' }, { href: '/info/supplement-safety-checklist/', label: 'Veiligheidschecklist in het Engels' }] }],
    primaryCta: { href: '/safety-checker/', label: 'Open de checker in het Engels' }, secondaryCta: { href: '/nl/methodologie/', label: 'Hoe we bewijs beoordelen' },
  },
} as const satisfies Record<string, LocalizedPageData>

export type DutchPageKey = keyof typeof DUTCH_PAGES
export const DUTCH_ROUTE_KEYS: Record<string, DutchPageKey> = {
  kruiden: 'herbs', stoffen: 'compounds', doelen: 'goals', 'doelen/slaap': 'sleep', 'doelen/stress': 'stress', 'doelen/angst': 'anxiety', 'doelen/focus': 'focus', methodologie: 'methodology', veiligheid: 'safety',
}
export function buildDutchPageMetadata(page: LocalizedPageData) {
  return buildLocalizedPageMetadata(page, { openGraphLocale: DUTCH_OG_LOCALE, alternateOpenGraphLocales: [DEFAULT_OG_LOCALE] })
}

export const POLISH_UI: LocalizedUiCopy = {
  translationNotice: 'To jest redakcyjnie przygotowane polskie tłumaczenie. Profile naukowe bez pełnej polskiej wersji pozostają wyraźnie oznaczone jako treści anglojęzyczne.',
  nextStepLabel: 'Następny krok',
  nextStepBody: 'Porównuj dalej według tej samej zasady: najpierw dowody, widoczne bezpieczeństwo i jasno opisane ograniczenia.',
  educationDisclaimer: 'Treść edukacyjna. Nie zastępuje indywidualnej oceny pracownika ochrony zdrowia, zwłaszcza przy stosowaniu leków, w ciąży lub przy chorobach przewlekłych.',
}

export const POLISH_PAGES = {
  home: {
    path: '/pl/', eyebrow: 'The Hippie Scientist po polsku', title: 'Sprawdzaj suplementy bez zgadywania',
    description: 'Porównuj zioła i suplementy po polsku na podstawie badań z udziałem ludzi, mechanizmów, dawek, bezpieczeństwa i interakcji.',
    intro: 'Porównuj zioła i suplementy, zaczynając od danych z badań u ludzi i oddzielając mechanizmy, badane dawki, bezpieczeństwo oraz niepewność. Zacznij od celu, a nie od marketingu.',
    sections: [
      { title: 'Zacznij od celu', body: 'Najpierw określ, jaki wynik chcesz zrozumieć, a następnie porównuj opcje według tego samego standardu dowodów i bezpieczeństwa.', links: [{ href: '/pl/cele/sen/', label: 'Sen' }, { href: '/pl/cele/stres/', label: 'Stres' }, { href: '/pl/cele/lek/', label: 'Lęk' }, { href: '/pl/cele/koncentracja/', label: 'Koncentracja' }] },
      { title: 'Przeglądaj bibliotekę', body: 'Strony podstawowe są przetłumaczone. Szczegółowe profile naukowe pozostają po angielsku do czasu pełnego tłumaczenia i przeglądu redakcyjnego.', links: [{ href: '/pl/ziola/', label: 'Zioła' }, { href: '/pl/skladniki/', label: 'Składniki i suplementy' }, { href: '/pl/metodologia/', label: 'Metodologia' }, { href: '/pl/bezpieczenstwo/', label: 'Bezpieczeństwo' }] },
    ], primaryCta: { href: '/pl/cele/', label: 'Wybierz cel' }, secondaryCta: { href: '/', label: 'English version' },
  },
  herbs: {
    path: '/pl/ziola/', eyebrow: 'Biblioteka badań', title: 'Zioła: dowody, mechanizmy i bezpieczeństwo',
    description: 'Przeglądaj zioła po polsku, priorytetowo traktując badania z udziałem ludzi, bezpieczeństwo, interakcje i kontekst dawkowania.',
    intro: 'Popularność zioła nie jest dowodem skuteczności. Oddzielamy wyniki obserwowane u ludzi od hipotez wynikających z mechanizmów, tradycji lub badań przedklinicznych.',
    sections: [{ title: 'Jak czytać bibliotekę', body: 'Najpierw sprawdź rodzaj i jakość badań u ludzi, a następnie dawkę, interakcje, przeciwwskazania i poziom niepewności.', bullets: ['Badania u ludzi mają większą wagę niż sam mechanizm.', 'Badana dawka nie jest automatycznie zaleceniem dla konkretnej osoby.', 'Małe lub niespójne wyniki wymagają ostrożnego języka.'] }, { title: 'Profile do dalszego sprawdzania', body: 'Pełne profile pozostają na tym etapie w języku angielskim.', links: [{ href: '/herbs/ashwagandha/', label: 'Ashwagandha' }, { href: '/herbs/rhodiola/', label: 'Rhodiola' }, { href: '/herbs/valerian/', label: 'Waleriana' }] }],
    primaryCta: { href: '/pl/cele/', label: 'Szukaj według celu' }, secondaryCta: { href: '/herbs/', label: 'Pełna biblioteka po angielsku' },
  },
  compounds: {
    path: '/pl/skladniki/', eyebrow: 'Biblioteka badań', title: 'Składniki i suplementy: porównuj dowody',
    description: 'Przeglądaj składniki i suplementy po polsku według badań u ludzi, dawek, bezpieczeństwa, interakcji i jakości dowodów.',
    intro: 'Dobre porównanie odróżnia efekty zaobserwowane klinicznie od teoretycznej wiarygodności mechanizmu. Pokazujemy zarówno możliwe korzyści, jak i istotne ryzyka.',
    sections: [{ title: 'Co traktujemy priorytetowo', body: 'Największą wagę mają badania kliniczne, spójność wyników, faktycznie badane dawki oraz sygnały dotyczące bezpieczeństwa.', bullets: ['Rodzaj i jakość badań.', 'Spójność między badaniami i przeglądami.', 'Interakcje i przeciwwskazania.', 'Różnice między preparatami i dawkami.'] }, { title: 'Punkty startowe', body: 'Szczegółowe profile są nadal dostępne po angielsku.', links: [{ href: '/compounds/magnesium/', label: 'Magnez' }, { href: '/compounds/l-theanine/', label: 'L-teanina' }, { href: '/compounds/melatonin/', label: 'Melatonina' }] }],
    primaryCta: { href: '/pl/cele/', label: 'Porównaj według celu' }, secondaryCta: { href: '/compounds/', label: 'Pełna biblioteka po angielsku' },
  },
  goals: {
    path: '/pl/cele/', eyebrow: 'Zacznij od wyniku', title: 'Przeglądaj suplementy według celu',
    description: 'Porównuj opcje dotyczące snu, stresu, lęku i koncentracji, uwzględniając dowody, bezpieczeństwo, dawki i kontekst.',
    intro: 'Zamiast zaczynać od modnego składnika, zacznij od wyniku, który naprawdę chcesz zrozumieć. Każdy przewodnik pomaga zawęzić opcje przed przejściem do poszczególnych profili.',
    sections: [{ title: 'Główne cele', body: 'Wybierz ścieżkę i stosuj te same pytania dotyczące jakości dowodów, bezpieczeństwa i trafności.', links: [{ href: '/pl/cele/sen/', label: 'Sen' }, { href: '/pl/cele/stres/', label: 'Stres' }, { href: '/pl/cele/lek/', label: 'Lęk' }, { href: '/pl/cele/koncentracja/', label: 'Koncentracja' }] }],
    primaryCta: { href: '/pl/bezpieczenstwo/', label: 'Najpierw sprawdź bezpieczeństwo' }, secondaryCta: { href: '/goals/', label: 'Wszystkie cele po angielsku' },
  },
  sleep: {
    path: '/pl/cele/sen/', eyebrow: 'Cel: sen', title: 'Suplementy na sen: jak porównywać opcje',
    description: 'Porównuj suplementy na sen według badań u ludzi, pory stosowania, efektów następnego dnia, dawek i interakcji.',
    intro: '„Lepszy sen” może oznaczać szybsze zasypianie, mniej przebudzeń, lepszą subiektywną jakość snu albo mniejszą senność następnego dnia. Porównanie zależy od rzeczywistego problemu.',
    sections: [{ title: 'Pytania, które zmieniają decyzję', body: 'Ustal, czy głównym problemem jest zasypianie, utrzymanie snu czy funkcjonowanie następnego dnia.', bullets: ['Czy badana populacja odpowiada Twojemu pytaniu?', 'Czy występuje sedacja lub ważne interakcje?', 'Czy forma i dawka produktu odpowiadają badaniom?'], links: [{ href: '/compounds/melatonin/', label: 'Melatonina' }, { href: '/compounds/magnesium/', label: 'Magnez' }, { href: '/herbs/valerian/', label: 'Waleriana' }] }],
    primaryCta: { href: '/pl/bezpieczenstwo/', label: 'Sprawdź bezpieczeństwo' }, secondaryCta: { href: '/goals/sleep/', label: 'Pełny przewodnik po angielsku' },
  },
  stress: {
    path: '/pl/cele/stres/', eyebrow: 'Cel: stres', title: 'Stres: porównuj opcje bez mylenia mechanizmu z dowodem',
    description: 'Porównuj suplementy na stres według badań u ludzi, czasu stosowania, tolerancji, dawek i interakcji.',
    intro: 'Określenia takie jak „adaptogen” czy odwołania do kortyzolu nie zastępują badań klinicznych. Liczy się to, co zmierzono u ludzi i jak wiarygodny jest wynik.',
    sections: [{ title: 'Co warto rozdzielić', body: 'Oddzielaj odczuwane efekty od biomarkerów, stosowanie doraźne od długotrwałego oraz użyteczne uspokojenie od niepożądanej sedacji.', links: [{ href: '/herbs/ashwagandha/', label: 'Ashwagandha' }, { href: '/herbs/rhodiola/', label: 'Rhodiola' }, { href: '/compounds/l-theanine/', label: 'L-teanina' }] }],
    primaryCta: { href: '/pl/bezpieczenstwo/', label: 'Sprawdź bezpieczeństwo' }, secondaryCta: { href: '/goals/stress/', label: 'Pełny przewodnik po angielsku' },
  },
  anxiety: {
    path: '/pl/cele/lek/', eyebrow: 'Cel: lęk', title: 'Lęk: dowody i bezpieczeństwo przed szybkimi obietnicami',
    description: 'Porównuj suplementy badane pod kątem lęku, uwzględniając jakość dowodów, sedację, dawki, interakcje i niepewność.',
    intro: 'W przypadku lęku mały sygnał nie powinien stawać się dużą obietnicą. Priorytetem jest oddzielenie dowodów klinicznych od teoretycznych mechanizmów oraz zachowanie widocznych środków ostrożności.',
    sections: [{ title: 'Co sprawdzić najpierw', body: 'Zwróć uwagę na jakość badania, badaną populację, wielkość efektu, sedację i możliwe interakcje z lekami lub innymi środkami działającymi depresyjnie na ośrodkowy układ nerwowy.', links: [{ href: '/compounds/l-theanine/', label: 'L-teanina' }, { href: '/herbs/ashwagandha/', label: 'Ashwagandha' }, { href: '/herbs/valerian/', label: 'Waleriana' }] }],
    primaryCta: { href: '/pl/bezpieczenstwo/', label: 'Sprawdź bezpieczeństwo' }, secondaryCta: { href: '/goals/anxiety/', label: 'Pełny przewodnik po angielsku' },
  },
  focus: {
    path: '/pl/cele/koncentracja/', eyebrow: 'Cel: koncentracja', title: 'Koncentracja: porównuj korzyści, stymulację i kompromisy',
    description: 'Porównuj suplementy na koncentrację i uwagę według badań u ludzi, stymulacji, wpływu na sen, dawek i interakcji.',
    intro: 'Większa stymulacja nie oznacza automatycznie lepszej koncentracji. Sensowne porównanie uwzględnia uwagę, zmęczenie, sen, tolerancję i rzeczywistą jakość dowodów.',
    sections: [{ title: 'Przydatne pytania', body: 'Sprawdź, czy badanie mierzy obiektywną uwagę, czy tylko subiektywne odczucia, oraz czy potencjalna korzyść nie wiąże się z kosztami dla snu lub tolerancji.', links: [{ href: '/compounds/caffeine/', label: 'Kofeina' }, { href: '/compounds/l-theanine/', label: 'L-teanina' }, { href: '/herbs/bacopa/', label: 'Bacopa' }] }],
    primaryCta: { href: '/pl/bezpieczenstwo/', label: 'Sprawdź bezpieczeństwo' }, secondaryCta: { href: '/goals/focus/', label: 'Pełny przewodnik po angielsku' },
  },
  methodology: {
    path: '/pl/metodologia/', eyebrow: 'Jak pracujemy', title: 'Metodologia: jak oceniamy dowody',
    description: 'Dowiedz się, jak The Hippie Scientist oddziela badania u ludzi, mechanizmy, bezpieczeństwo i ograniczenia badań nad suplementami.',
    intro: 'Celem nie jest znalezienie powodu, by polecać każdy składnik, ale możliwie dokładne przedstawienie siły dowodów, otwartych pytań i istotnych ryzyk.',
    sections: [{ title: 'Nasz standard', body: 'Badania u ludzi mają pierwszeństwo dla wyników dotyczących ludzi, mechanizmy nie są traktowane jak dowód kliniczny, bezpieczeństwo pozostaje widoczne, a niepewność obniża poziom zaufania.', bullets: ['Badania u ludzi przed samym mechanizmem.', 'Bezpieczeństwo i interakcje przed praktycznymi wnioskami.', 'Jawna niepewność zamiast fałszywej precyzji.'] }],
    primaryCta: { href: '/info/methodology/', label: 'Pełna metodologia po angielsku' }, secondaryCta: { href: '/pl/bezpieczenstwo/', label: 'Podejście do bezpieczeństwa' },
  },
  safety: {
    path: '/pl/bezpieczenstwo/', eyebrow: 'Najpierw bezpieczeństwo', title: 'Bezpieczeństwo suplementów i interakcje',
    description: 'Sprawdź interakcje, przeciwwskazania, sedację, efekty addytywne i kontekst dawkowania przed łączeniem ziół lub suplementów.',
    intro: '„Naturalny” nie oznacza obojętny. Bezpieczeństwo zależy od dawki, leków, chorób, ciąży, połączeń produktów i innych indywidualnych czynników.',
    sections: [{ title: 'Przed połączeniem kilku produktów', body: 'Szukaj ryzyka skumulowanego, a nie tylko pojedynczych ostrzeżeń: sedacji, wpływu na ciśnienie, glikemię, krzepnięcie, dublowania składników i interakcji z lekami.', links: [{ href: '/safety-checker/', label: 'Sprawdź interakcje po angielsku' }, { href: '/info/supplement-safety-checklist/', label: 'Lista bezpieczeństwa po angielsku' }] }],
    primaryCta: { href: '/safety-checker/', label: 'Otwórz narzędzie po angielsku' }, secondaryCta: { href: '/pl/metodologia/', label: 'Jak oceniamy dowody' },
  },
} as const satisfies Record<string, LocalizedPageData>

export type PolishPageKey = keyof typeof POLISH_PAGES
export const POLISH_ROUTE_KEYS: Record<string, PolishPageKey> = {
  ziola: 'herbs', skladniki: 'compounds', cele: 'goals', 'cele/sen': 'sleep', 'cele/stres': 'stress', 'cele/lek': 'anxiety', 'cele/koncentracja': 'focus', metodologia: 'methodology', bezpieczenstwo: 'safety',
}
export function buildPolishPageMetadata(page: LocalizedPageData) {
  return buildLocalizedPageMetadata(page, { openGraphLocale: POLISH_OG_LOCALE, alternateOpenGraphLocales: [DEFAULT_OG_LOCALE] })
}
