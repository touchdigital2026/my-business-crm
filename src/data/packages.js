/* ------------------------------------------------------------------
   חבילות, יעדי זמן (SLA) ומשימות הקמה.
   מבוסס על סעיף 5 (חבילות), סעיף 6.1 (סוגי משימות)
   וסעיף 6.2 (טבלת יעדי הזמן) באפיון.

   הכל מוגדר כאן כ"תבניות", כדי שאפשר יהיה לעדכן תמחור, תכולה
   ויעדי זמן בעתיד בלי לגעת בשאר הקוד – בדיוק כפי שדורש סעיף 5.
   ------------------------------------------------------------------ */

const MINUTE = 1
const HOUR = 60
const DAY = 24 * HOUR

/* טבלת יעדי הזמן, מועתקת מסעיף 6.2 באפיון */
export const SLA = {
  software:       { label: 'פיתוח תוכנה (כללי)',        minutes: 14 * DAY },
  website:        { label: 'בניית אתר',                  minutes: 21 * DAY },
  landingPremium: { label: 'דף נחיתה – פרימיום',         minutes: 8 * HOUR },
  landingStandard:{ label: 'דף נחיתה – סטנדרט',          minutes: 2 * HOUR },
  whatsappBot:    { label: 'הקמת בוט וואטסאפ',           minutes: 90 * MINUTE },
  campaign:       { label: 'הרמת קמפיין מאפס',           minutes: 2 * HOUR },
  businessPage:   { label: 'פתיחת עמוד עסקי',            minutes: 15 * MINUTE },
  gantt:          { label: 'יצירת גאנט + העלאת פוסטים',  minutes: 30 * MINUTE },
  /* משימות התחזוקה השוטפת – יעד זמן יומי (סעיף 6.2) */
  paidMaint:      { label: 'תחזוקת שיווק ממומן',          minutes: 20 * MINUTE, perDay: true },
  organicMaint:   { label: 'תחזוקת שיווק אורגני',         minutes: 10 * MINUTE, perDay: true },
}

/* שלוש החבילות, לפי הטבלה בסעיף 5 */
export const packages = [
  {
    id: 'standard',
    name: 'סטנדרט',
    price: 2000,
    tier: 1,
    includes: 'בוט וואטסאפ, שיווק ממומן, ביו שיווקי, CRM',
  },
  {
    id: 'mid',
    name: 'ביניים',
    price: 3000,
    tier: 2,
    includes: 'הנ"ל + דף נחיתה, מספר וירטואלי, פוסטים, מייקאובר, עמודים וכרטיס גוגל',
  },
  {
    id: 'premium',
    name: 'פרימיום',
    price: 5000,
    tier: 3,
    includes: 'הנ"ל + אתר מלא, שיווק אורגני בגוגל ו-AI',
    addOn: { name: 'פלטפורמת שיווק נוספת', price: 500 },
  },
]

export const packageById = Object.fromEntries(packages.map((p) => [p.id, p]))

/* ------------------------------------------------------------------
   משימות ההקמה שנפתחות אוטומטית עם רכישת חבילה (סעיף 4.3 + 6.1).
   כל חבילה כוללת את משימות החבילה שמתחתיה, בדיוק כמו ש"הנ"ל +"
   מופיע בטבלת החבילות באפיון.

   slaAssumed=true מסמן משימה שאין לה שורה מפורשת בטבלת סעיף 6.2,
   ולכן יעד הזמן שלה הוא הצעה שממתינה לאישור.
   ------------------------------------------------------------------ */

const STANDARD_TASKS = [
  { title: 'הקמת בוט וואטסאפ', sla: 'whatsappBot' },
  { title: 'הרמת קמפיין שיווק ממומן', sla: 'campaign' },
  { title: 'הקמת ביו שיווקי', sla: 'businessPage', slaAssumed: true },
  { title: 'הקמת CRM ללקוח', sla: 'software', slaAssumed: true },
]

const MID_TASKS = [
  { title: 'הקמת מספר וירטואלי', sla: 'businessPage', slaAssumed: true },
  { title: 'פתיחת עמודים עסקיים', sla: 'businessPage' },
  { title: 'פתיחת כרטיס גוגל עסקי', sla: 'businessPage' },
  { title: 'מייקאובר, יצירת גאנט והעלאת פוסטים', sla: 'gantt' },
]

const PREMIUM_TASKS = [
  { title: 'בניית אתר מלא', sla: 'website' },
  { title: 'הקמת שיווק אורגני בגוגל ו-AI', sla: 'campaign', slaAssumed: true },
]

/* דף הנחיתה מקבל יעד זמן שונה בפרימיום (8 שעות) לעומת סטנדרט (שעתיים) */
function landingTask(packageId) {
  return packageId === 'premium'
    ? { title: 'בניית דף נחיתה (פרימיום)', sla: 'landingPremium' }
    : { title: 'בניית דף נחיתה', sla: 'landingStandard' }
}

/* מחזיר את רשימת משימות ההקמה המלאה עבור חבילה נתונה */
export function setupTasksFor(packageId) {
  if (packageId === 'standard') return [...STANDARD_TASKS]
  if (packageId === 'mid') return [...STANDARD_TASKS, landingTask('mid'), ...MID_TASKS]
  return [...STANDARD_TASKS, landingTask('premium'), ...MID_TASKS, ...PREMIUM_TASKS]
}

/* תווית יעד ה-SLA של משימה, כולל סימון "ביום" למשימות תחזוקה יומיות */
export function slaLabelOf(slaKey) {
  const entry = SLA[slaKey]
  if (!entry) return null
  return formatSla(entry.minutes) + (entry.perDay ? ' ביום' : '')
}

/* ממיר יעד זמן בדקות לתיאור קריא בעברית */
export function formatSla(minutes) {
  if (minutes < HOUR) return `${minutes} דקות`
  if (minutes < DAY) {
    const hours = minutes / HOUR
    if (hours === 1.5) return 'שעה וחצי'
    if (hours === 1) return 'שעה'
    if (hours === 2) return 'שעתיים'
    return `${hours} שעות`
  }
  const days = minutes / DAY
  if (days === 7) return 'שבוע'
  if (days === 14) return 'שבועיים'
  if (days % 7 === 0) return `${days / 7} שבועות`
  return `${days} ימים`
}
