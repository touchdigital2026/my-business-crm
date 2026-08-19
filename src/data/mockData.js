/* ------------------------------------------------------------------
   נתוני הדשבורד – בנויים לפי סעיף 13 באפיון (דוחות ולוח בקרה).
   כל מספר שמופיע על המסך מגיע מכאן, כדי שיהיה קל להחליף בהמשך
   בנתונים אמיתיים מהשרת בלי לגעת בעיצוב.
   ------------------------------------------------------------------ */

/* ===== החבילות, לפי סעיף 5 באפיון ===== */
export const packages = [
  { id: 'standard', name: 'סטנדרט', price: 2000, tier: 1 },
  { id: 'mid', name: 'ביניים', price: 3000, tier: 2 },
  { id: 'premium', name: 'פרימיום', price: 5000, tier: 3 },
]

/* ===== 13.1 – לקוחות פעילים לפי חבילה ===== */
export const clientsByPackage = [
  { packageId: 'standard', active: 11, inSetup: 1 },
  { packageId: 'mid', active: 8, inSetup: 2 },
  { packageId: 'premium', active: 5, inSetup: 1 },
]

/* ===== 13.2 – הכנסה חודשית ותחזית מחבילות בהקמה =====
   ההכנסה בפועל מגיעה מלקוחות פעילים; התחזית מלקוחות שנמצאים
   בשלב "בהקמה" ויתחילו לחייב עם סיום ההקמה. */
export const revenue = {
  actual: 71000,      // 11×2,000 + 8×3,000 + 5×5,000
  forecast: 11000,    // 1×2,000 + 2×3,000 + 1×5,000 = בהקמה
  previousMonth: 66000,
  addOns: 2500,       // תוספות בתשלום (פלטפורמת שיווק נוספת וכו')
}

/* ===== 13.3 – הוצאות חודשיות ורווח/הפסד ===== */
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

/* מגמת הכנסות מול הוצאות – 6 החודשים האחרונים */
export const monthlyFinance = [
  { month: 'מרץ', income: 52000, expense: 22400 },
  { month: 'אפר', income: 57000, expense: 24100 },
  { month: 'מאי', income: 59000, expense: 23800 },
  { month: 'יונ', income: 63000, expense: 25600 },
  { month: 'יול', income: 66000, expense: 26900 },
  { month: 'אוג', income: 71000, expense: 28400 },
]

/* ===== 13.4 – משימות פתוחות ובאיחור, סה"כ ולפי אחראי ===== */
export const tasks = {
  open: 18,
  overdue: 5,
  dueToday: 6,
  byAssignee: [
    { name: 'יעל אדרי', role: 'מנהלת תפעול', open: 6, overdue: 2 },
    { name: 'אורי מזרחי', role: 'איש מכירות', open: 4, overdue: 0 },
    { name: 'רון לוי', role: 'קבלן משנה – עיצוב', open: 4, overdue: 1 },
    { name: 'מאיה בר', role: 'קבלן משנה – וידאו', open: 3, overdue: 2 },
    { name: 'אלון גל', role: 'קבלן משנה – סושיאל', open: 1, overdue: 0 },
  ],
}

/* ===== 13.5 – פייפליין מכירות: לידים בכל שלב ואחוז המרה =====
   השלבים לפי סעיף 4.1 באפיון. */
export const pipeline = {
  stages: [
    { name: 'ליד חדש', count: 14 },
    { name: 'יצירת קשר ראשוני', count: 9 },
    { name: 'נשלחה הצעת מחיר', count: 7 },
    { name: 'פגישה / שיחת מכירה', count: 5 },
    { name: 'משא ומתן', count: 3 },
  ],
  // 30 הימים האחרונים
  enteredLast30: 38,
  wonLast30: 9,
  lostLast30: 6,
}

/* ===== 13.6 – לקוחות בסיכון תשלום =====
   שתי סיבות אפשריות לפי האפיון: איחור בתשלום, או חוסר פעילות. */
export const atRiskClients = [
  { id: 1, business: 'מזרחי נדל"ן', packageId: 'premium', reason: 'overdue', days: 24, amount: 5000, owner: 'יעל אדרי' },
  { id: 2, business: 'Bloom קוסמטיקה', packageId: 'mid', reason: 'overdue', days: 12, amount: 3000, owner: 'יעל אדרי' },
  { id: 3, business: 'קפה נועה', packageId: 'standard', reason: 'inactive', days: 47, amount: 0, owner: 'אורי מזרחי' },
  { id: 4, business: 'שגיא ייעוץ עסקי', packageId: 'standard', reason: 'overdue', days: 8, amount: 2000, owner: 'יעל אדרי' },
  { id: 5, business: 'טכנופלוס', packageId: 'mid', reason: 'inactive', days: 33, amount: 0, owner: 'אורי מזרחי' },
]

/* ===== 13.7 – ביצועי קבלני משנה: זמן ממוצע להשלמת משימה ===== */
export const subcontractors = [
  { id: 1, name: 'אלון גל', field: 'ניהול סושיאל', avgHours: 0.7, slaRate: 97, completed: 41 },
  { id: 2, name: 'רון לוי', field: 'עיצוב ומייקאובר', avgHours: 1.6, slaRate: 94, completed: 23 },
  { id: 3, name: 'מאיה בר', field: 'וידאו ו-UGC', avgHours: 4.2, slaRate: 88, completed: 14 },
  { id: 4, name: 'נועם קיי', field: 'אתרי חנויות', avgHours: 9.5, slaRate: 72, completed: 6 },
]

/* ===== עזרי תצוגה ===== */
export const packageById = Object.fromEntries(packages.map((p) => [p.id, p]))

export function formatCurrency(value) {
  return '₪' + Math.round(value).toLocaleString('he-IL')
}

/* ממיר סכום גדול לצורה מקוצרת (₪71.0K) לשימוש בכותרות מספר גדולות */
export function formatCurrencyShort(value) {
  if (Math.abs(value) >= 1000) return '₪' + (value / 1000).toFixed(1) + 'K'
  return formatCurrency(value)
}
