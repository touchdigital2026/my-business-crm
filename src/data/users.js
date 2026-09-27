/* ------------------------------------------------------------------
   משתמשים, תפקידים והרשאות – סעיף 2 באפיון.

   שלושה תפקידים:
     • מנהל-על – גישה מלאה לכל המערכת, כולל ניהול משתמשים
     • צוות – עובדים (מכירות, תפעול); המודולים נקבעים במטריצת ההרשאות
     • קבלן משנה – רואה רק את המשימות שהוקצו לו (סעיפים 2.2 + 7)
   ------------------------------------------------------------------ */

export const ROLES = [
  { id: 'super_admin', label: 'מנהל-על', tone: 'secondary', desc: 'גישה מלאה לכל המערכת, כולל ניהול משתמשים והרשאות' },
  { id: 'staff', label: 'צוות', tone: 'active', desc: 'עובדי מכירות ותפעול – לפי המודולים שהוגדרו בהרשאות' },
  { id: 'subcontractor', label: 'קבלן משנה', tone: 'muted', desc: 'רואה רק את המשימות שהוקצו לו, ללא נתונים כספיים' },
]
export const roleById = Object.fromEntries(ROLES.map((r) => [r.id, r]))

/* המודולים שאפשר לפתוח או לחסום – באותו סדר כמו בסרגל הצד */
export const MODULES = [
  { id: 'dashboard', label: 'דשבורד', note: 'כולל נתוני הכנסות ורווח' },
  { id: 'leads', label: 'לידים' },
  { id: 'clients', label: 'לקוחות' },
  { id: 'tasks', label: 'משימות' },
  { id: 'subcontractors', label: 'קבלני משנה' },
  { id: 'payments', label: 'תשלומים', note: 'נתונים כספיים' },
  { id: 'expenses', label: 'הוצאות', note: 'מנהלי-על בלבד (סעיף 9.4)' },
  { id: 'documents', label: 'מסמכים' },
  { id: 'users', label: 'משתמשים', note: 'מנהלי-על בלבד' },
  { id: 'reports', label: 'דוחות', note: 'נתונים כספיים' },
]

/* מודולים שנעולים למנהלי-על בלבד ואי אפשר לפתוח לתפקיד אחר */
export const ADMIN_ONLY_MODULES = ['expenses', 'users']

/* ברירת המחדל של מטריצת ההרשאות. מנהל-על תמיד רואה הכל. */
export const DEFAULT_PERMISSIONS = {
  staff: ['leads', 'clients', 'tasks', 'subcontractors', 'documents'],
  subcontractor: ['tasks'],
}

/* המודולים שמשתמש רשאי לראות */
export function allowedModules(role, permissions) {
  if (role === 'super_admin') return MODULES.map((m) => m.id)
  return (permissions[role] || []).filter((id) => !ADMIN_ONLY_MODULES.includes(id))
}

export const USER_STATUS_LABELS = {
  active: { label: 'פעיל', tone: 'active' },
  invited: { label: 'הוזמן – ממתין לכניסה', tone: 'pending' },
  expired: { label: 'ההזמנה פגה', tone: 'late' },
  disabled: { label: 'מושבת', tone: 'muted' },
}

/* תוקף קישור ההזמנה (סעיף 2.2) */
export const INVITE_HOURS = 48

/* "הוזמן" שעבר את תוקף ההזמנה מוצג כ"פג תוקף" */
export function statusOf(user, now = Date.now()) {
  if (user.status === 'invited' && user.inviteExpiresAt && new Date(user.inviteExpiresAt).getTime() < now) {
    return 'expired'
  }
  return user.status
}

/* סיסמת הדמו של כל משתמשי הדמו */
export const DEMO_PASSWORD = '123456'

const daysAgo = (d, h = 10) => {
  const date = new Date()
  date.setDate(date.getDate() - d)
  date.setHours(h, 12, 0, 0)
  return date.toISOString()
}
const hoursFromNow = (h) => new Date(Date.now() + h * 60 * 60 * 1000).toISOString()

/* ===== צוות הדמו ===== */
export const initialUsers = [
  {
    id: 'U01', name: 'מנהל המערכת', email: 'admin@crm.co.il', phone: '050-1234567',
    role: 'super_admin', title: 'בעלים', status: 'active',
    invitedAt: daysAgo(420), lastLoginAt: daysAgo(0, 8),
  },
  {
    id: 'U02', name: 'יעל אדרי', email: 'yael@crm.co.il', phone: '052-7719304',
    role: 'staff', title: 'מנהלת תפעול', status: 'active',
    invitedAt: daysAgo(390), lastLoginAt: daysAgo(0, 9),
  },
  {
    id: 'U03', name: 'אורי מזרחי', email: 'ori@crm.co.il', phone: '054-3308127',
    role: 'staff', title: 'איש מכירות', status: 'active',
    invitedAt: daysAgo(240), lastLoginAt: daysAgo(1, 17),
  },
  {
    id: 'U04', name: 'אלון גל', email: 'alon.social@gmail.com', phone: '052-8841360',
    role: 'subcontractor', title: 'ניהול סושיאל', status: 'active', subcontractorId: 1,
    invitedAt: daysAgo(200), lastLoginAt: daysAgo(2, 11),
  },
  {
    id: 'U05', name: 'רון לוי', email: 'ron.design@gmail.com', phone: '054-6120583',
    role: 'subcontractor', title: 'עיצוב ומייקאובר', status: 'active', subcontractorId: 2,
    invitedAt: daysAgo(150), lastLoginAt: daysAgo(6, 14),
  },
  {
    id: 'U06', name: 'מאיה בר', email: 'maya.video@gmail.com', phone: '050-7733914',
    role: 'subcontractor', title: 'וידאו ו-UGC', status: 'invited', subcontractorId: 3,
    invitedAt: hoursFromNow(-20), inviteExpiresAt: hoursFromNow(INVITE_HOURS - 20),
  },
]
