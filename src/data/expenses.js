/* ------------------------------------------------------------------
   ספר ההוצאות והקבלות (סעיף 9 באפיון).
   כל רשומה כוללת את השדות מסעיף 9.1: תאריך, סכום (כולל/לפני מע"מ),
   קטגוריה, ספק, אמצעי תשלום, קובץ קבלה מצורף, הערות ומי הזין.
   כשנחבר שרת – רק הקובץ הזה יוחלף.
   ------------------------------------------------------------------ */
import { monthKeyOf } from './payments.js'

export const VAT_RATE = 0.18

/* הקטגוריות מסעיף 9.1 – עם אפשרות להוסיף חדשות דרך הממשק */
export const EXPENSE_CATEGORIES = [
  { id: 'subcontractor', name: 'תשלום לקבלן משנה' },
  { id: 'software', name: 'מינוי תוכנה / אחסון' },
  { id: 'vrsl', name: 'שירותי VRSL' },
  { id: 'equipment', name: 'ציוד' },
  { id: 'marketing', name: 'שיווק' },
  { id: 'other', name: 'אחר' },
]

/* ההוצאות הקבועות – מינויים חודשיים שחוזרים כל חודש (סעיף 9.3) */
const RECURRING_ITEMS = [
  { vendor: 'upress – אחסון ודומיינים', category: 'software', amount: 900 },
  { vendor: 'Adobe Creative Cloud', category: 'software', amount: 1200 },
  { vendor: 'כלי AI (מנויים)', category: 'software', amount: 1400 },
  { vendor: 'Rav Messer – מערכת דיוור', category: 'software', amount: 550 },
  { vendor: 'Metricool – ניהול סושיאל', category: 'software', amount: 1350 },
  { vendor: 'VRSL תקשורת', category: 'vrsl', amount: 3800 },
]

/* ההוצאות המשתנות לכל חודש (0 = לפני 5 חודשים ... 5 = החודש).
   תשלומי קבלני המשנה מקושרים לכרטיסי הקבלנים הקיימים. */
const SUBS = [
  { name: 'רון לוי', id: 2 },
  { name: 'מאיה בר', id: 3 },
  { name: 'אלון גל', id: 1 },
  { name: 'נועם קיי', id: 4 },
]
const MONTHLY_PLAN = [
  { subs: [4000, 3400, 1200, 1000], marketing: 2400, equipment: 700, other: 500 },
  { subs: [4400, 3800, 1300, 1200], marketing: 2600, equipment: 1000, other: 600 },
  { subs: [4200, 3900, 1400, 1100], marketing: 2500, equipment: 900, other: 600 },
  { subs: [4600, 4300, 1500, 1300], marketing: 2800, equipment: 1200, other: 700 },
  { subs: [4700, 4600, 1600, 1400], marketing: 3000, equipment: 1600, other: 800 },
  { subs: [4800, 5200, 1700, 1500], marketing: 3100, equipment: 1900, other: 1000 },
]

/* רשומות החודש הנוכחי שעדיין חסרה להן קבלה – להדגמת המעקב */
const MISSING_RECEIPT_CURRENT = new Set(['equipment', 'other'])

export function buildExpenses() {
  const out = []
  const now = new Date()

  MONTHLY_PLAN.forEach((plan, i) => {
    const monthsAgo = MONTHLY_PLAN.length - 1 - i
    const base = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1)
    const key = monthKeyOf(base)
    const isCurrent = monthsAgo === 0
    const day = (d) => new Date(base.getFullYear(), base.getMonth(), d).toISOString()
    const push = (n, rec) => out.push({ id: `E-${key}-${n}`, monthKey: key, enteredBy: 'מנהל המערכת', notes: '', ...rec })

    let n = 0
    /* מינויים קבועים – מתחדשים ב-1 לחודש */
    for (const item of RECURRING_ITEMS) {
      push(n++, {
        date: day(1),
        amount: item.amount,
        categoryId: item.category,
        vendor: item.vendor,
        method: 'כרטיס אשראי',
        recurring: true,
        receipt: { name: `חשבונית-${item.vendor.split(' ')[0]}-${key}.pdf`, kind: 'PDF' },
      })
    }
    /* תשלומים לקבלני משנה – מקושרים לכרטיס הקבלן */
    plan.subs.forEach((amount, j) => {
      push(n++, {
        date: day(25),
        amount,
        categoryId: 'subcontractor',
        vendor: SUBS[j].name,
        subcontractorId: SUBS[j].id,
        method: 'העברה בנקאית',
        receipt: { name: `קבלה-${SUBS[j].name}-${key}.pdf`, kind: 'PDF' },
      })
    })
    /* שיווק, ציוד ואחר */
    const variable = [
      { categoryId: 'marketing', vendor: 'Meta Ads', amount: plan.marketing, method: 'כרטיס אשראי', d: 10 },
      { categoryId: 'equipment', vendor: 'KSP מחשבים', amount: plan.equipment, method: 'כרטיס אשראי', d: 15 },
      { categoryId: 'other', vendor: 'הוצאות משרד שונות', amount: plan.other, method: 'העברה בנקאית', d: 18 },
    ]
    for (const item of variable) {
      const missing = isCurrent && MISSING_RECEIPT_CURRENT.has(item.categoryId)
      push(n++, {
        date: day(item.d),
        amount: item.amount,
        categoryId: item.categoryId,
        vendor: item.vendor,
        method: item.method,
        receipt: missing ? null : { name: `קבלה-${item.categoryId}-${key}.pdf`, kind: 'PDF' },
      })
    }
  })

  return out
}

/* סכום לפני מע"מ, מתוך הסכום הכולל */
export function preVatOf(amount) {
  return Math.round(amount / (1 + VAT_RATE))
}
