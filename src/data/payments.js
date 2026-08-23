/* ------------------------------------------------------------------
   ספר התשלומים (סעיף 8 באפיון).
   כל רשומת תשלום: לקוח, סכום, תאריך, אמצעי תשלום, סטטוס,
   וסוג החיוב – חודשי (לפי החבילה), תוספת, או חד-פעמי.

   הרשומות נבנות דטרמיניסטית מרשימת הלקוחות עבור 6 החודשים
   האחרונים; לקוח מחויב רק מחודש תחילת ההתקשרות שלו, ולכן
   ההכנסה בדוחות גדלה באופן טבעי עם הצטרפות לקוחות.
   כשנחבר שרת – רק הקובץ הזה יוחלף.
   ------------------------------------------------------------------ */
import { packageById } from './packages.js'

export const PAY_METHODS = ['הוראת קבע', 'כרטיס אשראי', 'העברה בנקאית']

/* לקוחות שהחשבונית של החודש הנוכחי שלהם עדיין ממתינה לתשלום */
const PENDING_THIS_MONTH = new Set(['C14'])

/* חיובים חד-פעמיים (סעיף 8: "תשלום חד-פעמי מול תשלום חודשי חוזר") */
const ONE_OFF_CHARGES = [
  { clientId: 'C16', title: 'עיצוב דף נחיתה נוסף', amount: 800, monthsAgo: 2 },
  { clientId: 'C24', title: 'הפקת צילומי תדמית', amount: 1500, monthsAgo: 2 },
]

function hashOf(id) {
  let h = 0
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 9973
  return h
}

export function monthKeyOf(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function monthLabelOf(monthKey) {
  const [y, m] = monthKey.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })
}

export const currentMonthKey = () => monthKeyOf(new Date())

export function buildPayments(clients) {
  const out = []
  const now = new Date()
  const currentKey = currentMonthKey()

  for (let k = 5; k >= 0; k--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - k, 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - k + 1, 0, 23, 59)
    const key = monthKeyOf(monthStart)

    for (const client of clients) {
      /* לקוח בהקמה טרם מחויב; לקוח מוקפא – החיוב מושהה */
      if (client.status !== 'active') continue
      if (new Date(client.startDate) > monthEnd) continue

      const h = hashOf(client.id)
      const isCurrent = key === currentKey
      const price = packageById[client.packageId].price
      let status = 'paid'
      let date = new Date(monthStart.getFullYear(), monthStart.getMonth(), 3 + (h % 5)).toISOString()

      if (isCurrent && client.paymentStatus === 'overdue') {
        status = 'overdue'
        /* תאריך היעד שחלף – מסתנכרן עם "ימי האיחור" של הלקוח */
        date = new Date(Date.now() - client.overdueDays * 24 * 60 * 60 * 1000).toISOString()
      } else if (isCurrent && PENDING_THIS_MONTH.has(client.id)) {
        status = 'pending'
      }

      out.push({
        id: `P-${client.id}-${key}`,
        clientId: client.id,
        monthKey: key,
        date,
        amount: price,
        method: PAY_METHODS[h % PAY_METHODS.length],
        status,
        kind: 'monthly',
        invoice: `INV-${1000 + ((h + k * 37) % 900)}`,
        packageId: client.packageId,
      })

      /* מעקב תוספות בתשלום – למשל פלטפורמת שיווק נוספת (סעיף 8) */
      for (const addon of client.addOns || []) {
        out.push({
          id: `P-${client.id}-${key}-addon`,
          clientId: client.id,
          monthKey: key,
          date,
          amount: addon.price,
          method: PAY_METHODS[h % PAY_METHODS.length],
          status,
          kind: 'addon',
          addOnName: addon.name,
          invoice: `INV-${1000 + ((h + k * 37 + 11) % 900)}`,
          packageId: client.packageId,
        })
      }
    }
  }

  for (const charge of ONE_OFF_CHARGES) {
    const d = new Date(now.getFullYear(), now.getMonth() - charge.monthsAgo, 12)
    out.push({
      id: `P-${charge.clientId}-oneoff-${charge.monthsAgo}`,
      clientId: charge.clientId,
      monthKey: monthKeyOf(d),
      date: d.toISOString(),
      amount: charge.amount,
      method: 'העברה בנקאית',
      status: 'paid',
      kind: 'oneoff',
      oneOffTitle: charge.title,
      invoice: `INV-${1400 + hashOf(charge.clientId) % 90}`,
    })
  }

  return out
}

export const PAYMENT_STATUS_LABELS = {
  paid: { label: 'שולם', tone: 'active' },
  pending: { label: 'ממתין', tone: 'pending' },
  overdue: { label: 'באיחור', tone: 'late' },
}

export const PAYMENT_KIND_LABELS = {
  monthly: 'חיוב חודשי',
  addon: 'תוספת',
  oneoff: 'חד-פעמי',
}
