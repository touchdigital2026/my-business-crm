import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { CrmProvider, useCrm } from './CrmContext.jsx'
import { setupTasksFor, currentMonthKey } from '../data/mockData.js'

/* ------------------------------------------------------------------
   הפעולות העסקיות המרכזיות של המערכת. כל בדיקה מתחילה ממחסן נקי
   עם נתוני הדמו, מבצעת פעולה, ובודקת את כל ההשפעות שלה.
   ------------------------------------------------------------------ */
const admin = { id: 'U01', role: 'super_admin' }
function setup(user = admin) {
  const wrapper = ({ children }) => <CrmProvider user={user}>{children}</CrmProvider>
  return renderHook(() => useCrm(), { wrapper }).result
}

describe('המרת ליד ללקוח (סעיף 4.3)', () => {
  it('הליד נסגר, נפתח לקוח בהקמה, נוצרות משימות ההקמה וההסכם', () => {
    const crm = setup()
    const lead = crm.current.leads.find((l) => l.status === 'active')
    const before = {
      clients: crm.current.clients.length,
      tasks: crm.current.tasks.length,
      docs: crm.current.allDocuments.length,
      activeLeads: crm.current.activeLeads.length,
    }

    let result
    act(() => { result = crm.current.convertLead(lead.id) })

    const client = crm.current.clients.find((c) => c.id === result.client.id)
    expect(client.status).toBe('setup')
    expect(client.business).toBe(lead.business)
    expect(client.packageId).toBe(lead.packageId)

    expect(crm.current.leads.find((l) => l.id === lead.id)).toMatchObject({ status: 'won', convertedTo: client.id })
    expect(crm.current.activeLeads).toHaveLength(before.activeLeads - 1)

    const expectedTasks = setupTasksFor(lead.packageId).length
    expect(crm.current.clients).toHaveLength(before.clients + 1)
    expect(crm.current.tasks).toHaveLength(before.tasks + expectedTasks)
    expect(crm.current.tasks.filter((t) => t.clientId === client.id)).toHaveLength(expectedTasks)
    for (const task of result.tasks) {
      expect(new Date(task.dueAt).getTime()).toBeGreaterThan(Date.now())
    }

    const contract = crm.current.allDocuments.find((d) => d.clientId === client.id && d.folderId === 'contracts')
    expect(contract).toBeDefined()
    expect(crm.current.allDocuments).toHaveLength(before.docs + 1)
  })

  it('לקוח בהקמה נכנס לתחזית ההכנסה ולא להכנסה בפועל', () => {
    const crm = setup()
    const lead = crm.current.leads.find((l) => l.status === 'active')
    const { actual, forecast } = crm.current.revenue
    act(() => { crm.current.convertLead(lead.id) })
    expect(crm.current.revenue.actual).toBe(actual)
    expect(crm.current.revenue.forecast).toBeGreaterThan(forecast)
  })

  it('אי אפשר להמיר את אותו ליד פעמיים', () => {
    const crm = setup()
    const lead = crm.current.leads.find((l) => l.status === 'active')
    act(() => { crm.current.convertLead(lead.id) })
    const count = crm.current.clients.length
    let second
    act(() => { second = crm.current.convertLead(lead.id) })
    expect(second).toBeNull()
    expect(crm.current.clients).toHaveLength(count)
  })
})

describe('תשלומים (סעיף 8)', () => {
  it('תשלום אחרון באיחור ששולם מוריד את הלקוח מרשימת הסיכון', () => {
    const crm = setup()
    const overdue = crm.current.paymentStats.overduePayments[0]
    const clientId = overdue.clientId
    const clientOverdue = crm.current.payments.filter((p) => p.clientId === clientId && p.status === 'overdue')
    const collectedBefore = crm.current.paymentStats.collected

    act(() => { clientOverdue.forEach((p) => crm.current.markPaymentPaid(p.id)) })

    expect(crm.current.clients.find((c) => c.id === clientId).paymentStatus).toBe('paid')
    expect(crm.current.paymentStats.overduePayments.some((p) => p.clientId === clientId)).toBe(false)
    expect(crm.current.paymentStats.collected).toBeGreaterThan(collectedBefore)
  })

  it('גבייה + איחורים + ממתינים = סך החיוב החודשי', () => {
    const crm = setup()
    const s = crm.current.paymentStats
    expect(s.collected + s.overdueTotal + s.pendingTotal).toBe(s.billed)
  })
})

describe('הוצאות ורווח (סעיף 9)', () => {
  it('הוצאה חדשה מגדילה את הוצאות החודש בדיוק בסכום שלה', () => {
    const crm = setup()
    const before = crm.current.expensesThisMonth
    act(() => {
      crm.current.addExpense({ amount: 1234, categoryId: 'software', vendor: 'בדיקה', method: 'אשראי', enteredBy: 'בדיקה' })
    })
    expect(crm.current.expensesThisMonth).toBe(before + 1234)
    expect(crm.current.expenses[0].monthKey).toBe(currentMonthKey())
  })

  it('סדרת הרווח והפסד מתאימה לסכומים של החודש הנוכחי', () => {
    const crm = setup()
    const month = crm.current.financeSeries.find((m) => m.monthKey === currentMonthKey())
    expect(month.income).toBe(crm.current.paymentStats.billed)
    expect(month.expense).toBe(crm.current.expensesThisMonth)
  })
})

describe('קבלני משנה (סעיף 7)', () => {
  it('תשלום לקבלן מסמן את המשימה כשולמה ונרשם כהוצאה – פעם אחת בלבד', () => {
    const crm = setup()
    const task = crm.current.tasks.find((t) => t.fee && !t.feePaid)
    const before = crm.current.expensesThisMonth

    act(() => { crm.current.paySubTask(task.id) })
    act(() => { crm.current.paySubTask(task.id) })   // לחיצה כפולה לא משלמת פעמיים

    expect(crm.current.tasks.find((t) => t.id === task.id).feePaid).toBe(true)
    expect(crm.current.expensesThisMonth).toBe(before + task.fee)
    expect(crm.current.expenses[0]).toMatchObject({ categoryId: 'subcontractor', amount: task.fee })
  })

  it('הקצאת משימה לקבלן מקשרת אותה לכרטיס הקבלן', () => {
    const crm = setup()
    act(() => {
      crm.current.assignTask({
        title: 'באנר', clientId: crm.current.clients[0].id, assignee: 'רון לוי',
        subcontractorId: 2, fee: 300, dueAt: new Date(Date.now() + 86400000).toISOString(),
      })
    })
    expect(crm.current.tasks[0]).toMatchObject({ subcontractorId: 2, fee: 300, feePaid: false, status: 'open' })
  })
})

describe('משתמשים והרשאות (סעיף 2)', () => {
  it('הזמנה יוצרת משתמש "הוזמן" לתוקף 48 שעות, עם אימייל מנורמל', () => {
    const crm = setup()
    let user
    act(() => { user = crm.current.inviteUser({ name: 'דנה', email: '  Dana@Example.COM ', role: 'staff' }) })
    expect(user.email).toBe('dana@example.com')
    expect(user.status).toBe('invited')
    const hours = (new Date(user.inviteExpiresAt) - new Date(user.invitedAt)) / 3600000
    expect(hours).toBe(48)
    expect(crm.current.users.some((u) => u.id === user.id)).toBe(true)
  })

  it('חידוש הזמנה מאריך את התוקף מעכשיו', () => {
    const crm = setup()
    let user
    act(() => { user = crm.current.inviteUser({ name: 'דנה', email: 'd@x.co', role: 'staff' }) })
    act(() => { crm.current.updateUser(user.id, { inviteExpiresAt: '2020-01-01T00:00:00Z' }) })
    act(() => { crm.current.renewInvite(user.id) })
    const renewed = crm.current.users.find((u) => u.id === user.id)
    expect(new Date(renewed.inviteExpiresAt).getTime()).toBeGreaterThan(Date.now() + 47 * 3600000)
  })

  it('פתיחה וסגירה של מודול במטריצת ההרשאות', () => {
    const crm = setup()
    act(() => { crm.current.setRoleModule('staff', 'payments', true) })
    expect(crm.current.permissions.staff).toContain('payments')
    act(() => { crm.current.setRoleModule('staff', 'payments', false) })
    expect(crm.current.permissions.staff).not.toContain('payments')
  })
})

describe('משימות (סעיף 6)', () => {
  it('סימון משימה כהושלמה מוציא אותה מהמשימות הפתוחות ומהאיחורים', () => {
    const crm = setup()
    const late = crm.current.overdueTasks[0]
    act(() => { crm.current.updateTaskStatus(late.id, 'done') })
    expect(crm.current.openTasks.some((t) => t.id === late.id)).toBe(false)
    expect(crm.current.overdueTasks.some((t) => t.id === late.id)).toBe(false)
    expect(crm.current.tasks.find((t) => t.id === late.id).completedAt).toBeTruthy()
  })
})
