/* ------------------------------------------------------------------
   נתוני הדמו של המערכת.
   הכל כתוב כאן במקום אחד, כדי שיהיה קל להחליף בהמשך בנתונים
   אמיתיים מהשרת בלי לגעת בעיצוב או ברכיבים.
   ------------------------------------------------------------------ */
export { packages, packageById, SLA, setupTasksFor, formatSla } from './packages.js'
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
   status: active = תחזוקה שוטפת | setup = בהקמה (סעיף 3.1) */
const c = (id, business, contact, packageId, status, owner, extra = {}) =>
  ({ id, business, contact, packageId, status, owner, ...extra })

export const initialClients = [
  c('C01', 'מזרחי נדל"ן', 'אורי מזרחי', 'premium', 'active', 'יעל אדרי', { paymentStatus: 'overdue', overdueDays: 24, overdueAmount: 5000 }),
  c('C02', 'Bloom קוסמטיקה', 'שירה לוי', 'mid', 'active', 'יעל אדרי', { paymentStatus: 'overdue', overdueDays: 12, overdueAmount: 3000 }),
  c('C03', 'קפה נועה', 'נועה פרידמן', 'standard', 'active', 'אורי מזרחי', { paymentStatus: 'paid', inactiveDays: 47 }),
  c('C04', 'שגיא ייעוץ עסקי', 'רון שגיא', 'standard', 'active', 'יעל אדרי', { paymentStatus: 'overdue', overdueDays: 8, overdueAmount: 2000 }),
  c('C05', 'טכנופלוס', 'יוסי אברהם', 'mid', 'active', 'אורי מזרחי', { paymentStatus: 'paid', inactiveDays: 33 }),
  c('C06', 'לין סטודיו', 'דנה לין', 'standard', 'active', 'יעל אדרי', { paymentStatus: 'paid' }),
  c('C07', 'אורבן פיצה', 'טום אורבך', 'standard', 'active', 'יעל אדרי', { paymentStatus: 'paid' }),
  c('C08', 'גרין גארדן', 'ליאת גרין', 'standard', 'active', 'אורי מזרחי', { paymentStatus: 'paid' }),
  c('C09', 'קליניקת ד"ר שני', 'שני רז', 'standard', 'active', 'יעל אדרי', { paymentStatus: 'paid' }),
  c('C10', 'מוסך אבי', 'אבי חן', 'standard', 'active', 'אורי מזרחי', { paymentStatus: 'paid' }),
  c('C11', 'סטייל ביוטי', 'רינת סתיו', 'standard', 'active', 'יעל אדרי', { paymentStatus: 'paid' }),
  c('C12', 'בוטיק אלה', 'אלה נבו', 'standard', 'active', 'אורי מזרחי', { paymentStatus: 'paid' }),
  c('C13', 'הנדימן פלוס', 'מוטי דהן', 'standard', 'active', 'יעל אדרי', { paymentStatus: 'paid' }),
  c('C14', 'פיט קלאב', 'עידו שרון', 'mid', 'active', 'אורי מזרחי', { paymentStatus: 'paid' }),
  c('C15', 'נדל"ן 360', 'שרון גל', 'mid', 'active', 'יעל אדרי', { paymentStatus: 'paid' }),
  c('C16', 'משרד עו"ד ברק', 'ניר ברק', 'mid', 'active', 'אורי מזרחי', { paymentStatus: 'paid' }),
  c('C17', 'דנטל קר', 'עמית לביא', 'mid', 'active', 'יעל אדרי', { paymentStatus: 'paid' }),
  c('C18', 'אירועי הזהב', 'מירי זהבי', 'mid', 'active', 'אורי מזרחי', { paymentStatus: 'paid' }),
  c('C19', 'טק סולושנס', 'רועי בר', 'mid', 'active', 'יעל אדרי', { paymentStatus: 'paid' }),
  c('C20', 'סטודיו פוקוס', 'נטע אור', 'mid', 'active', 'אורי מזרחי', { paymentStatus: 'paid' }),
  c('C21', 'אלפא ייעוץ', 'דני אלפא', 'premium', 'active', 'יעל אדרי', { paymentStatus: 'paid' }),
  c('C22', 'רשת מאפה טוב', 'שלומי טוב', 'premium', 'active', 'אורי מזרחי', { paymentStatus: 'paid' }),
  c('C23', 'אוטו טרייד', 'גיא קרן', 'premium', 'active', 'יעל אדרי', { paymentStatus: 'paid' }),
  c('C24', 'מדיקל ביוטי', 'ליאור עדן', 'premium', 'active', 'אורי מזרחי', { paymentStatus: 'paid' }),
  /* לקוחות שנמצאים כרגע בשלב ההקמה – מהם מגיעה תחזית ההכנסה */
  c('C25', 'עמית תעשיות', 'ניר עמית', 'premium', 'setup', 'יעל אדרי', { paymentStatus: 'paid' }),
  c('C26', 'סער עיצוב פנים', 'מאיה סער', 'mid', 'setup', 'אורי מזרחי', { paymentStatus: 'paid' }),
  c('C27', 'שוקו ובוקר', 'עדי שוקרון', 'mid', 'setup', 'יעל אדרי', { paymentStatus: 'paid' }),
  c('C28', 'ריהוט בוקסה', 'עומר בוקסה', 'standard', 'setup', 'אורי מזרחי', { paymentStatus: 'paid' }),
]

/* ===== משימות =====
   תאריך היעד נשמר כזמן מוחלט, כך שהמערכת מסמנת "באיחור" אוטומטית
   ברגע שהוא חלף – בדיוק כפי שדורש סעיף 6.3. */
const now = Date.now()
const inDays = (d) => new Date(now + d * 24 * 60 * 60 * 1000).toISOString()

const t = (id, title, clientId, assignee, dueInDays, status = 'open') =>
  ({ id, title, clientId, assignee, dueAt: inDays(dueInDays), status, source: 'seed' })

export const initialTasks = [
  t('T01', 'בניית אתר מלא', 'C25', 'יעל אדרי', -2),
  t('T02', 'הקמת שיווק אורגני בגוגל ו-AI', 'C25', 'יעל אדרי', -1),
  t('T03', 'בניית דף נחיתה (פרימיום)', 'C25', 'יעל אדרי', 3),
  t('T04', 'פתיחת כרטיס גוגל עסקי', 'C25', 'יעל אדרי', 4),
  t('T05', 'הקמת CRM ללקוח', 'C26', 'יעל אדרי', 6),
  t('T06', 'מייקאובר, יצירת גאנט והעלאת פוסטים', 'C26', 'יעל אדרי', 2),
  t('T07', 'הקמת בוט וואטסאפ', 'C27', 'אורי מזרחי', 1),
  t('T08', 'הרמת קמפיין שיווק ממומן', 'C27', 'אורי מזרחי', 2),
  t('T09', 'פתיחת עמודים עסקיים', 'C27', 'אורי מזרחי', 3),
  t('T10', 'הקמת מספר וירטואלי', 'C28', 'אורי מזרחי', 5),
  t('T11', 'עדכון קמפיין גוגל', 'C05', 'רון לוי', -3),
  t('T12', 'עיצוב מחדש של דף הנחיתה', 'C14', 'רון לוי', 2),
  t('T13', 'מייקאובר לעמוד האינסטגרם', 'C17', 'רון לוי', 4),
  t('T14', 'בניית ביו שיווקי חדש', 'C21', 'רון לוי', 6),
  t('T15', 'עריכת סרטון תדמית', 'C22', 'מאיה בר', -4),
  t('T16', 'צילום ועריכת UGC', 'C23', 'מאיה בר', -1),
  t('T17', 'הפקת ריל לקמפיין', 'C24', 'מאיה בר', 3),
  t('T18', 'ניהול סושיאל שבועי', 'C18', 'אלון גל', 1),
  t('T19', 'סבב תיאום ציפיות', 'C02', 'יעל אדרי', 5),
  t('T20', 'בדיקת ביצועי קמפיין', 'C15', 'אורי מזרחי', 7),
  t('T21', 'הקמת בוט וואטסאפ', 'C28', 'אורי מזרחי', -1, 'done'),
  t('T22', 'פתיחת עמודים עסקיים', 'C26', 'יעל אדרי', -2, 'done'),
  t('T23', 'הרמת קמפיין שיווק ממומן', 'C25', 'יעל אדרי', -3, 'done'),
]

/* ===== נתונים פיננסיים (סעיפים 8–9) ===== */
export const monthlyFinance = [
  { month: 'מרץ', income: 52000, expense: 22400 },
  { month: 'אפר', income: 57000, expense: 24100 },
  { month: 'מאי', income: 59000, expense: 23800 },
  { month: 'יונ', income: 63000, expense: 25600 },
  { month: 'יול', income: 66000, expense: 26900 },
  { month: 'אוג', income: 72000, expense: 28400 },
]

export const expenses = {
  total: 28400,
  previousMonth: 26900,
  byCategory: [
    { name: 'תשלום לקבלני משנה', amount: 13200 },
    { name: 'מינויי תוכנה ואחסון', amount: 5400 },
    { name: 'שירותי VRSL', amount: 3800 },
    { name: 'שיווק', amount: 3100 },
    { name: 'ציוד', amount: 1900 },
    { name: 'אחר', amount: 1000 },
  ],
}

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
