/* ------------------------------------------------------------------
   נתוני הדמו של המערכת.
   הכל כתוב כאן במקום אחד, כדי שיהיה קל להחליף בהמשך בנתונים
   אמיתיים מהשרת בלי לגעת בעיצוב או ברכיבים.
   ------------------------------------------------------------------ */
export { packages, packageById, SLA, setupTasksFor, formatSla, slaLabelOf } from './packages.js'
import { packageById } from './packages.js'

/* ===== שלבי הפייפליין, לפי סעיף 4.1 באפיון ===== */
export const pipelineStages = [
  { id: 'new', name: 'ליד חדש' },
  { id: 'contacted', name: 'יצירת קשר ראשוני' },
  { id: 'quoted', name: 'נשלחה הצעת מחיר' },
  { id: 'meeting', name: 'פגישה / שיחת מכירה' },
  { id: 'negotiation', name: 'משא ומתן' },
]
export const stageById = Object.fromEntries(pipelineStages.map((s) => [s.id, s]))

/* ===== מקורות הליד, לפי סעיף 4.2 באפיון ===== */
export const leadSources = [
  { id: 'referral', name: 'הפניה' },
  { id: 'word', name: 'פה לאוזן' },
  { id: 'inbound', name: 'שיווק נכנס' },
  { id: 'other', name: 'אחר' },
]
export const sourceById = Object.fromEntries(leadSources.map((s) => [s.id, s]))

export const salesReps = ['אורי מזרחי', 'יעל אדרי']

/* ===== לידים =====
   status: active = בפייפליין | won = הומר ללקוח | lost = אבד */
export const initialLeads = [
  { id: 'L01', name: 'דנה כהן', business: 'סטודיו לין', phone: '052-4471190', email: 'dana@lin.co.il', source: 'inbound', stage: 'new', packageId: 'standard', value: 2000, owner: 'אורי מזרחי', lastContact: '19.08', nextFollowUp: '21.08', status: 'active' },
  { id: 'L02', name: 'אורי שלו', business: 'שלו הובלות', phone: '053-8820114', email: 'uri@shalev.co.il', source: 'referral', stage: 'negotiation', packageId: 'premium', value: 5000, owner: 'יעל אדרי', lastContact: '18.08', nextFollowUp: '20.08', status: 'active' },
  { id: 'L03', name: 'שירה לוי', business: 'Bloom קוסמטיקה', phone: '054-2213398', email: 'shira@bloom.co.il', source: 'inbound', stage: 'quoted', packageId: 'mid', value: 3000, owner: 'אורי מזרחי', lastContact: '18.08', nextFollowUp: '22.08', status: 'active' },
  { id: 'L04', name: 'יוסי אברהם', business: 'טכנופלוס', phone: '050-7719923', email: 'yossi@technoplus.co.il', source: 'word', stage: 'meeting', packageId: 'premium', value: 5000, owner: 'יעל אדרי', lastContact: '17.08', nextFollowUp: '20.08', status: 'active' },
  { id: 'L05', name: 'נועה פרידמן', business: 'קפה נועה', phone: '052-9930471', email: 'noa@cafenoa.co.il', source: 'word', stage: 'new', packageId: 'standard', value: 2000, owner: 'אורי מזרחי', lastContact: '17.08', nextFollowUp: '21.08', status: 'active' },
  { id: 'L06', name: 'רון שגיא', business: 'שגיא ייעוץ עסקי', phone: '053-1140882', email: 'ron@sagi.co.il', source: 'referral', stage: 'contacted', packageId: 'mid', value: 3000, owner: 'יעל אדרי', lastContact: '16.08', nextFollowUp: '20.08', status: 'active' },
  { id: 'L07', name: 'מיכל ברק', business: 'ברק אדריכלות', phone: '054-6628104', email: 'michal@barak-arch.co.il', source: 'inbound', stage: 'quoted', packageId: 'premium', value: 5000, owner: 'אורי מזרחי', lastContact: '16.08', nextFollowUp: '23.08', status: 'active' },
  { id: 'L08', name: 'עידן נחום', business: 'נחום מוסך', phone: '050-3318827', email: 'idan@nahum.co.il', source: 'other', stage: 'new', packageId: 'standard', value: 2000, owner: 'יעל אדרי', lastContact: '15.08', nextFollowUp: '20.08', status: 'active' },
  { id: 'L09', name: 'טל רוזן', business: 'רוזן עורכי דין', phone: '052-7714403', email: 'tal@rozen-law.co.il', source: 'referral', stage: 'meeting', packageId: 'mid', value: 3000, owner: 'אורי מזרחי', lastContact: '15.08', nextFollowUp: '21.08', status: 'active' },
  { id: 'L10', name: 'ליאור מור', business: 'מור פיטנס', phone: '053-4429916', email: 'lior@morfit.co.il', source: 'inbound', stage: 'contacted', packageId: 'standard', value: 2000, owner: 'יעל אדרי', lastContact: '14.08', nextFollowUp: '20.08', status: 'active' },
  { id: 'L11', name: 'אלה גבאי', business: 'גבאי אירועים', phone: '054-8830127', email: 'ela@gabay.co.il', source: 'word', stage: 'negotiation', packageId: 'mid', value: 3000, owner: 'אורי מזרחי', lastContact: '14.08', nextFollowUp: '19.08', status: 'active' },
  { id: 'L12', name: 'שי אלון', business: 'אלון שיפוצים', phone: '050-2217794', email: 'shay@alon.co.il', source: 'other', stage: 'new', packageId: 'standard', value: 2000, owner: 'יעל אדרי', lastContact: '13.08', nextFollowUp: '20.08', status: 'active' },
  { id: 'L13', name: 'הילה אשר', business: 'אשר תכשיטים', phone: '052-5563318', email: 'hila@asher.co.il', source: 'inbound', stage: 'quoted', packageId: 'standard', value: 2000, owner: 'אורי מזרחי', lastContact: '13.08', nextFollowUp: '22.08', status: 'active' },
  { id: 'L14', name: 'עומר דגן', business: 'דגן ביטוח', phone: '053-9902286', email: 'omer@dagan.co.il', source: 'referral', stage: 'contacted', packageId: 'premium', value: 5000, owner: 'יעל אדרי', lastContact: '12.08', nextFollowUp: '20.08', status: 'active' },
  { id: 'L15', name: 'רותם בן דוד', business: 'בן דוד קרמיקה', phone: '054-3320915', email: 'rotem@bd-ceramic.co.il', source: 'word', stage: 'meeting', packageId: 'mid', value: 3000, owner: 'אורי מזרחי', lastContact: '12.08', nextFollowUp: '21.08', status: 'active' },
  { id: 'L16', name: 'גיא הראל', business: 'הראל דיגיטל', phone: '050-6647730', email: 'guy@harel.co.il', source: 'inbound', stage: 'new', packageId: 'mid', value: 3000, owner: 'יעל אדרי', lastContact: '11.08', nextFollowUp: '20.08', status: 'active' },
  { id: 'L17', name: 'סיון נאור', business: 'נאור סטודיו', phone: '052-1178842', email: 'sivan@naor.co.il', source: 'referral', stage: 'negotiation', packageId: 'premium', value: 5000, owner: 'אורי מזרחי', lastContact: '11.08', nextFollowUp: '19.08', status: 'active' },
  { id: 'L18', name: 'אמיר כץ', business: 'כץ רהיטים', phone: '053-7729051', email: 'amir@katz.co.il', source: 'other', stage: 'contacted', packageId: 'standard', value: 2000, owner: 'יעל אדרי', lastContact: '10.08', nextFollowUp: '20.08', status: 'active' },
  /* לידים שכבר הוכרעו ב-30 הימים האחרונים */
  { id: 'L19', name: 'ניר עמית', business: 'עמית תעשיות', phone: '050-4438826', email: 'nir@amit.co.il', source: 'referral', stage: 'negotiation', packageId: 'premium', value: 5000, owner: 'יעל אדרי', lastContact: '09.08', nextFollowUp: '—', status: 'won' },
  { id: 'L20', name: 'מאיה סער', business: 'סער עיצוב פנים', phone: '054-9917743', email: 'maya@saar.co.il', source: 'inbound', stage: 'negotiation', packageId: 'mid', value: 3000, owner: 'אורי מזרחי', lastContact: '08.08', nextFollowUp: '—', status: 'won' },
  { id: 'L21', name: 'דורון פלד', business: 'פלד אלקטרוניקה', phone: '052-3384419', email: 'doron@peled.co.il', source: 'other', stage: 'quoted', packageId: 'standard', value: 2000, owner: 'יעל אדרי', lastContact: '07.08', nextFollowUp: '—', status: 'lost', lostReason: 'מחיר גבוה מהתקציב' },
  { id: 'L22', name: 'ענת שמש', business: 'שמש נופש', phone: '053-2295530', email: 'anat@shemesh.co.il', source: 'word', stage: 'meeting', packageId: 'mid', value: 3000, owner: 'אורי מזרחי', lastContact: '06.08', nextFollowUp: '—', status: 'lost', lostReason: 'בחר בספק אחר' },
]

/* ===== לקוחות =====
   status: active = תחזוקה שוטפת | setup = בהקמה | frozen = מוקפא (סעיף 3.1)
   פרטי הזיהוי (סעיף 3.2) – טלפון, אימייל, תחום, כתובת ותאריכי
   התקשרות – נוצרים דטרמיניסטית עבור נתוני הדמו. */
const CITIES = ['תל אביב', 'רמת גן', 'חיפה', 'ירושלים', 'ראשון לציון', 'נתניה', 'באר שבע', 'הרצליה']
let clientIndex = 0

const c = (id, business, contact, industry, packageId, status, owner, extra = {}) => {
  const i = clientIndex++
  const start = new Date()
  start.setDate(1)
  start.setMonth(start.getMonth() - (3 + ((i * 5) % 20)))   // ותק של 3–22 חודשים
  const renewal = new Date(start)
  renewal.setFullYear(renewal.getFullYear() + 1)
  return {
    id, business, contact, industry, packageId, status, owner,
    phone: `05${[2, 3, 4, 0][i % 4]}-${String(1100000 + ((i * 793571) % 8899999)).slice(0, 7)}`,
    email: `office@client-${id.slice(1)}.co.il`,
    address: `${CITIES[i % CITIES.length]}`,
    startDate: start.toISOString(),
    renewalDate: renewal.toISOString(),
    notes: '',
    ...extra,
  }
}

export const initialClients = [
  c('C01', 'מזרחי נדל"ן', 'אורי מזרחי', 'נדל"ן ותיווך', 'premium', 'active', 'יעל אדרי', { paymentStatus: 'overdue', overdueDays: 24, overdueAmount: 5000 }),
  c('C02', 'Bloom קוסמטיקה', 'שירה לוי', 'קוסמטיקה וטיפוח', 'mid', 'active', 'יעל אדרי', { paymentStatus: 'overdue', overdueDays: 12, overdueAmount: 3000 }),
  c('C03', 'קפה נועה', 'נועה פרידמן', 'מסעדנות ובתי קפה', 'standard', 'active', 'אורי מזרחי', { paymentStatus: 'paid', inactiveDays: 47 }),
  c('C04', 'שגיא ייעוץ עסקי', 'רון שגיא', 'ייעוץ עסקי', 'standard', 'active', 'יעל אדרי', { paymentStatus: 'overdue', overdueDays: 8, overdueAmount: 2000 }),
  c('C05', 'טכנופלוס', 'יוסי אברהם', 'טכנולוגיה ומחשוב', 'mid', 'active', 'אורי מזרחי', { paymentStatus: 'paid', inactiveDays: 33 }),
  c('C06', 'לין סטודיו', 'דנה לין', 'עיצוב גרפי', 'standard', 'active', 'יעל אדרי', { paymentStatus: 'paid' }),
  c('C07', 'אורבן פיצה', 'טום אורבך', 'מסעדנות ובתי קפה', 'standard', 'active', 'יעל אדרי', { paymentStatus: 'paid' }),
  c('C08', 'גרין גארדן', 'ליאת גרין', 'גינון ונוף', 'standard', 'active', 'אורי מזרחי', { paymentStatus: 'paid' }),
  c('C09', 'קליניקת ד"ר שני', 'שני רז', 'רפואה אסתטית', 'standard', 'active', 'יעל אדרי', { paymentStatus: 'paid' }),
  c('C10', 'מוסך אבי', 'אבי חן', 'רכב ותחבורה', 'standard', 'active', 'אורי מזרחי', { paymentStatus: 'paid' }),
  c('C11', 'סטייל ביוטי', 'רינת סתיו', 'קוסמטיקה וטיפוח', 'standard', 'active', 'יעל אדרי', { paymentStatus: 'paid' }),
  c('C12', 'בוטיק אלה', 'אלה נבו', 'אופנה וקמעונאות', 'standard', 'active', 'אורי מזרחי', { paymentStatus: 'paid' }),
  c('C13', 'הנדימן פלוס', 'מוטי דהן', 'שיפוצים ותחזוקה', 'standard', 'active', 'יעל אדרי', { paymentStatus: 'paid' }),
  c('C14', 'פיט קלאב', 'עידו שרון', 'כושר וספורט', 'mid', 'active', 'אורי מזרחי', { paymentStatus: 'paid' }),
  c('C15', 'נדל"ן 360', 'שרון גל', 'נדל"ן ותיווך', 'mid', 'active', 'יעל אדרי', { paymentStatus: 'paid' }),
  c('C16', 'משרד עו"ד ברק', 'ניר ברק', 'עריכת דין', 'mid', 'active', 'אורי מזרחי', { paymentStatus: 'paid' }),
  c('C17', 'דנטל קר', 'עמית לביא', 'רפואת שיניים', 'mid', 'active', 'יעל אדרי', { paymentStatus: 'paid' }),
  c('C18', 'אירועי הזהב', 'מירי זהבי', 'הפקת אירועים', 'mid', 'active', 'אורי מזרחי', { paymentStatus: 'paid' }),
  c('C19', 'טק סולושנס', 'רועי בר', 'טכנולוגיה ומחשוב', 'mid', 'active', 'יעל אדרי', {
    paymentStatus: 'paid',
    /* לקוח חדש – הצטרף בתחילת החודש הנוכחי */
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    renewalDate: new Date(new Date().getFullYear() + 1, new Date().getMonth(), 1).toISOString(),
  }),
  c('C20', 'סטודיו פוקוס', 'נטע אור', 'צילום והפקה', 'mid', 'active', 'אורי מזרחי', { paymentStatus: 'paid' }),
  c('C21', 'אלפא ייעוץ', 'דני אלפא', 'ייעוץ עסקי', 'premium', 'active', 'יעל אדרי', { paymentStatus: 'paid', addOns: [{ name: 'פלטפורמת שיווק נוספת', price: 500 }] }),
  c('C22', 'רשת מאפה טוב', 'שלומי טוב', 'מאפיות ומזון', 'premium', 'active', 'אורי מזרחי', { paymentStatus: 'paid' }),
  c('C23', 'אוטו טרייד', 'גיא קרן', 'רכב ותחבורה', 'premium', 'active', 'יעל אדרי', { paymentStatus: 'paid', addOns: [{ name: 'פלטפורמת שיווק נוספת', price: 500 }] }),
  c('C24', 'מדיקל ביוטי', 'ליאור עדן', 'רפואה אסתטית', 'premium', 'active', 'אורי מזרחי', { paymentStatus: 'paid' }),
  /* לקוחות שנמצאים כרגע בשלב ההקמה – מהם מגיעה תחזית ההכנסה */
  c('C25', 'עמית תעשיות', 'ניר עמית', 'תעשייה וייצור', 'premium', 'setup', 'יעל אדרי', { paymentStatus: 'paid' }),
  c('C26', 'סער עיצוב פנים', 'מאיה סער', 'עיצוב פנים', 'mid', 'setup', 'אורי מזרחי', { paymentStatus: 'paid' }),
  c('C27', 'שוקו ובוקר', 'עדי שוקרון', 'מסעדנות ובתי קפה', 'mid', 'setup', 'יעל אדרי', { paymentStatus: 'paid' }),
  c('C28', 'ריהוט בוקסה', 'עומר בוקסה', 'ריהוט ועיצוב הבית', 'standard', 'setup', 'אורי מזרחי', { paymentStatus: 'paid' }),
  /* לקוח מוקפא – שלב 6 במחזור החיים (סימון ידני, סעיף 3.1) */
  c('C29', 'סלון ורד', 'ורד יוקרה', 'עיצוב שיער', 'mid', 'frozen', 'יעל אדרי', { paymentStatus: 'paid', frozenReason: 'חוסר שביעות רצון – בתהליך שימור' }),
]

/* ===== משימות (סעיף 6) =====
   כל משימה כוללת את השדות מסעיף 6.3: תיאור, לקוח משויך, אחראי,
   תאריך פתיחה, יעד SLA, תאריך יעד, סטטוס ועדיפות.
   תאריך היעד נשמר כזמן מוחלט, כך שהמערכת מסמנת "באיחור" אוטומטית
   ברגע שהוא חלף.

   type: setup = משימת הקמה חד-פעמית | maintenance = תחזוקה שוטפת */
const now = Date.now()
const DAY_MS = 24 * 60 * 60 * 1000
const inDays = (d) => new Date(now + d * DAY_MS).toISOString()
const daysAgo = (d) => new Date(now - d * DAY_MS).toISOString()

const t = (id, title, clientId, assignee, opts) => ({
  id, title, clientId, assignee,
  type: opts.type || 'maintenance',
  slaKey: opts.sla || null,
  priority: opts.priority || 'normal',
  status: opts.status || 'open',
  openedAt: daysAgo(opts.opened ?? 3),
  dueAt: inDays(opts.due),
  recurring: opts.recurring || null,
  source: 'seed',
})

const seedTasks = [
  /* --- משימות הקמה (6.1) של הלקוחות שנמצאים בשלב ההקמה --- */
  t('T01', 'בניית אתר מלא', 'C25', 'יעל אדרי', { type: 'setup', sla: 'website', due: -2, opened: 23, priority: 'high' }),
  t('T02', 'הקמת שיווק אורגני בגוגל ו-AI', 'C25', 'יעל אדרי', { type: 'setup', sla: 'campaign', due: -1, opened: 8 }),
  t('T03', 'בניית דף נחיתה (פרימיום)', 'C25', 'יעל אדרי', { type: 'setup', sla: 'landingPremium', due: 3, opened: 2, status: 'inprogress' }),
  t('T04', 'פתיחת כרטיס גוגל עסקי', 'C25', 'יעל אדרי', { type: 'setup', sla: 'businessPage', due: 4, opened: 1 }),
  t('T05', 'הקמת CRM ללקוח', 'C26', 'יעל אדרי', { type: 'setup', sla: 'software', due: 6, opened: 7 }),
  t('T06', 'מייקאובר, יצירת גאנט והעלאת פוסטים', 'C26', 'יעל אדרי', { type: 'setup', sla: 'gantt', due: 2, opened: 1 }),
  t('T07', 'הקמת בוט וואטסאפ', 'C27', 'אורי מזרחי', { type: 'setup', sla: 'whatsappBot', due: 1, opened: 1, status: 'inprogress' }),
  t('T08', 'הרמת קמפיין שיווק ממומן', 'C27', 'אורי מזרחי', { type: 'setup', sla: 'campaign', due: 0.07, opened: 1, priority: 'high' }),
  t('T09', 'פתיחת עמודים עסקיים', 'C27', 'אורי מזרחי', { type: 'setup', sla: 'businessPage', due: 3, opened: 1 }),
  t('T10', 'הקמת מספר וירטואלי', 'C28', 'אורי מזרחי', { type: 'setup', sla: 'businessPage', due: 5, opened: 2 }),
  /* --- עבודה שוטפת מול לקוחות פעילים --- */
  t('T11', 'עדכון קמפיין גוגל', 'C05', 'רון לוי', { due: -3, opened: 6 }),
  t('T12', 'עיצוב מחדש של דף הנחיתה', 'C14', 'רון לוי', { due: 2, opened: 2, status: 'inprogress' }),
  t('T13', 'מייקאובר לעמוד האינסטגרם', 'C17', 'רון לוי', { due: 4, opened: 1 }),
  t('T14', 'בניית ביו שיווקי חדש', 'C21', 'רון לוי', { due: 6, opened: 1 }),
  t('T15', 'עריכת סרטון תדמית', 'C22', 'מאיה בר', { due: -4, opened: 9, priority: 'high' }),
  t('T16', 'צילום ועריכת UGC', 'C23', 'מאיה בר', { due: -1, opened: 4, status: 'inprogress' }),
  t('T17', 'הפקת ריל לקמפיין', 'C24', 'מאיה בר', { due: 3, opened: 1 }),
  t('T18', 'ניהול סושיאל שבועי', 'C18', 'אלון גל', { due: 1, opened: 2, recurring: 'שבועי' }),
  t('T19', 'סבב תיאום ציפיות', 'C02', 'יעל אדרי', { due: 5, opened: 1, priority: 'low' }),
  t('T20', 'בדיקת ביצועי קמפיין', 'C15', 'אורי מזרחי', { due: 7, opened: 1 }),
  /* --- משימות שהושלמו --- */
  t('T21', 'הקמת בוט וואטסאפ', 'C28', 'אורי מזרחי', { type: 'setup', sla: 'whatsappBot', due: -1, opened: 3, status: 'done' }),
  t('T22', 'פתיחת עמודים עסקיים', 'C26', 'יעל אדרי', { type: 'setup', sla: 'businessPage', due: -2, opened: 4, status: 'done' }),
  t('T23', 'הרמת קמפיין שיווק ממומן', 'C25', 'יעל אדרי', { type: 'setup', sla: 'campaign', due: -3, opened: 5, status: 'done' }),
]

/* ------------------------------------------------------------------
   משימות תחזוקה חוזרות (סעיף 6.3):
   "אפשרות להגדיר משימות חוזרות עבור תחזוקה שוטפת, שנפתחות
    אוטומטית מדי יום/שבוע".

   התבניות מוגדרות כאן, והמופע של היום נוצר אוטומטית בכל טעינה –
   משימה יומית עם יעד עד סוף היום, ושבועית עד סוף שבוע העבודה.
   כשנחבר שרת, אותן תבניות ירוצו בתזמון אמיתי בצד השרת.
   ------------------------------------------------------------------ */
export const recurringTemplates = [
  { key: 'paid-C01', title: 'תחזוקת שיווק ממומן', clientId: 'C01', assignee: 'אלון גל', sla: 'paidMaint', freq: 'יומי' },
  { key: 'paid-C21', title: 'תחזוקת שיווק ממומן', clientId: 'C21', assignee: 'יעל אדרי', sla: 'paidMaint', freq: 'יומי' },
  { key: 'organic-C22', title: 'תחזוקת שיווק אורגני', clientId: 'C22', assignee: 'אורי מזרחי', sla: 'organicMaint', freq: 'יומי' },
  { key: 'gantt-C14', title: 'יצירת גאנט + העלאת פוסטים', clientId: 'C14', assignee: 'אלון גל', sla: 'gantt', freq: 'שבועי' },
]

function endOfToday() {
  const d = new Date()
  d.setHours(23, 59, 0, 0)
  return d.toISOString()
}

function endOfWorkWeek() {
  const d = new Date()
  d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7))   // יום שישי הקרוב
  d.setHours(23, 59, 0, 0)
  return d.toISOString()
}

const todayKey = new Date().toISOString().slice(0, 10)

const todayRecurring = recurringTemplates.map((tpl) => ({
  id: `R-${tpl.key}-${todayKey}`,
  title: tpl.title,
  clientId: tpl.clientId,
  assignee: tpl.assignee,
  type: 'maintenance',
  slaKey: tpl.sla,
  priority: 'normal',
  status: 'open',
  openedAt: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
  dueAt: tpl.freq === 'יומי' ? endOfToday() : endOfWorkWeek(),
  recurring: tpl.freq,
  source: 'recurring',
}))

export const initialTasks = [...seedTasks, ...todayRecurring]

/* ===== נתונים פיננסיים (סעיפים 8–9) =====
   ההכנסות נגזרות מספר התשלומים (data/payments.js)
   וההוצאות מספר ההוצאות (data/expenses.js). */
export { buildPayments, monthKeyOf, monthLabelOf, currentMonthKey, PAYMENT_STATUS_LABELS, PAYMENT_KIND_LABELS, PAY_METHODS } from './payments.js'
export { EXPENSE_CATEGORIES, VAT_RATE, preVatOf } from './expenses.js'
export { DOC_FOLDERS, folderById, kindOfFile } from './documents.js'
import { buildPayments as _build } from './payments.js'
import { buildExpenses as _buildExp } from './expenses.js'
import { buildDocuments as _buildDocs } from './documents.js'
export const initialPayments = _build(initialClients)
export const initialExpenses = _buildExp()
export const initialDocuments = _buildDocs(initialClients)

/* ===== קבלני משנה (סעיף 13.7) ===== */
export const subcontractors = [
  { id: 1, name: 'אלון גל', field: 'ניהול סושיאל', avgHours: 0.7, slaRate: 97, completed: 41 },
  { id: 2, name: 'רון לוי', field: 'עיצוב ומייקאובר', avgHours: 1.6, slaRate: 94, completed: 23 },
  { id: 3, name: 'מאיה בר', field: 'וידאו ו-UGC', avgHours: 4.2, slaRate: 88, completed: 14 },
  { id: 4, name: 'נועם קיי', field: 'אתרי חנויות', avgHours: 9.5, slaRate: 72, completed: 6 },
]

/* תפקידי בעלי המשימות, לתצוגה בכרטיס "משימות לפי אחראי" */
export const assigneeRoles = {
  'יעל אדרי': 'מנהלת תפעול',
  'אורי מזרחי': 'איש מכירות',
  'רון לוי': 'קבלן משנה – עיצוב',
  'מאיה בר': 'קבלן משנה – וידאו',
  'אלון גל': 'קבלן משנה – סושיאל',
}

/* ===== עזרי תצוגה ===== */
export function formatCurrency(value) {
  return '₪' + Math.round(value).toLocaleString('he-IL')
}

export function monthlyValueOf(clients) {
  return clients.reduce((sum, cl) => sum + packageById[cl.packageId].price, 0)
}
