/* ------------------------------------------------------------------
   נתוני דמו לדשבורד.
   הכל כתוב כאן במקום אחד, כך שקל להחליף בהמשך בנתונים אמיתיים
   שיגיעו מהשרת – בלי לגעת בעיצוב או ברכיבים.
   ------------------------------------------------------------------ */

// ארבעת המדדים שמופיעים בראש הדשבורד
export const kpis = [
  {
    id: 'leads',
    label: 'לידים חדשים',
    value: 128,
    format: 'number',
    delta: 12.4,
    goodDirection: 'up',
    trend: [62, 71, 68, 84, 79, 95, 102, 97, 110, 118, 114, 128],
  },
  {
    id: 'deals',
    label: 'עסקאות שנסגרו',
    value: 34,
    format: 'number',
    delta: 8.1,
    goodDirection: 'up',
    trend: [18, 21, 19, 24, 22, 27, 25, 29, 28, 31, 30, 34],
  },
  {
    id: 'revenue',
    label: 'הכנסות החודש',
    value: 182400,
    format: 'currency',
    delta: 5.7,
    goodDirection: 'up',
    trend: [96, 108, 104, 121, 118, 133, 129, 145, 152, 161, 172, 182],
  },
  {
    id: 'conversion',
    label: 'שיעור המרה',
    value: 26.6,
    format: 'percent',
    delta: -1.8,
    goodDirection: 'up',
    trend: [29, 30, 28, 29, 27, 30, 28, 30, 29, 28, 28, 27],
  },
]

// הגרף המרכזי – לידים מול עסקאות שנסגרו, לפי חודש
export const monthlyPerformance = [
  { month: 'ינו', leads: 62, deals: 18 },
  { month: 'פבר', leads: 71, deals: 21 },
  { month: 'מרץ', leads: 84, deals: 24 },
  { month: 'אפר', leads: 79, deals: 22 },
  { month: 'מאי', leads: 95, deals: 27 },
  { month: 'יונ', leads: 102, deals: 29 },
  { month: 'יול', leads: 118, deals: 31 },
  { month: 'אוג', leads: 128, deals: 34 },
]

// מאיפה מגיעים הלידים
export const leadSources = [
  { name: 'פייסבוק ואינסטגרם', value: 46 },
  { name: 'גוגל Ads', value: 31 },
  { name: 'אתר האינטרנט', value: 24 },
  { name: 'המלצות מלקוחות', value: 17 },
  { name: 'לינקדאין', value: 10 },
]

/* סטטוסים אפשריים לליד.
   tone קובע את הצבע, אבל הטקסט תמיד מוצג – הצבע לעולם אינו המידע היחיד. */
export const leadStatuses = {
  new: { label: 'חדש', tone: 'info' },
  working: { label: 'בטיפול', tone: 'warning' },
  proposal: { label: 'הצעה נשלחה', tone: 'serious' },
  won: { label: 'נסגר בהצלחה', tone: 'good' },
  lost: { label: 'לא רלוונטי', tone: 'critical' },
}

export const recentLeads = [
  { id: 1, name: 'דנה כהן', company: 'סטודיו לין', source: 'פייסבוק', value: 12000, status: 'new', date: '19.08' },
  { id: 2, name: 'אורי מזרחי', company: 'מזרחי נדל"ן', source: 'גוגל Ads', value: 38000, status: 'proposal', date: '18.08' },
  { id: 3, name: 'שירה לוי', company: 'Bloom קוסמטיקה', source: 'אתר', value: 24500, status: 'working', date: '18.08' },
  { id: 4, name: 'יוסי אברהם', company: 'טכנופלוס', source: 'המלצה', value: 51000, status: 'won', date: '17.08' },
  { id: 5, name: 'נועה פרידמן', company: 'קפה נועה', source: 'אינסטגרם', value: 8000, status: 'new', date: '17.08' },
  { id: 6, name: 'רון שגיא', company: 'שגיא ייעוץ עסקי', source: 'לינקדאין', value: 16500, status: 'lost', date: '16.08' },
]

export const todayTasks = [
  { id: 1, title: 'שיחת מעקב עם דנה כהן', time: '09:30', done: true },
  { id: 2, title: 'שליחת הצעת מחיר – מזרחי נדל"ן', time: '11:00', done: true },
  { id: 3, title: 'פגישת זום עם Bloom קוסמטיקה', time: '14:00', done: false },
  { id: 4, title: 'עדכון קמפיין גוגל – טכנופלוס', time: '16:30', done: false },
  { id: 5, title: 'סיכום שבועי ודוח ללקוחות', time: '18:00', done: false },
]
