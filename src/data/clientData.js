/* ------------------------------------------------------------------
   נתוני כרטיס הלקוח (סעיף 3.2 באפיון):
   נכסים דיגיטליים, היסטוריית תשלומים, יומן תקשורת ומסמכים.

   הכל נגזר או נוצר כאן באופן דטרמיניסטי מנתוני הלקוח, כדי שכאשר
   נחבר שרת אמיתי – רק הקובץ הזה יוחלף.
   ------------------------------------------------------------------ */
import { packageById } from './packages.js'

/* "גיבוב" יציב קטן משם המזהה – כדי לגוון נתוני דמו בלי אקראיות */
function hashOf(id) {
  let h = 0
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 9973
  return h
}

/* ===== הנכסים הדיגיטליים (סעיף 3.2) =====
   הרשימה נגזרת מתכולת החבילה (סעיף 5), והסטטוס של כל נכס נגזר
   ממשימות ההקמה של הלקוח: משימה שהושלמה = הנכס באוויר. */
const ASSET_DEFS = {
  standard: [
    { name: 'בוט וואטסאפ', taskMatch: 'הקמת בוט וואטסאפ' },
  ],
  mid: [
    { name: 'דף נחיתה', taskMatch: 'בניית דף נחיתה' },
    { name: 'מספר וירטואלי', taskMatch: 'הקמת מספר וירטואלי' },
    { name: 'עמוד פייסבוק / אינסטגרם', taskMatch: 'פתיחת עמודים עסקיים' },
    { name: 'כרטיס גוגל עסקי', taskMatch: 'פתיחת כרטיס גוגל עסקי' },
  ],
  premium: [
    { name: 'אתר מלא', taskMatch: 'בניית אתר מלא' },
  ],
}

function assetDefsFor(packageId) {
  if (packageId === 'standard') return ASSET_DEFS.standard
  if (packageId === 'mid') return [...ASSET_DEFS.standard, ...ASSET_DEFS.mid]
  return [...ASSET_DEFS.standard, ...ASSET_DEFS.mid, ...ASSET_DEFS.premium]
}

/* live = באוויר | building = בהקמה כרגע | pending = ממתין להקמה */
export function assetsForClient(client, allTasks) {
  const clientTasks = allTasks.filter((t) => t.clientId === client.id)
  return assetDefsFor(client.packageId).map((def) => {
    if (client.status !== 'setup') {
      return { ...def, status: 'live', url: '#' }
    }
    const task = clientTasks.find((t) => t.title.startsWith(def.taskMatch))
    if (task?.status === 'done') return { ...def, status: 'live', url: '#' }
    if (task) return { ...def, status: 'building', url: null }
    return { ...def, status: 'pending', url: null }
  })
}

export const ASSET_STATUS_LABELS = {
  live: { label: 'באוויר', tone: 'active' },
  building: { label: 'בהקמה', tone: 'pending' },
  pending: { label: 'ממתין להקמה', tone: 'muted' },
}

/* ===== יומן תקשורת (סעיפים 3.2 + 11) ===== */
const LOG_TEMPLATES = [
  { type: 'שיחה', text: 'שיחת היכרות ותיאום ציפיות לתחילת העבודה' },
  { type: 'וואטסאפ', text: 'נשלח עדכון התקדמות שבועי עם צילומי מסך' },
  { type: 'פגישה', text: 'פגישת סטטוס חודשית – סקירת ביצועי הקמפיינים' },
  { type: 'אימייל', text: 'נשלח דוח חודשי מסכם ללקוח' },
]

export function commLogFor(client) {
  /* לקוח שהומר מליד – היומן מתחיל מרגע ההמרה */
  if (client.fromLeadId) {
    return [{
      id: `${client.id}-log0`,
      date: new Date().toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' }),
      type: 'מערכת',
      text: 'הליד הומר ללקוח ונפתחו אוטומטית משימות ההקמה של החבילה',
    }]
  }
  const h = hashOf(client.id)
  return [0, 1, 2].map((k) => {
    const tpl = LOG_TEMPLATES[(h + k) % LOG_TEMPLATES.length]
    const d = new Date()
    d.setDate(d.getDate() - (3 + k * 9 + (h % 5)))
    return {
      id: `${client.id}-log${k}`,
      date: d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' }),
      type: tpl.type,
      text: tpl.text,
    }
  })
}

/* ===== מסמכים וקבצים (סעיפים 3.2 + 10) ===== */
export function docsFor(client) {
  const h = hashOf(client.id)
  const base = [
    { name: 'הסכם התקשרות.pdf', kind: 'PDF', size: `${180 + (h % 90)}KB` },
  ]
  if (client.fromLeadId) return base.map((d, i) => ({ ...d, id: `${client.id}-d${i}` }))
  return [
    ...base,
    { name: 'חשבונית אחרונה.pdf', kind: 'PDF', size: `${60 + (h % 40)}KB` },
    { name: 'קבצי מיתוג.zip', kind: 'ZIP', size: `${4 + (h % 14)}MB` },
  ].map((d, i) => ({ ...d, id: `${client.id}-d${i}` }))
}

/* ===== מחזור החיים של הלקוח (סעיף 3.1) ===== */
export const LIFECYCLE_STAGES = [
  { id: 1, label: 'ליד' },
  { id: 2, label: 'בתהליך מכירה' },
  { id: 3, label: 'חבילה נסגרה' },
  { id: 4, label: 'בהקמה' },
  { id: 5, label: 'פעיל – תחזוקה שוטפת' },
  { id: 6, label: 'מוקפא / בסיכון נטישה' },
]

export function lifecycleStageOf(client) {
  if (client.status === 'frozen') return 6
  if (client.status === 'setup') return 4
  return 5
}

export const CLIENT_STATUS_LABELS = {
  setup: { label: 'בהקמה', tone: 'secondary' },
  active: { label: 'פעיל – תחזוקה שוטפת', tone: 'active' },
  frozen: { label: 'מוקפא / בסיכון נטישה', tone: 'late' },
}

export function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
